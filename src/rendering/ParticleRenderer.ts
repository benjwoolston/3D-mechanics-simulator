import * as THREE from 'three';
import { SphereBody } from '../physics/SphereBody';

export class ParticleRenderer {
    public readonly mesh: THREE.Mesh;

    constructor(body: SphereBody) {
        const geometry = new THREE.SphereGeometry(
            body.radius,
            32,
            16
        );

        const material = new THREE.MeshStandardMaterial({
            color: 0x3399ff
        });

        this.mesh = new THREE.Mesh(
            geometry,
            material
        );

        this.update(body);
    }

    public update(body: SphereBody): void {
        this.mesh.position.set(
            body.position[0],
            body.position[1],
            body.position[2]
        );
    }

    public addToScene(scene: THREE.Scene): void {
        scene.add(this.mesh);
    }
}