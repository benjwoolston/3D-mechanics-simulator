import { PhysicsWorld } from '../physics/PhysicsWorld';

export class EnvironmentControls {
    private readonly world: PhysicsWorld;
    private readonly container: HTMLElement;
    private readonly onBoxResize: (width: number, height: number, depth: number) => void;

    constructor(
        world: PhysicsWorld,
        container: HTMLElement,
        onBoxResize: (width: number, height: number, depth: number) => void
    ) {
        this.world = world;
        this.container = container;
        this.onBoxResize = onBoxResize;
        this.createBoxSizeControl();
    }

    private createBoxSizeControl(): void {
        const wrapper = document.createElement('div');
        wrapper.style.marginTop = '12px';

        const heading = document.createElement('div');
        heading.textContent = 'Simulation Box Size';
        heading.style.marginBottom = '4px';

        const row = document.createElement('div');
        row.style.display = 'grid';
        row.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
        row.style.gap = '6px';

        const dimensions = [
            { name: 'Width', value: this.world.bounds.width },
            { name: 'Height', value: this.world.bounds.height },
            { name: 'Depth', value: this.world.bounds.depth }
        ];
        const inputs: HTMLInputElement[] = [];

        for (const dimension of dimensions) {
            const label = document.createElement('label');
            label.textContent = dimension.name;
            label.style.fontSize = '12px';

            const input = document.createElement('input');
            input.type = 'number';
            input.min = '1';
            input.max = '1000';
            input.step = '1';
            input.value = dimension.value.toString();
            input.style.width = '100%';
            input.style.boxSizing = 'border-box';
            inputs.push(input);
            label.appendChild(input);
            row.appendChild(label);

            input.addEventListener('change', () => {
                const largestRadius = Math.max(0, ...this.world.bodies.map(body => body.radius));
                const minimumDimension = Math.max(1, largestRadius * 2);

                for (const [index, control] of inputs.entries()) {
                    control.min = minimumDimension.toString();
                    const parsedValue = Number(control.value);
                    const value = Number.isFinite(parsedValue)
                        ? Math.max(minimumDimension, Math.min(1000, parsedValue))
                        : [this.world.bounds.width, this.world.bounds.height, this.world.bounds.depth][index];
                    control.value = value.toString();
                }

                this.onBoxResize(
                    Number(inputs[0].value),
                    Number(inputs[1].value),
                    Number(inputs[2].value)
                );
            });
        }

        wrapper.append(heading, row);
        this.container.appendChild(wrapper);
    }
}
