import { SphereBody } from './SphereBody';

export class Integrator {
    public integrate(
        body: SphereBody,
        dt: number
    ): void {

        body.velocity[0] += body.acceleration[0] * dt;
        body.velocity[1] += body.acceleration[1] * dt;
        body.velocity[2] += body.acceleration[2] * dt;  

        body.position[0] += body.velocity[0] * dt;
        body.position[1] += body.velocity[1] * dt;
        body.position[2] += body.velocity[2] * dt;
    }
}