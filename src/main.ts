import { SceneManager } from './rendering/SceneManager';
import { CameraController } from './rendering/CameraController';
import { SimulationBox } from './rendering/SimulationBox';
import { addLighting } from './rendering/Lighting';
import { SphereBody } from './physics/SphereBody';
import { ParticleRenderer } from './rendering/ParticleRenderer';

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
    [0, 0, 0],
    1,
    0.5
);

const particleRenderer = new ParticleRenderer(
    particle
);

particleRenderer.addToScene(
    sceneManager.scene
);

addLighting(sceneManager.scene);

window.addEventListener(
    'resize',
    () => {
        sceneManager.resize();
    }
);

function animate(): void {
    requestAnimationFrame(animate);

    cameraController.update();

    sceneManager.render();
}

animate();