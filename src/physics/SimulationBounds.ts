export class SimulationBounds {
    public minX: number;
    public maxX: number;

    public minY: number;
    public maxY: number;

    public minZ: number;
    public maxZ: number;

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

    public setDimensions(width: number, height: number, depth: number): void {
        if (![width, height, depth].every(Number.isFinite) || width <= 0 || height <= 0 || depth <= 0) {
            throw new Error('Box dimensions must be finite positive numbers.');
        }

        this.minX = -width / 2;
        this.maxX = width / 2;
        this.minY = 0;
        this.maxY = height;
        this.minZ = -depth / 2;
        this.maxZ = depth / 2;
    }

    public get width(): number {
        return this.maxX - this.minX;
    }

    public get height(): number {
        return this.maxY - this.minY;
    }

    public get depth(): number {
        return this.maxZ - this.minZ;
    }
}