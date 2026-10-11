import { SphereBody } from './SphereBody';

export interface CollisionInfo {
    bodyA: SphereBody;
    bodyB: SphereBody;
    normal: [number, number, number];
    penetrationDepth: number;
}

export class SphereCollision {
    public detect(bodyA: SphereBody, bodyB: SphereBody): CollisionInfo | null {
        const dx = bodyB.position[0] - bodyA.position[0];
        const dy = bodyB.position[1] - bodyA.position[1];
        const dz = bodyB.position[2] - bodyA.position[2];

        const distanceSquared = dx**2 + dy**2 + dz**2;
        const radiusSum = bodyA.radius + bodyB.radius;

        if (distanceSquared < radiusSum**2) {
            const distance = Math.sqrt(distanceSquared);

            let normal: [number, number, number] = [1, 0, 0];
            if (distance > 0.001) {
                normal = [
                    dx / distance,
                    dy / distance,
                    dz / distance
                ];
            }

            const penetrationDepth = radiusSum - distance;

            return {
                bodyA,
                bodyB,
                normal,
                penetrationDepth
            };
        }

        return null;
    }

    public resolveCollision(collision: CollisionInfo, restitutionCoefficient: number): void {
        const { bodyA, bodyB, normal } = collision;

        const inverseMassA = 1 / bodyA.mass;
        const inverseMassB = 1 / bodyB.mass;
        const totalInverseMass = inverseMassA + inverseMassB;

        if (!Number.isFinite(totalInverseMass) || totalInverseMass === 0) {
            return;
        }


        const relativeVelocity: [number, number, number] = [
            bodyB.velocity[0] - bodyA.velocity[0],
            bodyB.velocity[1] - bodyA.velocity[1],
            bodyB.velocity[2] - bodyA.velocity[2]
        ];

        const velocityAlongNormal = relativeVelocity[0] * normal[0] +
            relativeVelocity[1] * normal[1] +
            relativeVelocity[2] * normal[2];

        if (velocityAlongNormal < 0) {
            const impulseMagnitude = -(1 + restitutionCoefficient) *
                velocityAlongNormal / totalInverseMass;

            const impulse: [number, number, number] = [
                impulseMagnitude * normal[0],
                impulseMagnitude * normal[1],
                impulseMagnitude * normal[2]
            ];

            bodyA.velocity[0] -= impulse[0] * inverseMassA;
            bodyA.velocity[1] -= impulse[1] * inverseMassA;
            bodyA.velocity[2] -= impulse[2] * inverseMassA;

            bodyB.velocity[0] += impulse[0] * inverseMassB;
            bodyB.velocity[1] += impulse[1] * inverseMassB;
            bodyB.velocity[2] += impulse[2] * inverseMassB;
        }

        // Correct overlap even when the bodies are already moving apart.
        const correctionMagnitude = collision.penetrationDepth / totalInverseMass;

        const correction: [number, number, number] = [
            correctionMagnitude * normal[0],
            correctionMagnitude * normal[1],
            correctionMagnitude * normal[2]
        ];

        bodyA.position[0] -= correction[0] * inverseMassA;
        bodyA.position[1] -= correction[1] * inverseMassA;
        bodyA.position[2] -= correction[2] * inverseMassA;

        bodyB.position[0] += correction[0] * inverseMassB;
        bodyB.position[1] += correction[1] * inverseMassB;
        bodyB.position[2] += correction[2] * inverseMassB;
    }
}
