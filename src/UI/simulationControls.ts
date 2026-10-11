import { PhysicsWorld } from '../physics/PhysicsWorld';
import { SphereBody } from '../physics/SphereBody';
import { ParticleDebugRenderer } from '../rendering/ParticleDebugRenderer';

export interface SharedSimulationControls {
    paused: boolean;
}

export function createSharedSimulationControls(): SharedSimulationControls {
    return {
        paused: true
    };
}

export class SimulationSettingsControls {
    private readonly world: PhysicsWorld;
    private readonly sharedControls: SharedSimulationControls;
    private readonly container: HTMLDetailsElement;

    constructor(world: PhysicsWorld, sharedControls: SharedSimulationControls) {
        this.world = world;
        this.sharedControls = sharedControls;
        this.container = document.createElement('details');
        this.createUI();
        document.body.appendChild(this.container);
    }

    private createUI(): void {
        this.container.open = true;
        Object.assign(this.container.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '280px',
            maxWidth: 'calc(100vw - 40px)',
            maxHeight: 'calc(100vh - 40px)',
            overflowY: 'auto',
            boxSizing: 'border-box',
            padding: '16px',
            background: 'rgba(0, 0, 0, 0.75)',
            color: 'white',
            fontFamily: 'monospace',
            borderRadius: '8px',
            zIndex: '1000'
        });

        const summary = document.createElement('summary');
        summary.textContent = 'Simulation Settings';
        summary.style.marginBottom = '12px';
        summary.style.cursor = 'pointer';
        summary.style.fontWeight = 'bold';
        this.container.appendChild(summary);

        this.createPauseButton();
        this.createSpeedControl();
        this.createGravityControl();
        this.createRestitutionControl();
    }

    private createPauseButton(): void {
        const button = document.createElement('button');
        button.textContent = this.sharedControls.paused ? 'Play' : 'Pause';
        button.style.width = '100%';
        button.style.marginBottom = '12px';
        button.addEventListener('click', () => {
            this.sharedControls.paused = !this.sharedControls.paused;
            button.textContent = this.sharedControls.paused ? 'Play' : 'Pause';
        });
        this.container.appendChild(button);
    }

    private createSpeedControl(): void {
        const label = document.createElement('label');
        label.textContent = 'Simulation Speed';
        label.style.display = 'block';

        const select = document.createElement('select');
        for (const speed of [0.1, 0.25, 0.5, 1, 2, 4, 8]) {
            const option = document.createElement('option');
            option.value = speed.toString();
            option.textContent = `${speed}×`;
            option.selected = speed === this.world.simulationSpeed;
            select.appendChild(option);
        }
        select.addEventListener('change', () => {
            this.world.simulationSpeed = Number(select.value);
        });

        label.append(document.createElement('br'), select);
        this.container.appendChild(label);
    }

    private createGravityControl(): void {
        const label = document.createElement('label');
        label.style.display = 'block';
        label.style.marginTop = '12px';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = this.world.gravityEnabled;
        checkbox.addEventListener('change', () => {
            this.world.gravityEnabled = checkbox.checked;
        });

        label.append(checkbox, ' Gravity enabled');
        this.container.appendChild(label);
    }

    private createRestitutionControl(): void {
        const wrapper = document.createElement('div');
        wrapper.style.marginTop = '12px';

        const label = document.createElement('label');
        label.textContent = 'Restitution';
        label.style.display = 'block';

        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.max = '1';
        input.step = '0.05';
        input.value = this.world.restitutionCoefficient.toString();
        input.style.width = '100%';
        input.style.boxSizing = 'border-box';
        input.addEventListener('change', () => {
            let value = Number(input.value);
            if (!Number.isFinite(value)) {
                value = this.world.restitutionCoefficient;
            }
            value = Math.max(0, Math.min(1, value));
            this.world.restitutionCoefficient = value;
            input.value = value.toString();
        });

        wrapper.append(label, input);
        this.container.appendChild(wrapper);
    }
}

export class SimulationControls {
    private readonly world: PhysicsWorld;
    private readonly body: SphereBody;
    private readonly debugRenderer: ParticleDebugRenderer;
    private readonly sharedControls: SharedSimulationControls;
    private readonly title: string;
    private readonly side: 'left' | 'right';

    private readonly container: HTMLDetailsElement;

    constructor(
        world: PhysicsWorld,
        body: SphereBody,
        debugRenderer: ParticleDebugRenderer,
        title = 'Simulation Controls',
        side: 'left' | 'right' = 'right',
        sharedControls = createSharedSimulationControls()
    ) {
        this.world = world;
        this.body = body;
        this.debugRenderer = debugRenderer;
        this.title = title;
        this.side = side;
        this.sharedControls = sharedControls;

        this.container = document.createElement('details');

        this.createUI();

        document.body.appendChild(
            this.container
        );
    }

    private createUI(): void {
        this.container.style.position = 'fixed';
        this.container.style.top = '20px';
        this.container.style[this.side] = '20px';
        this.container.style.width = '280px';
        this.container.style.maxWidth = 'calc(100vw - 40px)';
        this.container.style.maxHeight = 'calc(100vh - 40px)';
        this.container.style.overflowY = 'auto';
        this.container.style.boxSizing = 'border-box';
        this.container.style.padding = '16px';
        this.container.style.background =
            'rgba(0, 0, 0, 0.75)';
        this.container.style.color = 'white';
        this.container.style.fontFamily =
            'monospace';
        this.container.style.borderRadius =
            '8px';
        this.container.style.zIndex = '1000';

        const summary = document.createElement('summary');
        summary.textContent = this.title;
        summary.style.marginBottom = '12px';
        summary.style.cursor = 'pointer';
        summary.style.fontWeight = 'bold';
        summary.style.userSelect = 'none';
        this.container.appendChild(summary);

        this.createDiagnosticsControl();

        this.createBallControls();
    }

    private createDiagnosticsControl(): void {
        const label =
            document.createElement('label');

        label.style.display = 'block';
        label.style.marginTop = '8px';

        const checkbox =
            document.createElement('input');

        checkbox.type = 'checkbox';
        checkbox.checked = true;

        checkbox.addEventListener(
            'change',
            () => {
                this.debugRenderer.setVisible(
                    checkbox.checked
                );
            }
        );

        label.appendChild(
            checkbox
        );

        label.append(
            ' Diagnostics visible'
        );

        this.container.appendChild(
            label
        );
    }

    private createBallControls(): void {
        const heading =
            document.createElement('h3');

        heading.textContent = this.title.replace(' Controls', '');

        this.container.appendChild(
            heading
        );

        const maximumRadius = Math.min(
            this.world.bounds.maxX - this.world.bounds.minX,
            this.world.bounds.maxY - this.world.bounds.minY,
            this.world.bounds.maxZ - this.world.bounds.minZ
        ) / 2;

        this.createVectorInputs('Position', this.body.position, [
            [this.world.bounds.minX + this.body.radius, this.world.bounds.maxX - this.body.radius],
            [this.world.bounds.minY + this.body.radius, this.world.bounds.maxY - this.body.radius],
            [this.world.bounds.minZ + this.body.radius, this.world.bounds.maxZ - this.body.radius]
        ]);

        this.createNumberInput(
            'Mass',
            0.01,
            1000,
            0.1,
            this.body.mass,
            (value) => {
                this.body.mass = value;
            }
        );

        this.createNumberInput(
            'Radius',
            0.1,
            maximumRadius,
            0.1,
            this.body.radius,
            (value) => {
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
    ): void {
        const wrapper = document.createElement('div');
        wrapper.style.marginBottom = '8px';

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

                value = Math.max(ranges[index][0], Math.min(ranges[index][1], value));
                input.value = value.toString();
                vector[index] = value;
            });

            axisLabel.appendChild(input);
            row.appendChild(axisLabel);
        }

        wrapper.append(heading, row);
        this.container.appendChild(wrapper);
    }

    private createNumberInput(
        name: string,
        min: number,
        max: number,
        step: number,
        initialValue: number,
        onChange: (value: number) => void
    ): HTMLInputElement {
        const wrapper =
            document.createElement('div');

        wrapper.style.marginBottom =
            '8px';

        const label =
            document.createElement('label');

        label.textContent =
            name;

        label.style.display =
            'block';

        const input =
            document.createElement('input');

        input.type = 'number';
        input.min = min.toString();
        input.max = max.toString();
        input.step = step.toString();
        input.value =
            initialValue.toString();

        input.style.width = '100%';
        input.style.boxSizing =
            'border-box';

        input.addEventListener(
            'change',
            () => {
                let value =
                    Number(input.value);

                if (!Number.isFinite(value)) {
                    value = initialValue;
                }

                value =
                    Math.max(
                        min,
                        Math.min(max, value)
                    );

                input.value =
                    value.toString();

                onChange(value);
            }
        );

        label.appendChild(input);
        wrapper.appendChild(label);

        this.container.appendChild(
            wrapper
        );

        return input;
    }

    public isPaused(): boolean {
        return this.sharedControls.paused;
    }
}