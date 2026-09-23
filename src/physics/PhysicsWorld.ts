import { SphereBody } from './SphereBody';
import { Integrator } from './Integrator';
import { Gravity } from './Gravity';
import { SimulationBounds } from './SimulationBounds';
import { and } from 'three/tsl';

export class PhysicsWorld {
    public readonly bodies: SphereBody[] = [];

    public readonly fixedTimeStep = 0.01;

    private readonly gravity: Gravity;

    private accumulator = 0;

    private readonly integrator: Integrator;

    public readonly bounds: SimulationBounds;

    constructor(gravity:number = 9.80665, bounds: SimulationBounds) {
        this.gravity = new Gravity();
        this.integrator = new Integrator();
        this.bounds = bounds;
    }

    public addBody(body: SphereBody): void {
        this.bodies.push(body);
    }

    public update(deltaTime: number): void {
        this.accumulator += Math.min(deltaTime, 0.1);

        while (this.accumulator >= this.fixedTimeStep) {
            this.step(this.fixedTimeStep);

            this.accumulator -= this.fixedTimeStep;
        }
    }
    private calculateAccelerations(): void {
        for (const body of this.bodies) {
            body.acceleration = [0, 0, 0];

            this.gravity.apply(
                body.acceleration
            );
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
            body.velocity[0] *= -1;
        } else if (body.position[0] + radius > this.bounds.maxX && body.velocity[0] > 0) {
            body.position[0] = this.bounds.maxX - radius;
            body.velocity[0] *= -1;
        }

        if (body.position[1] - radius < this.bounds.minY && body.velocity[1] < 0) {
            body.position[1] = this.bounds.minY + radius;
            body.velocity[1] *= -1;
        } else if (body.position[1] + radius > this.bounds.maxY && body.velocity[1] > 0) {
            body.position[1] = this.bounds.maxY - radius;
            body.velocity[1] *= -1;
        }

        if (body.position[2] - radius < this.bounds.minZ && body.velocity[2] < 0) {
            body.position[2] = this.bounds.minZ + radius;
            body.velocity[2] *= -1;
        } else if (body.position[2] + radius > this.bounds.maxZ && body.velocity[2] > 0) {
            body.position[2] = this.bounds.maxZ - radius;
            body.velocity[2] *= -1;
        }
}
}