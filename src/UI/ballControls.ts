import { PhysicsWorld } from '../physics/PhysicsWorld';
import { SphereBody } from '../physics/SphereBody';
import { ParticleDebugRenderer } from '../rendering/ParticleDebugRenderer';
import { createSharedSimulationControls, type SharedSimulationControls } from './simulationControls';
import { BallAppearanceControls } from './ballAppearanceControls';
import { BallPhysicsControls } from './ballPhysicsControls';

export class SimulationControls {
    private readonly sharedControls: SharedSimulationControls;
    private readonly onRemove: () => void;
    private readonly parent: HTMLElement;

    private readonly container: HTMLDetailsElement;
    private summary!: HTMLElement;
    private physicsControls!: BallPhysicsControls;

    constructor(
        world: PhysicsWorld,
        body: SphereBody,
        debugRenderer: ParticleDebugRenderer,
        title = 'Simulation Controls',
        sharedControls = createSharedSimulationControls(),
        onRemove: () => void = () => {},
        parent: HTMLElement = document.body,
        onColorChange: (color: string) => void = () => {},
        onNameChange: (name: string) => void = () => {}
    ) {
        this.sharedControls = sharedControls;
        this.onRemove = onRemove;
        this.parent = parent;

        this.container = document.createElement('details');
        this.container.className = 'ball-control-panel';

        this.createUI(world, body, debugRenderer, title, onColorChange, onNameChange);

        this.parent.appendChild(
            this.container
        );
    }

    private createUI(
        world: PhysicsWorld,
        body: SphereBody,
        debugRenderer: ParticleDebugRenderer,
        title: string,
        onColorChange: (color: string) => void,
        onNameChange: (name: string) => void
    ): void {
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
        this.summary.textContent = title;
        this.summary.style.marginBottom = '0';
        this.summary.style.cursor = 'pointer';
        this.summary.style.fontWeight = 'bold';
        this.summary.style.userSelect = 'none';
        this.container.addEventListener('toggle', () => {
            this.summary.style.marginBottom = this.container.open ? '12px' : '0';
        });
        this.container.appendChild(this.summary);

        new BallAppearanceControls(
            this.container,
            this.summary,
            debugRenderer,
            title,
            onColorChange,
            onNameChange
        );
        this.physicsControls = new BallPhysicsControls(world, body, this.container);
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

    public refreshPositionBounds(): void {
        this.physicsControls.refreshPositionBounds();
    }

    public isPaused(): boolean {
        return this.sharedControls.paused;
    }

    public dispose(): void {
        this.container.remove();
    }
}