import * as THREE from 'three';
import { SphereBody } from '../physics/SphereBody';

export class ParticleDebugRenderer {
    private readonly velocityArrow: THREE.ArrowHelper;
    private readonly accelerationArrow: THREE.ArrowHelper;

    private readonly label: THREE.Sprite;
    private readonly labelCanvas: HTMLCanvasElement;
    private readonly labelContext: CanvasRenderingContext2D;
    private readonly labelTexture: THREE.CanvasTexture;

    constructor(body: SphereBody) {
        this.velocityArrow = new THREE.ArrowHelper(
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(0, 0, 0),
            2,
            0xffff00
        );
        this.accelerationArrow = new THREE.ArrowHelper(
            new THREE.Vector3(0, -1, 0),
            new THREE.Vector3(0, 0, 0),
            1.5,
            0xff4444
        );


        this.labelCanvas = document.createElement('canvas');
        this.labelCanvas.width = 512;
        this.labelCanvas.height = 300;

        const context = this.labelCanvas.getContext('2d');

        if (!context) {
            throw new Error(
                'Could not create 2D canvas context.'
            );
        }

        this.labelContext = context;

        this.labelTexture = new THREE.CanvasTexture(
            this.labelCanvas
        );

        const material = new THREE.SpriteMaterial({
            map: this.labelTexture,
            transparent: true
        });

        this.label = new THREE.Sprite(material);

        this.label.scale.set(5, 2.5, 1);

        this.update(body);
    }

    public update(body: SphereBody): void {
        this.updateVelocityArrow(body);
        this.updateAccelerationArrow(body);
        this.updateLabel(body);
    }

    private updateVelocityArrow(
        body: SphereBody
    ): void {
        const velocity = new THREE.Vector3(
            body.velocity[0],
            body.velocity[1],
            body.velocity[2]
        );

        const speed = velocity.length();

        this.velocityArrow.position.set(
            body.position[0],
            body.position[1],
            body.position[2]
        );

        if (speed > 0) {
            velocity.normalize();

            this.velocityArrow.setDirection(
                velocity
            );

            this.velocityArrow.setLength(
                Math.max(speed * 1.5, 1)
            );

            this.velocityArrow.visible = true;
        } else {
            this.velocityArrow.visible = false;
        }
    }

    private updateAccelerationArrow(
        body: SphereBody
    ): void {
        const acceleration = new THREE.Vector3(
            body.acceleration[0],
            body.acceleration[1],
            body.acceleration[2]
        );

        const magnitude = acceleration.length();

        this.accelerationArrow.position.set(
            body.position[0],
            body.position[1],
            body.position[2]
        );

        if (magnitude > 0) {
            acceleration.normalize();

            this.accelerationArrow.setDirection(
                acceleration
            );

            this.accelerationArrow.setLength(1.5);

            this.accelerationArrow.visible = true;
        } else {
            this.accelerationArrow.visible = false;
        }
    }


    private updateLabel(
        body: SphereBody
    ): void {
        const context = this.labelContext;

        context.clearRect(
            0,
            0,
            this.labelCanvas.width,
            this.labelCanvas.height
        );

        context.fillStyle = 'rgba(0, 0, 0, 0.75)';

        context.fillRect(
            0,
            0,
            this.labelCanvas.width,
            this.labelCanvas.height
        );

        context.fillStyle = 'white';

        context.font = '28px monospace';

        context.textBaseline = 'top';

        const speed = Math.sqrt(body.velocity[0] ** 2 +body.velocity[1] ** 2 +body.velocity[2] ** 2);

        const lines = [
            `Position: (${body.position[0].toFixed(2)}, ${body.position[1].toFixed(2)}, ${body.position[2].toFixed(2)})`,
            `Velocity: (${body.velocity[0].toFixed(2)}, ${body.velocity[1].toFixed(2)}, ${body.velocity[2].toFixed(2)})`,
            `Acceleration: (${body.acceleration[0].toFixed(2)}, ${body.acceleration[1].toFixed(2)}, ${body.acceleration[2].toFixed(2)})`,
            `Speed:    ${speed.toFixed(2)}`,
            `Mass:     ${body.mass.toFixed(2)}`,
            `Radius:   ${body.radius.toFixed(2)}`
        ];

        lines.forEach((line, index) => {
            context.fillText(
                line,
                20,
                20 + index * 42
            );
        });

        this.labelTexture.needsUpdate = true;

        this.label.position.set(
            body.position[0],
            body.position[1] + 2,
            body.position[2]
        );
    }

    public addToScene(
        scene: THREE.Scene
    ): void {
        scene.add(this.velocityArrow);
        scene.add(this.accelerationArrow);
        scene.add(this.label);
    }
}