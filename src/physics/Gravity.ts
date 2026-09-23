export class Gravity {
    public readonly acceleration: [
        number,
        number,
        number
    ];

    constructor(
        gravity: number = 9.80665
    ) {
        this.acceleration = [0,-gravity,0];
    }

    public apply(
        acceleration: [number, number, number]
    ): void {
        acceleration[0] +=
            this.acceleration[0];

        acceleration[1] +=
            this.acceleration[1];

        acceleration[2] +=
            this.acceleration[2];
    }
}