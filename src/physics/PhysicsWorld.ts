import { SphereBody } from './SphereBody';
import { CollisionInfo, SphereCollision } from './SphereCollision';
import { Integrator } from './Integrator';
import { Gravity } from './Gravity';
import { SimulationBounds } from './SimulationBounds';
import { and } from 'three/tsl';

export class PhysicsWorld {
    public readonly bodies: SphereBody[] = [];

    public collisions: CollisionInfo[] = [];

    public readonly fixedTimeStep = 0.01;

    private readonly sphereCollision = new SphereCollision();

    private readonly gravity: Gravity;

    private accumulator = 0;

    public gravityEnabled = true;

    private readonly integrator: Integrator;

    public readonly bounds: SimulationBounds;

    public simulationSpeed = 1.0;

    public restitutionCoefficient: number;

    constructor(gravity:number = 9.80665, bounds: SimulationBounds,restitutionCoefficient: number = 1.0) {
        this.gravity = new Gravity();
        this.integrator = new Integrator();
        this.bounds = bounds;
        this.restitutionCoefficient = restitutionCoefficient;
    }

    public addBody(body: SphereBody): void {
        this.bodies.push(body);
    }

    public update(deltaTime: number): void {
        const timespeed = deltaTime * this.simulationSpeed;
        this.accumulator += Math.min(timespeed, 0.1);

        while (this.accumulator >= this.fixedTimeStep) {
            this.step(this.fixedTimeStep);

            this.accumulator -= this.fixedTimeStep;
        }
    }
    private calculateAccelerations(): void {
        for (const body of this.bodies) {
            body.acceleration = [0, 0, 0];

            if (this.gravityEnabled) {
                this.gravity.apply(
                    body.acceleration
                );
            }
        }
    }

    private step(dt: number): void {
        this.calculateAccelerations();

        for (const body of this.bodies) {
            this.integrator.integrate(body,dt);

            this.handleWallCollisions(body);
        }
    
    }

    private handleWallCollisions(body: SphereBody): void {
        const radius = body.radius;

        if (body.position[0] - radius < this.bounds.minX && body.velocity[0] < 0) {
            body.position[0] = this.bounds.minX + radius;
            body.velocity[0] *= -this.restitutionCoefficient;
        } else if (body.position[0] + radius > this.bounds.maxX && body.velocity[0] > 0) {
            body.position[0] = this.bounds.maxX - radius;
            body.velocity[0] *= -this.restitutionCoefficient;
        }

        if (body.position[1] - radius < this.bounds.minY && body.velocity[1] < 0) {
            body.position[1] = this.bounds.minY + radius;
            body.velocity[1] *= -this.restitutionCoefficient;
        } else if (body.position[1] + radius > this.bounds.maxY && body.velocity[1] > 0) {
            body.position[1] = this.bounds.maxY - radius;
            body.velocity[1] *= -this.restitutionCoefficient;
        }

        if (body.position[2] - radius < this.bounds.minZ && body.velocity[2] < 0) {
            body.position[2] = this.bounds.minZ + radius;
            body.velocity[2] *= -this.restitutionCoefficient;
        } else if (body.position[2] + radius > this.bounds.maxZ && body.velocity[2] > 0) {
            body.position[2] = this.bounds.maxZ - radius;
            body.velocity[2] *= -this.restitutionCoefficient;
        }
    }

    public detectSphereCollisions(): number {
        this.collisions = [];

        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const collision = this.sphereCollision.detect(
                    this.bodies[i],
                    this.bodies[j]
                );

                if (collision) {
                    this.collisions.push(collision);
                }
            }
        }

        return this.collisions.length;
    }

}