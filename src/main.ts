import { SceneManager } from './rendering/SceneManager';
import { CameraController } from './rendering/CameraController';
import { SimulationBox } from './rendering/SimulationBox';
import { addLighting } from './rendering/Lighting';

const sceneManager = new SceneManager();

const cameraController = new CameraController(
    sceneManager.camera,
    sceneManager.renderer
);

const simulationBox = new SimulationBox();

simulationBox.addToScene(
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