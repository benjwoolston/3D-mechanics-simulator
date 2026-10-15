import * as THREE from 'three';
import { SphereBody } from '../physics/SphereBody';

export class ParticleRenderer {
    public readonly mesh: THREE.Mesh;
    private readonly material: THREE.MeshStandardMaterial;

    constructor(body: SphereBody) {
        const geometry = new THREE.SphereGeometry(
            1,
            32,
            16
        );

        this.material = new THREE.MeshStandardMaterial({
            color: 0x3399ff
        });

        this.mesh = new THREE.Mesh(
            geometry,
            this.material
        );

        this.update(body);
    }

    public update(body: SphereBody): void {
        this.mesh.scale.setScalar(body.radius);
        this.mesh.position.set(
            body.position[0],
            body.position[1],
            body.position[2]
        );
    }

    public setColor(color: string): void {
        this.material.color.set(color);
    }

    public addToScene(scene: THREE.Scene): void {
        scene.add(this.mesh);
    }

    public dispose(): void {
        this.mesh.removeFromParent();
        this.mesh.geometry.dispose();
        const material = this.mesh.material;
        if (Array.isArray(material)) {
            material.forEach(item => item.dispose());
        } else {
            material.dispose();
        }
    }
}