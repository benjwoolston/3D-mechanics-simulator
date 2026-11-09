import { PhysicsWorld } from '../physics/PhysicsWorld';
import { SphereBody } from '../physics/SphereBody';

export class BallPhysicsControls {
    private readonly world: PhysicsWorld;
    private readonly body: SphereBody;
    private readonly container: HTMLElement;
    private readonly positionInputs: HTMLInputElement[] = [];

    constructor(world: PhysicsWorld, body: SphereBody, container: HTMLElement) {
        this.world = world;
        this.body = body;
        this.container = container;
        this.createBallControls();
    }

    private createBallControls(): void {
        const maximumRadius = Math.min(
            this.world.bounds.maxX - this.world.bounds.minX,
            this.world.bounds.maxY - this.world.bounds.minY,
            this.world.bounds.maxZ - this.world.bounds.minZ
        ) / 2;

        this.positionInputs.push(...this.createVectorInputs('Position', this.body.position, [
            [this.world.bounds.minX + this.body.radius, this.world.bounds.maxX - this.body.radius],
            [this.world.bounds.minY + this.body.radius, this.world.bounds.maxY - this.body.radius],
            [this.world.bounds.minZ + this.body.radius, this.world.bounds.maxZ - this.body.radius]
        ]));

        this.createNumberInput(
            'Mass',
            0.01,
            1000,
            0.1,
            this.body.mass,
            value => {
                this.body.mass = value;
            }
        );

        this.createNumberInput(
            'Radius',
            0.1,
            maximumRadius,
            0.1,
            this.body.radius,
            value => {
                this.body.radius = value;
            }
        );

        this.createVectorInputs('Velocity', this.body.velocity, [
            [-100, 100],
            [-100, 100],
            [-100, 100]
        ]);
    }

    private createVectorInputs(
        name: string,
        vector: [number, number, number],
        ranges: [[number, number], [number, number], [number, number]]
    ): HTMLInputElement[] {
        const wrapper = document.createElement('div');
        wrapper.style.marginBottom = '8px';
        const inputs: HTMLInputElement[] = [];

        const heading = document.createElement('label');
        heading.textContent = name;
        heading.style.display = 'block';

        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '6px';

        for (const [index, axis] of ['X', 'Y', 'Z'].entries()) {
            const axisLabel = document.createElement('label');
            axisLabel.textContent = axis;
            axisLabel.style.display = 'flex';
            axisLabel.style.alignItems = 'center';
            axisLabel.style.gap = '3px';
            axisLabel.style.minWidth = '0';
            axisLabel.style.flex = '1';

            const input = document.createElement('input');
            input.type = 'number';
            input.min = ranges[index][0].toString();
            input.max = ranges[index][1].toString();
            input.step = '0.1';
            input.value = vector[index].toString();
            input.style.width = '100%';
            input.style.minWidth = '0';
            input.style.boxSizing = 'border-box';
            input.setAttribute('aria-label', `${name} ${axis}`);
            input.addEventListener('change', () => {
                let value = Number(input.value);
                if (!Number.isFinite(value)) {
                    value = vector[index];
                }

                const min = Number(input.min);
                const max = Number(input.max);
                value = Math.max(min, Math.min(max, value));
                input.value = value.toString();
                vector[index] = value;
            });

            inputs.push(input);
            axisLabel.appendChild(input);
            row.appendChild(axisLabel);
        }

        wrapper.append(heading, row);
        this.container.appendChild(wrapper);
        return inputs;
    }

    public refreshPositionBounds(): void {
        const axisBounds = [
            [this.world.bounds.minX + this.body.radius, this.world.bounds.maxX - this.body.radius],
            [this.world.bounds.minY + this.body.radius, this.world.bounds.maxY - this.body.radius],
            [this.world.bounds.minZ + this.body.radius, this.world.bounds.maxZ - this.body.radius]
        ];

        for (const [index, input] of this.positionInputs.entries()) {
            input.min = axisBounds[index][0].toString();
            input.max = axisBounds[index][1].toString();
            input.value = this.body.position[index].toString();
        }
    }

    private createNumberInput(
        name: string,
        min: number,
        max: number,
        step: number,
        initialValue: number,
        onChange: (value: number) => void
    ): HTMLInputElement {
        const wrapper = document.createElement('div');
        wrapper.style.marginBottom = '8px';

        const label = document.createElement('label');
        label.textContent = name;
        label.style.display = 'block';

        const input = document.createElement('input');
        input.type = 'number';
        input.min = min.toString();
        input.max = max.toString();
        input.step = step.toString();
        input.value = initialValue.toString();
        input.style.width = '100%';
        input.style.boxSizing = 'border-box';
        input.addEventListener('change', () => {
            let value = Number(input.value);
            if (!Number.isFinite(value)) {
                value = initialValue;
            }

            value = Math.max(min, Math.min(max, value));
            input.value = value.toString();
            onChange(value);
        });

        label.appendChild(input);
        wrapper.appendChild(label);
        this.container.appendChild(wrapper);

        return input;
    }
}
