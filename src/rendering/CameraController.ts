import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class CameraController {
    private readonly controls: OrbitControls;

    constructor(
        camera: THREE.PerspectiveCamera,
        renderer: THREE.WebGLRenderer
    ) {
        this.controls = new OrbitControls(
            camera,
            renderer.domElement
        );

        this.controls.target.set(0, 5, 0);

        this.controls.enableDamping = true;

        this.controls.update();
    }

    public update(): void {
        this.controls.update();
    }
}