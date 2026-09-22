export class SphereBody {
    public position: [number, number, number];
    public velocity: [number, number, number];

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
        this.mass = mass;
        this.radius = radius;
    }
}