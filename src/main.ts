import { SceneManager } from './rendering/SceneManager';
import { CameraController } from './rendering/CameraController';
import { SimulationBox } from './rendering/SimulationBox';
import { addLighting } from './rendering/Lighting';
import { SphereBody } from './physics/SphereBody';
import { ParticleRenderer } from './rendering/ParticleRenderer';
import { PhysicsWorld } from './physics/PhysicsWorld';
import { ParticleDebugRenderer } from './rendering/ParticleDebugRenderer';
import { SimulationBounds } from './physics/SimulationBounds';
import { SimulationControls } from './UI/simulationControls';

const bounds = new SimulationBounds(-10, 10,0, 10,-10, 10);
const sceneManager = new SceneManager();

const cameraController = new CameraController(
    sceneManager.camera,
    sceneManager.renderer
);

const simulationBox = new SimulationBox();

simulationBox.addToScene(
    sceneManager.scene
);


const particle = new SphereBody(
    [4, 1, 0],
    [2, 3, 5],
    1,
    0.5
);

const secondParticle = new SphereBody(
    [0, 1, 0],
    [0, 0, 0],
    1,
    0.5
);



const particleDebugRenderer = new ParticleDebugRenderer(particle);
const secondParticleDebugRenderer = new ParticleDebugRenderer(secondParticle);



const physicsWorld = new PhysicsWorld(9.80665, bounds, 0.8);

physicsWorld.addBody(particle);
physicsWorld.addBody(secondParticle);



const particleRenderer = new ParticleRenderer(
    particle
);
const secondParticleRenderer = new ParticleRenderer(
    secondParticle
);


const simulationControls = new SimulationControls(
    physicsWorld,
    particle,
    particleDebugRenderer
);


particleRenderer.addToScene(
    sceneManager.scene
);
secondParticleRenderer.addToScene(
    sceneManager.scene
);



particleDebugRenderer.addToScene(
    sceneManager.scene
);
secondParticleDebugRenderer.addToScene(
    sceneManager.scene
);


addLighting(sceneManager.scene);

window.addEventListener(
    'resize',
    () => {
        sceneManager.resize();
    }
);



let previousTime = performance.now();
let previousCollisionCount = 0;


function animate(currentTime: number): void {
    requestAnimationFrame(animate);

    const deltaTime = (currentTime - previousTime) / 1000;
    previousTime = currentTime;

    if (!simulationControls.isPaused()) {
        physicsWorld.update(deltaTime);
    }

    const collisionCount = physicsWorld.collisions.length;
    if (collisionCount > 0) {
        if (previousCollisionCount === 0) {
            console.log(`Collisions detected: ${collisionCount}`, physicsWorld.collisions);
        }
    } else if (previousCollisionCount > 0) {
        console.log('No sphere collisions detected');
    }
    previousCollisionCount = collisionCount;

    particleRenderer.update(particle);
    secondParticleRenderer.update(secondParticle);
    cameraController.update();
    sceneManager.render();
    particleDebugRenderer.update(particle);
    secondParticleDebugRenderer.update(secondParticle);
}
requestAnimationFrame(animate)
