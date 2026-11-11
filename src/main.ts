import './style.css';
import { SceneManager } from './rendering/SceneManager';
import { CameraController } from './rendering/CameraController';
import { SimulationBox } from './rendering/SimulationBox';
import { addLighting } from './rendering/Lighting';
import { SphereBody } from './physics/SphereBody';
import { ParticleRenderer } from './rendering/ParticleRenderer';
import { PhysicsWorld } from './physics/PhysicsWorld';
import { ParticleDebugRenderer } from './rendering/ParticleDebugRenderer';
import { SimulationBounds } from './physics/SimulationBounds';
import {
    createBallControlsDock,
    createSharedSimulationControls,
    MAX_BALL_COUNT,
    SimulationSettingsControls
} from './UI/simulationControls';
import { SimulationControls } from './UI/ballControls';
import { SphereRestitutionControls } from './UI/restitutionControls';

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

const physicsWorld = new PhysicsWorld(9.80665, bounds, 0.8);
const sharedControls = createSharedSimulationControls();
const ballControlsDocks = [
    createBallControlsDock('left'),
    createBallControlsDock('right')
];

interface BallView {
    body: SphereBody;
    renderer: ParticleRenderer;
    debugRenderer: ParticleDebugRenderer;
    controls: SimulationControls;
}

const ballViews = new Map<SphereBody, BallView>();
const ballNumbers = new Map<SphereBody, number>();
const ballNames = new Map<SphereBody, string>();
let settingsControls: SimulationSettingsControls;
let sphereRestitutionControls: SphereRestitutionControls;

function getBallName(body: SphereBody): string {
    return ballNames.get(body) ?? 'Ball';
}

function getAvailableBallNumber(): number | undefined {
    const usedNumbers = new Set(ballNumbers.values());
    for (let number = 1; number <= MAX_BALL_COUNT; number++) {
        if (!usedNumbers.has(number)) {
            return number;
        }
    }
}

function addBall(
    position: [number, number, number],
    velocity: [number, number, number] = [0, 0, 0]
): void {
    const ballNumber = getAvailableBallNumber();
    if (ballNumber === undefined || physicsWorld.bodies.length >= MAX_BALL_COUNT) {
        return;
    }

    const body = new SphereBody(position, velocity, 1, 0.5);
    const renderer = new ParticleRenderer(body);
    const dock = ballControlsDocks[(ballNumber - 1) % ballControlsDocks.length];
    const name = `Ball ${ballNumber}`;
    const debugRenderer = new ParticleDebugRenderer(body, name);
    ballNames.set(body, name);
    const controls = new SimulationControls(
        physicsWorld,
        body,
        debugRenderer,
        `${name} Controls`,
        sharedControls,
        () => removeBall(body),
        dock,
        color => renderer.setColor(color),
        updatedName => {
            ballNames.set(body, updatedName);
            sphereRestitutionControls.refresh();
        }
    );

    physicsWorld.addBody(body);
    renderer.addToScene(sceneManager.scene);
    debugRenderer.addToScene(sceneManager.scene);
    ballNumbers.set(body, ballNumber);
    ballViews.set(body, { body, renderer, debugRenderer, controls });
    settingsControls.updateBallCount(physicsWorld.bodies.length);
    sphereRestitutionControls.refresh();
}

function removeBall(body: SphereBody): void {
    const ballView = ballViews.get(body);
    if (!ballView) {
        return;
    }

    physicsWorld.removeBody(body);
    ballView.controls.dispose();
    ballView.renderer.dispose();
    ballView.debugRenderer.dispose();
    ballViews.delete(body);
    ballNumbers.delete(body);
    ballNames.delete(body);
    settingsControls.updateBallCount(physicsWorld.bodies.length);
    sphereRestitutionControls.refresh();
}

function addBallAtAvailablePosition(): void {
    if (physicsWorld.bodies.length >= MAX_BALL_COUNT) {
        settingsControls.updateBallCount(physicsWorld.bodies.length);
        return;
    }

    const radius = 0.5;
    const spacing = radius * 2 + 0.1;
    const positions: [number, number, number][] = [];

    for (let x = bounds.minX + radius; x <= bounds.maxX - radius; x += spacing) {
        for (let y = bounds.minY + radius; y <= bounds.maxY - radius; y += spacing) {
            for (let z = bounds.minZ + radius; z <= bounds.maxZ - radius; z += spacing) {
                positions.push([x, y, z]);
            }
        }
    }

    const position = positions.find(candidate =>
        physicsWorld.bodies.every(body => {
            const dx = body.position[0] - candidate[0];
            const dy = body.position[1] - candidate[1];
            const dz = body.position[2] - candidate[2];
            const minimumDistance = body.radius + radius;
            return dx * dx + dy * dy + dz * dz >= minimumDistance * minimumDistance;
        })
    );

    if (!position) {
        console.warn('Cannot add another ball: there is no non-overlapping position available.');
        return;
    }

    addBall(position);
}

settingsControls = new SimulationSettingsControls(
    physicsWorld,
    sharedControls,
    addBallAtAvailablePosition,
    (width, height, depth) => {
        physicsWorld.setBoundsDimensions(width, height, depth);
        simulationBox.setDimensions(width, height, depth);
        for (const ballView of ballViews.values()) {
            ballView.controls.refreshPositionBounds();
        }
    }
);
sphereRestitutionControls = new SphereRestitutionControls(physicsWorld, getBallName);
addBall([4, 1, 0], [2, 3, 5]);
addBall([0, 1, 0]);


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

    if (!sharedControls.paused) {
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

    for (const ballView of ballViews.values()) {
        ballView.renderer.update(ballView.body);
        ballView.debugRenderer.update(ballView.body);
    }

    cameraController.update();
    sceneManager.render();
}
requestAnimationFrame(animate)
