import * as THREE from 'three';

export class SceneManager {
    public readonly scene: THREE.Scene;
    public readonly camera: THREE.PerspectiveCamera;
    public readonly renderer: THREE.WebGLRenderer;

    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111111);

        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(15, 12, 15);
        this.camera.lookAt(0,5,0);
        

        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });

        this.renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

        this.renderer.setClearColor(0x111111,1);

        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const canvas = this.renderer.domElement;
            canvas.style.position = 'fixed';
            canvas.style.inset = '0';
            canvas.style.width = '100vw';
            canvas.style.height = '100vh';
            canvas.style.display = 'block';
            canvas.style.zIndex = '0';



        document.body.appendChild(canvas);
    }

    public render(): void {
        this.renderer.render(
            this.scene,
            this.camera
        );
    }

    public resize(): void {
        this.camera.aspect =
            window.innerWidth / window.innerHeight;

        this.camera.updateProjectionMatrix();

        this.renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
}