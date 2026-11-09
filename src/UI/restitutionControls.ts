import { PhysicsWorld } from '../physics/PhysicsWorld';
import { SphereBody } from '../physics/SphereBody';

export class WallRestitutionControls {
    private readonly world: PhysicsWorld;
    private readonly container: HTMLElement;

    constructor(world: PhysicsWorld, container: HTMLElement) {
        this.world = world;
        this.container = container;
        this.createRestitutionControl();
    }

    private createRestitutionControl(): void {
        const wrapper = document.createElement('div');
        wrapper.style.marginTop = '12px';

        const label = document.createElement('label');
        label.textContent = 'Wall Restitution';
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

export class SphereRestitutionControls {
    private readonly world: PhysicsWorld;
    private readonly getBallName: (body: SphereBody) => string;
    private readonly container: HTMLDivElement;
    private readonly ballPanels: HTMLDivElement;
    private readonly panels = new Map<SphereBody, HTMLDetailsElement>();
    private activeBody: SphereBody | undefined;
    private readonly pairInputs: {
        bodyA: SphereBody;
        bodyB: SphereBody;
        input: HTMLInputElement;
        output: HTMLOutputElement;
    }[] = [];

    constructor(world: PhysicsWorld, getBallName: (body: SphereBody) => string) {
        this.world = world;
        this.getBallName = getBallName;
        this.container = document.createElement('div');
        Object.assign(this.container.style, {
            position: 'fixed',
            left: '20px',
            bottom: '20px',
            width: 'max-content',
            maxWidth: 'calc(100vw - 40px)',
            maxHeight: '22vh',
            boxSizing: 'border-box',
            padding: '8px 12px',
            background: 'rgba(0, 0, 0, 0.75)',
            color: 'white',
            fontFamily: 'monospace',
            borderRadius: '8px',
            zIndex: '1000'
        });

        const heading = document.createElement('div');
        heading.textContent = 'Collision restitution';
        heading.style.fontWeight = 'bold';
        heading.style.marginBottom = '4px';
        this.ballPanels = document.createElement('div');
        this.ballPanels.style.display = 'flex';
        this.ballPanels.style.flexDirection = 'column';
        this.ballPanels.style.gap = '4px';
        this.ballPanels.style.maxHeight = 'calc(22vh - 36px)';
        this.ballPanels.style.overflowY = 'auto';
        this.container.append(heading, this.ballPanels);
        document.body.appendChild(this.container);
        this.refresh();
    }

    public refresh(): void {
        this.ballPanels.replaceChildren();
        this.panels.clear();
        this.pairInputs.length = 0;
        const bodies = this.world.bodies;

        if (this.activeBody && !bodies.includes(this.activeBody)) {
            this.activeBody = undefined;
        }

        if (bodies.length === 0) {
            this.ballPanels.textContent = 'Add a ball to configure its collisions.';
            return;
        }

        for (const body of bodies) {
            const panel = document.createElement('details');
            panel.open = this.activeBody === body;
            panel.style.width = '100%';
            panel.style.boxSizing = 'border-box';
            panel.style.padding = '2px 6px';
            panel.style.background = 'rgba(255, 255, 255, 0.08)';
            panel.style.borderRadius = '4px';
            panel.style.display = this.activeBody && this.activeBody !== body
                ? 'none'
                : '';
            this.panels.set(body, panel);

            const summary = document.createElement('summary');
            summary.textContent = this.getBallName(body);
            summary.style.cursor = 'pointer';
            summary.style.fontSize = '12px';
            panel.appendChild(summary);
            panel.addEventListener('toggle', () => {
                if (panel.open) {
                    this.activeBody = body;
                    this.container.style.width = 'calc(100vw - 40px)';
                    for (const [otherBody, otherPanel] of this.panels) {
                        if (otherBody !== body) {
                            otherPanel.open = false;
                            otherPanel.style.display = 'none';
                        }
                    }
                } else if (this.activeBody === body) {
                    this.activeBody = undefined;
                    this.container.style.width = 'max-content';
                    for (const otherPanel of this.panels.values()) {
                        otherPanel.style.display = '';
                    }
                }
            });

            const pairControls = document.createElement('div');
            pairControls.style.display = 'grid';
            pairControls.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
            pairControls.style.gap = '2px';
            pairControls.style.padding = '4px 0';

            const otherBodies = bodies.filter(other => other !== body);
            if (otherBodies.length === 0) {
                pairControls.textContent = 'No other balls';
            } else {
                for (const other of otherBodies) {
                    this.createPairControl(body, other, pairControls);
                }
            }

            panel.appendChild(pairControls);
            this.ballPanels.appendChild(panel);
        }
    }

    private createPairControl(
        bodyA: SphereBody,
        bodyB: SphereBody,
        container: HTMLElement
    ): void {
        const wrapper = document.createElement('label');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.minWidth = '0';
        wrapper.style.gap = '2px';

        const name = document.createElement('span');
        name.textContent = this.getBallName(bodyB);
        name.style.fontSize = '10px';
        name.style.overflow = 'hidden';
        name.style.textOverflow = 'ellipsis';
        name.style.whiteSpace = 'nowrap';

        const input = document.createElement('input');
        input.type = 'range';
        input.min = '0';
        input.max = '1';
        input.step = '0.05';
        input.value = this.world.getSphereRestitution(bodyA, bodyB).toString();
        input.style.width = '100%';
        input.style.margin = '0';
        input.style.accentColor = '#3399ff';

        const value = document.createElement('output');
        value.value = input.value;
        value.textContent = input.value;
        value.style.fontSize = '10px';
        value.style.textAlign = 'center';
        const pairInput = { bodyA, bodyB, input, output: value };
        this.pairInputs.push(pairInput);
        input.addEventListener('input', () => {
            const restitution = Number(input.value);
            this.world.setSphereRestitution(bodyA, bodyB, restitution);
            for (const control of this.pairInputs) {
                const samePair =
                    (control.bodyA === bodyA && control.bodyB === bodyB) ||
                    (control.bodyA === bodyB && control.bodyB === bodyA);
                if (samePair) {
                    control.input.value = restitution.toString();
                    control.output.value = restitution.toFixed(2);
                    control.output.textContent = control.output.value;
                }
            }
        });

        const valueRow = document.createElement('div');
        valueRow.style.display = 'grid';
        valueRow.style.gridTemplateColumns = 'minmax(0, 1fr) 26px';
        valueRow.style.alignItems = 'center';
        valueRow.style.gap = '2px';
        valueRow.append(input, value);

        wrapper.append(name, valueRow);
        container.appendChild(wrapper);
    }
}

