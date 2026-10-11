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

            let normal: [number, number, number] = [0, 0, 0];
            if (distance > 0.001){
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
}