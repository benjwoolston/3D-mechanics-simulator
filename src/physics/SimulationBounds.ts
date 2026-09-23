export class SimulationBounds {
    public readonly minX: number;
    public readonly maxX: number;

    public readonly minY: number;
    public readonly maxY: number;

    public readonly minZ: number;
    public readonly maxZ: number;

    constructor(
        minX: number,
        maxX: number,
        minY: number,
        maxY: number,
        minZ: number,
        maxZ: number
    ) {
        if (minX >= maxX) {
            throw new Error(
                'minX must be less than maxX.'
            );
        }

        if (minY >= maxY) {
            throw new Error(
                'minY must be less than maxY.'
            );
        }

        if (minZ >= maxZ) {
            throw new Error(
                'minZ must be less than maxZ.'
            );
        }

        this.minX = minX;
        this.maxX = maxX;

        this.minY = minY;
        this.maxY = maxY;

        this.minZ = minZ;
        this.maxZ = maxZ;
    }
}