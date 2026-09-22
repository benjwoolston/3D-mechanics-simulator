import * as THREE from 'three';

export class SimulationBox {
    public readonly width = 20;
    public readonly height = 10;
    public readonly depth = 20;

    public readonly mesh: THREE.LineSegments;

    constructor() {
        const geometry = new THREE.BoxGeometry(
            this.width,
            this.height,
            this.depth
        );

        const edges = new THREE.EdgesGeometry(geometry);

        const material = new THREE.LineBasicMaterial({
            color: 0xffffff
        });

        this.mesh = new THREE.LineSegments(
            edges,
            material
        );

        this.mesh.position.y = this.height / 2;
    }

    public addToScene(scene: THREE.Scene): void {
        scene.add(this.mesh);
    }
}