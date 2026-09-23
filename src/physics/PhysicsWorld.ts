import { SphereBody } from './SphereBody';
import { Integrator } from './Integrator';

export class PhysicsWorld {
    public readonly bodies: SphereBody[] = [];

    public readonly fixedTimeStep = 0.01;

    private accumulator = 0;

    private readonly integrator: Integrator;

    constructor() {
        this.integrator = new Integrator();
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

    private step(dt: number): void {
        for (const body of this.bodies) {
            this.integrator.integrate(
                body,
                dt
            );
        }
    }
}