export class Gravity {
    public readonly acceleration: [
        number,
        number,
        number
    ];
    private magnitudeValue: number;
    private direction: -1 | 1;

    constructor(
        gravity: number = 9.80665
    ) {
        if (!Number.isFinite(gravity)) {
            throw new RangeError('Gravity must be finite.');
        }

        this.magnitudeValue = Math.abs(gravity);
        this.direction = gravity >= 0 ? -1 : 1;
        this.acceleration = [0, this.direction * this.magnitudeValue, 0];
    }

    public get magnitude(): number {
        return this.magnitudeValue;
    }

    public get isDownward(): boolean {
        return this.direction === -1;
    }

    public setMagnitude(value: number): void {
        if (!Number.isFinite(value) || value < 0) {
            throw new RangeError('Gravity magnitude must be finite and non-negative.');
        }

        this.magnitudeValue = value;
        this.updateAcceleration();
    }

    public flipDirection(): void {
        this.direction = this.direction === -1 ? 1 : -1;
        this.updateAcceleration();
    }

    private updateAcceleration(): void {
        this.acceleration[1] = this.direction * this.magnitudeValue;
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