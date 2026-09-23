export class SphereBody {
    public position: [number, number, number];
    public velocity: [number, number, number];
    public acceleration: [number, number, number];

    public mass: number;
    public radius: number;

    constructor(
        position: [number, number, number],
        velocity: [number, number, number],
        mass: number,
        radius: number
    ) {
        this.position = position;
        this.velocity = velocity;
        this.acceleration = [0, 0, 0];
        this.mass = mass;
        this.radius = radius;
    }
}