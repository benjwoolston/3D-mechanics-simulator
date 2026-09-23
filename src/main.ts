import { SceneManager } from './rendering/SceneManager';
import { CameraController } from './rendering/CameraController';
import { SimulationBox } from './rendering/SimulationBox';
import { addLighting } from './rendering/Lighting';
import { SphereBody } from './physics/SphereBody';
import { ParticleRenderer } from './rendering/ParticleRenderer';
import { PhysicsWorld } from './physics/PhysicsWorld';
import { ParticleDebugRenderer } from './rendering/ParticleDebugRenderer';



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
    [0, 5, 0],
    [2, 1, 0],
    1,
    0.5
);

const particleDebugRenderer = new ParticleDebugRenderer(particle);

const physicsWorld = new PhysicsWorld();
physicsWorld.addBody(particle);

const particleRenderer = new ParticleRenderer(
    particle
);

particleRenderer.addToScene(
    sceneManager.scene
);

particleDebugRenderer.addToScene(
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


function animate(currentTime: number): void {
    requestAnimationFrame(animate);

    const deltaTime = (currentTime - previousTime) / 1000;
    previousTime = currentTime;

    physicsWorld.update(deltaTime);

    particleRenderer.update(particle);

    particleDebugRenderer.update(particle);

    cameraController.update();

    sceneManager.render();
}

requestAnimationFrame(animate);