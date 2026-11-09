import { PhysicsWorld } from '../physics/PhysicsWorld';
import { EnvironmentControls } from './environmentControls';
import { WallRestitutionControls } from './restitutionControls';

export interface SharedSimulationControls {
    paused: boolean;
}

export const MAX_BALL_COUNT = 10;

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
    private readonly onBoxResize: (width: number, height: number, depth: number) => void;
    private readonly container: HTMLDetailsElement;
    private readonly addBallButton: HTMLButtonElement;

    constructor(
        world: PhysicsWorld,
        sharedControls: SharedSimulationControls,
        onAddBall: () => void,
        onBoxResize: (width: number, height: number, depth: number) => void
    ) {
        this.world = world;
        this.sharedControls = sharedControls;
        this.onAddBall = onAddBall;
        this.onBoxResize = onBoxResize;
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
        new WallRestitutionControls(this.world, this.container);
        new EnvironmentControls(this.world, this.container, this.onBoxResize);
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
}
