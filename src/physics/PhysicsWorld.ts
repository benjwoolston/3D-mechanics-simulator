import { SphereBody } from './SphereBody';
import { SphereCollision, type CollisionInfo } from './SphereCollision';
import { Integrator } from './Integrator';
import { Gravity } from './Gravity';
import { SimulationBounds } from './SimulationBounds';

export class PhysicsWorld {
    public readonly bodies: SphereBody[] = [];
    public collisions: CollisionInfo[] = [];
    private readonly sphereRestitutions = new Map<SphereBody, Map<SphereBody, number>>();
    public readonly fixedTimeStep = 0.01;
    private readonly restingSpeedThreshold = 0.05;
    private readonly sphereCollision = new SphereCollision();
    private readonly gravity: Gravity;
    private accumulator = 0;
    public gravityEnabled = true;
    private readonly integrator: Integrator;
    public readonly bounds: SimulationBounds;
    public simulationSpeed = 1.0;
    public restitutionCoefficient: number;

    constructor(
        gravity: number = 9.80665,
        bounds: SimulationBounds,
        restitutionCoefficient: number = 1.0
    ) {
        this.gravity = new Gravity(gravity);
        this.integrator = new Integrator();
        this.bounds = bounds;
        this.restitutionCoefficient = restitutionCoefficient;
    }

    public addBody(body: SphereBody): void {
        this.bodies.push(body);
    }

    public removeBody(body: SphereBody): void {
        const bodyIndex = this.bodies.indexOf(body);
        if (bodyIndex === -1) {
            return;
        }

        this.bodies.splice(bodyIndex, 1);
        this.collisions = this.collisions.filter(
            collision => collision.bodyA !== body && collision.bodyB !== body
        );
        this.sphereRestitutions.delete(body);
        for (const pairSettings of this.sphereRestitutions.values()) {
            pairSettings.delete(body);
        }
    }

    public setBoundsDimensions(width: number, height: number, depth: number): void {
        this.bounds.setDimensions(width, height, depth);

        for (const body of this.bodies) {
            body.position[0] = Math.max(
                this.bounds.minX + body.radius,
                Math.min(this.bounds.maxX - body.radius, body.position[0])
            );
            body.position[1] = Math.max(
                this.bounds.minY + body.radius,
                Math.min(this.bounds.maxY - body.radius, body.position[1])
            );
            body.position[2] = Math.max(
                this.bounds.minZ + body.radius,
                Math.min(this.bounds.maxZ - body.radius, body.position[2])
            );
        }
    }

    public getSphereRestitution(bodyA: SphereBody, bodyB: SphereBody): number {
        return this.sphereRestitutions.get(bodyA)?.get(bodyB)
            ?? this.sphereRestitutions.get(bodyB)?.get(bodyA)
            ?? this.restitutionCoefficient;
    }

    public setSphereRestitution(bodyA: SphereBody, bodyB: SphereBody, value: number): void {
        let pairSettings = this.sphereRestitutions.get(bodyA);
        if (!pairSettings) {
            pairSettings = new Map<SphereBody, number>();
            this.sphereRestitutions.set(bodyA, pairSettings);
        }

        pairSettings.set(bodyB, value);
    }

    public update(deltaTime: number): void {
        this.collisions = [];
        const scaledDeltaTime = deltaTime * this.simulationSpeed;
        this.accumulator += Math.min(scaledDeltaTime, 0.1);

        while (this.accumulator >= this.fixedTimeStep) {
            this.step(this.fixedTimeStep);
            this.accumulator -= this.fixedTimeStep;
        }
    }

    private calculateAccelerations(): void {
        for (const body of this.bodies) {
            body.acceleration = [0, 0, 0];

            if (this.gravityEnabled) {
                this.gravity.apply(body.acceleration);
            }
        }
    }

    private step(dt: number): void {
        this.calculateAccelerations();

        for (const body of this.bodies) {
            this.integrator.integrate(body, dt);
            this.handleWallCollisions(body);
        }

        const collisions = this.SphereCollisionsCheck();
        for (const collision of collisions) {
            // Keep one record per body pair across all fixed steps in this update.
            if (!this.collisions.some(
                recorded => recorded.bodyA === collision.bodyA && recorded.bodyB === collision.bodyB
            )) {
                this.collisions.push(collision);
            }
        }
        this.resolveSphereCollisions(collisions);
    }

    private handleWallCollisions(body: SphereBody): void {
        const radius = body.radius;

        if (body.position[0] - radius < this.bounds.minX && body.velocity[0] < 0) {
            body.position[0] = this.bounds.minX + radius;
            this.bounceFromWall(body, 0);
        } else if (body.position[0] + radius > this.bounds.maxX && body.velocity[0] > 0) {
            body.position[0] = this.bounds.maxX - radius;
            this.bounceFromWall(body, 0);
        }

        if (body.position[1] - radius < this.bounds.minY && body.velocity[1] < 0) {
            body.position[1] = this.bounds.minY + radius;
            this.bounceFromWall(body, 1);
        } else if (body.position[1] + radius > this.bounds.maxY && body.velocity[1] > 0) {
            body.position[1] = this.bounds.maxY - radius;
            this.bounceFromWall(body, 1);
        }

        if (body.position[2] - radius < this.bounds.minZ && body.velocity[2] < 0) {
            body.position[2] = this.bounds.minZ + radius;
            this.bounceFromWall(body, 2);
        } else if (body.position[2] + radius > this.bounds.maxZ && body.velocity[2] > 0) {
            body.position[2] = this.bounds.maxZ - radius;
            this.bounceFromWall(body, 2);
        }
    }

    private bounceFromWall(body: SphereBody, axis: 0 | 1 | 2): void {
        body.velocity[axis] *= -this.restitutionCoefficient;

        const accelerationPerStep = Math.abs(body.acceleration[axis]) * this.fixedTimeStep;
        const restingThreshold = Math.max(this.restingSpeedThreshold, accelerationPerStep);
        if (Math.abs(body.velocity[axis]) <= restingThreshold) {
            body.velocity[axis] = 0;
        }
    }

    public SphereCollisionsCount(): number {
        this.collisions = this.SphereCollisionsCheck();
        return this.collisions.length;
    }

    private SphereCollisionsCheck(): CollisionInfo[] {
        const collisions: CollisionInfo[] = [];

        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const collision = this.sphereCollision.detect(
                    this.bodies[i],
                    this.bodies[j]
                );

                if (collision) {
                    collisions.push(collision);
                }
            }
        }

        return collisions;
    }

    public resolveSphereCollisions(collisions: CollisionInfo[]): number {
        for (const collision of collisions) {
            this.sphereCollision.resolveCollision(
                collision,
                this.getSphereRestitution(collision.bodyA, collision.bodyB)
            );
        }

        return collisions.length;
    }
}