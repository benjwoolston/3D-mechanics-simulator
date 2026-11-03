import * as THREE from 'three';

export class SimulationBox {
    public readonly mesh: THREE.LineSegments;

    constructor() {
        const material = new THREE.LineBasicMaterial({
            color: 0xffffff
        });

        this.mesh = new THREE.LineSegments(
            this.createEdgesGeometry(20, 10, 20),
            material
        );

        this.mesh.position.y = 5;
    }

    public setDimensions(width: number, height: number, depth: number): void {
        const previousGeometry = this.mesh.geometry;
        this.mesh.geometry = this.createEdgesGeometry(width, height, depth);
        previousGeometry.dispose();
        this.mesh.position.y = height / 2;
    }

    private createEdgesGeometry(width: number, height: number, depth: number): THREE.EdgesGeometry {
        const boxGeometry = new THREE.BoxGeometry(width, height, depth);
        const edgesGeometry = new THREE.EdgesGeometry(boxGeometry);
        boxGeometry.dispose();
        return edgesGeometry;
    }

    public addToScene(scene: THREE.Scene): void {
        scene.add(this.mesh);
    }
}