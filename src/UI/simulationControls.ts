import { PhysicsWorld } from '../physics/PhysicsWorld';
import { SphereBody } from '../physics/SphereBody';
import { ParticleDebugRenderer } from '../rendering/ParticleDebugRenderer';

export class SimulationControls {
    private readonly world: PhysicsWorld;
    private readonly body: SphereBody;
    private readonly debugRenderer: ParticleDebugRenderer;

    private paused = true;

    private readonly container: HTMLDivElement;

    constructor(
        world: PhysicsWorld,
        body: SphereBody,
        debugRenderer: ParticleDebugRenderer
    ) {
        this.world = world;
        this.body = body;
        this.debugRenderer = debugRenderer;

        this.container =
            document.createElement('div');

        this.createUI();

        document.body.appendChild(
            this.container
        );
    }

    private createUI(): void {
        this.container.style.position = 'fixed';
        this.container.style.top = '20px';
        this.container.style.right = '20px';
        this.container.style.width = '280px';
        this.container.style.padding = '16px';
        this.container.style.background =
            'rgba(0, 0, 0, 0.75)';
        this.container.style.color = 'white';
        this.container.style.fontFamily =
            'monospace';
        this.container.style.borderRadius =
            '8px';
        this.container.style.zIndex = '1000';

        const title =
            document.createElement('h2');

        title.textContent =
            'Simulation Controls';

        title.style.marginTop = '0';

        this.container.appendChild(title);

        this.createPauseButton();

        this.createSpeedControl();

        this.createGravityControl();

        this.createDiagnosticsControl();

        this.createBallControls();

        this.createRestitutionControl();
    }

    private createPauseButton(): void {
        const button =
            document.createElement('button');

        button.textContent = 'Pause';

        button.style.width = '100%';
        button.style.marginBottom = '12px';

        button.addEventListener(
            'click',
            () => {
                this.paused =
                    !this.paused;

                button.textContent =
                    this.paused
                        ? 'Resume'
                        : 'Pause';
            }
        );

        this.container.appendChild(
            button
        );
    }

    private createSpeedControl(): void {
        const label =
            document.createElement('label');

        label.textContent =
            'Simulation Speed';

        label.style.display = 'block';

        const select =
            document.createElement('select');

        const speeds = [
            0.25,
            0.5,
            1,
            2,
            4
        ];

        for (const speed of speeds) {
            const option =
                document.createElement('option');

            option.value =
                speed.toString();

            option.textContent =
                `${speed}×`;

            if (speed === 1) {
                option.selected = true;
            }

            select.appendChild(option);
        }

        select.addEventListener(
            'change',
            () => {
                this.world.simulationSpeed =
                    Number(select.value);
            }
        );

        label.appendChild(
            document.createElement('br')
        );

        label.appendChild(select);

        this.container.appendChild(
            label
        );
    }

    private createGravityControl(): void {
        const label =
            document.createElement('label');

        label.style.display = 'block';
        label.style.marginTop = '12px';

        const checkbox =
            document.createElement('input');

        checkbox.type = 'checkbox';
        checkbox.checked = true;

        checkbox.addEventListener(
            'change',
            () => {
                this.world.gravityEnabled =
                    checkbox.checked;
            }
        );

        label.appendChild(
            checkbox
        );

        label.append(
            ' Gravity enabled'
        );

        this.container.appendChild(
            label
        );
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

        heading.textContent =
            'Ball';

        this.container.appendChild(
            heading
        );

        this.createNumberInput(
            'Mass',
            0.1,
            10,
            0.1,
            this.body.mass,
            (value) => {
                this.body.mass = value;
            }
        );

        this.createNumberInput(
            'Radius',
            0.1,
            2,
            0.1,
            this.body.radius,
            (value) => {
                this.body.radius = value;
            }
        );

        this.createNumberInput(
            'Velocity X',
            -20,
            20,
            0.1,
            this.body.velocity[0],
            (value) => {
                this.body.velocity[0] =
                    value;
            }
        );

        this.createNumberInput(
            'Velocity Y',
            -20,
            20,
            0.1,
            this.body.velocity[1],
            (value) => {
                this.body.velocity[1] =
                    value;
            }
        );

        this.createNumberInput(
            'Velocity Z',
            -20,
            20,
            0.1,
            this.body.velocity[2],
            (value) => {
                this.body.velocity[2] =
                    value;
            }
        );
    }

    private createRestitutionControl(): void {
        const heading =
            document.createElement('h3');

        heading.textContent =
            'Wall Physics';

        this.container.appendChild(
            heading
        );

        this.createNumberInput(
            'Restitution',
            0,
            1,
            0.05,
            this.world.restitutionCoefficient,
            (value) => {
                this.world.restitutionCoefficient =
                    value;
            }
        );
    }

    private createNumberInput(
        name: string,
        min: number,
        max: number,
        step: number,
        initialValue: number,
        onChange: (value: number) => void
    ): void {
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
    }

    public isPaused(): boolean {
        return this.paused;
    }
}