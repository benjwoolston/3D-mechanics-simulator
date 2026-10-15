import { PhysicsWorld } from '../physics/PhysicsWorld';
import { SphereBody } from '../physics/SphereBody';
import { ParticleDebugRenderer } from '../rendering/ParticleDebugRenderer';

export interface SharedSimulationControls {
    paused: boolean;
}

export const MAX_BALL_COUNT = 10;

const BALL_COLORS = [
    { name: 'Blue', value: '#3399ff' },
    { name: 'Red', value: '#ff4d4d' },
    { name: 'Green', value: '#4caf50' },
    { name: 'Yellow', value: '#ffeb3b' },
    { name: 'Orange', value: '#ff9800' },
    { name: 'Purple', value: '#9c27b0' },
    { name: 'Pink', value: '#e91e63' },
    { name: 'Cyan', value: '#00bcd4' },
    { name: 'White', value: '#ffffff' },
    { name: 'Black', value: '#212121' },
    { name: 'Brown', value: '#795548' },
    { name: 'Lime', value: '#8bc34a' }
] as const;

export function createSharedSimulationControls(): SharedSimulationControls {
    return {
        paused: true
    };
}

export function createBallControlsDock(side: 'left' | 'right'): HTMLDivElement {
    const dock = document.createElement('div');
    Object.assign(dock.style, {
        position: 'fixed',
        [side]: '20px',
        top: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '10px',
        width: '220px',
        maxWidth: 'calc(100vw - 40px)',
        maxHeight: 'calc(100vh - 40px)',
        overflowY: 'auto',
        zIndex: '1000'
    });
    document.body.appendChild(dock);
    return dock;
}

export class SimulationSettingsControls {
    private readonly world: PhysicsWorld;
    private readonly sharedControls: SharedSimulationControls;
    private readonly onAddBall: () => void;
    private readonly container: HTMLDetailsElement;
    private readonly addBallButton: HTMLButtonElement;

    constructor(
        world: PhysicsWorld,
        sharedControls: SharedSimulationControls,
        onAddBall: () => void
    ) {
        this.world = world;
        this.sharedControls = sharedControls;
        this.onAddBall = onAddBall;
        this.container = document.createElement('details');
        this.addBallButton = document.createElement('button');
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
        this.createAddBallButton();
    }

    private createAddBallButton(): void {
        this.addBallButton.textContent = 'Add Ball';
        this.addBallButton.style.width = '100%';
        this.addBallButton.style.marginTop = '12px';
        this.addBallButton.addEventListener('click', this.onAddBall);
        this.container.appendChild(this.addBallButton);
    }

    public updateBallCount(count: number): void {
        const atLimit = count >= MAX_BALL_COUNT;
        this.addBallButton.disabled = atLimit;
        this.addBallButton.textContent = atLimit
            ? `Maximum ${MAX_BALL_COUNT} balls`
            : 'Add Ball';
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
    private readonly onRemove: () => void;
    private readonly title: string;
    private readonly onColorChange: (color: string) => void;
    private readonly parent: HTMLElement;

    private readonly container: HTMLDetailsElement;
    private summary!: HTMLElement;
    private ballHeading!: HTMLHeadingElement;

    constructor(
        world: PhysicsWorld,
        body: SphereBody,
        debugRenderer: ParticleDebugRenderer,
        title = 'Simulation Controls',
        sharedControls = createSharedSimulationControls(),
        onRemove: () => void = () => {},
        parent: HTMLElement = document.body,
        onColorChange: (color: string) => void = () => {}
    ) {
        this.world = world;
        this.body = body;
        this.debugRenderer = debugRenderer;
        this.title = title;
        this.sharedControls = sharedControls;
        this.onRemove = onRemove;
        this.parent = parent;
        this.onColorChange = onColorChange;

        this.container = document.createElement('details');

        this.createUI();

        this.parent.appendChild(
            this.container
        );
    }

    private createUI(): void {
        this.container.style.width = '100%';
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

        this.summary = document.createElement('summary');
        this.summary.textContent = this.title;
        this.summary.style.marginBottom = '0';
        this.summary.style.cursor = 'pointer';
        this.summary.style.fontWeight = 'bold';
        this.summary.style.userSelect = 'none';
        this.container.addEventListener('toggle', () => {
            this.summary.style.marginBottom = this.container.open ? '12px' : '0';
        });
        this.container.appendChild(this.summary);

        this.createDiagnosticsControl();
        this.createNameControl();
        this.createColorControl();
        this.createBallControls();
        this.createRemoveButton();
    }

    private createRemoveButton(): void {
        const button = document.createElement('button');
        button.textContent = 'Remove Ball';
        button.style.width = '100%';
        button.style.marginTop = '8px';
        button.addEventListener('click', this.onRemove);
        this.container.appendChild(button);
    }

    private createDiagnosticsControl(): void {
        const label =
            document.createElement('label');

        label.style.display = 'block';
        label.style.marginTop = '8px';

        const checkbox =
            document.createElement('input');

        checkbox.type = 'checkbox';
        checkbox.checked = false;
        this.debugRenderer.setVisible(false);

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

    private createNameControl(): void {
        const wrapper = document.createElement('div');
        wrapper.style.marginTop = '8px';

        const label = document.createElement('label');
        label.textContent = 'Ball name';
        label.style.display = 'block';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = this.title.replace(/ Controls$/, '');
        input.maxLength = 32;
        input.style.width = '100%';
        input.style.boxSizing = 'border-box';
        input.addEventListener('change', () => {
            const name = input.value.trim() || this.title.replace(/ Controls$/, '');
            input.value = name;
            this.summary.textContent = `${name} Controls`;
            this.ballHeading.textContent = name;
            this.debugRenderer.setName(name);
        });

        wrapper.append(label, input);
        this.container.appendChild(wrapper);
    }

    private createColorControl(): void {
        const wrapper = document.createElement('div');
        wrapper.style.marginTop = '8px';

        const label = document.createElement('label');
        label.textContent = 'Colour';
        label.style.display = 'block';

        const palette = document.createElement('div');
        palette.style.display = 'grid';
        palette.style.gridTemplateColumns = 'repeat(6, 1fr)';
        palette.style.gap = '4px';
        palette.style.marginTop = '8px';

        for (const color of BALL_COLORS) {
            const option = document.createElement('button');
            option.type = 'button';
            option.title = color.name;
            option.setAttribute('aria-label', color.name);
            option.style.width = '18px';
            option.style.height = '18px';
            option.style.minWidth = '0';
            option.style.padding = '0';
            option.style.borderRadius = '50%';
            option.style.backgroundColor = color.value;
            option.style.border = color.name === 'White'
                ? '2px solid #888'
                : '2px solid rgba(255, 255, 255, 0.7)';
            option.addEventListener('click', () => {
                this.onColorChange(color.value);
            });
            palette.appendChild(option);
        }

        wrapper.append(label, palette);
        this.container.appendChild(wrapper);
    }

    private createBallControls(): void {
        this.ballHeading = document.createElement('h3');
        this.ballHeading.textContent = this.title.replace(/ Controls$/, '');
        this.container.appendChild(this.ballHeading);

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

    public dispose(): void {
        this.container.remove();
    }
}