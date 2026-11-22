import {
  ACESFilmicToneMapping, AmbientLight, Box3, DirectionalLight, Group, MathUtils,
  OrthographicCamera, PMREMGenerator, Scene, SRGBColorSpace, Vector3, WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { assetUrl } from './shop';

export const angles = [
  { label: 'Камеры', rotation: [0.12, -0.41, -0.21] },
  { label: 'Корпус', rotation: [0.05, -1.33, -0.09] },
  { label: 'Экран', rotation: [-0.07, -2.94, 0.14] },
];

export async function createPhoneScene() {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0, 0);
  renderer.domElement.setAttribute('aria-hidden', 'true');

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 12);
  camera.position.z = 4;
  const generator = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = generator.fromScene(room, 0.04);
  room.dispose();
  generator.dispose();
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.92;

  const key = new DirectionalLight(0xfff5f2, 2);
  key.position.set(-3, 3, 4);
  const rim = new DirectionalLight(0xf5f0ff, 1.4);
  rim.position.set(3, 1, -2);
  scene.add(key, rim, new AmbientLight(0xffffff, 0.22));

  const phone = new Group();
  scene.add(phone);
  let model;
  function dispose() {
    const textures = new Set();
    const materials = new Set();
    model?.traverse((object) => {
      if (!object.isMesh) return;
      object.geometry.dispose();
      materials.add(object.material);
      for (const value of Object.values(object.material)) {
        if (value?.isTexture) textures.add(value);
      }
    });
    for (const texture of textures) texture.dispose();
    for (const material of materials) material.dispose();
    environment.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  }

  try {
    const asset = await new GLTFLoader().loadAsync(assetUrl('models/iphone-18-pro-burgundy.glb'));
    model = asset.scene;
    const center = new Box3().setFromObject(model).getCenter(new Vector3());
    model.position.sub(center);
    phone.add(model);
  } catch (error) {
    dispose();
    throw error;
  }

  return {
    renderer,
    phone,
    key,
    resize(width, height, ratio = Math.min(window.devicePixelRatio, 1.65)) {
      if (!width || !height) return;
      const aspect = width / height;
      const halfHeight = Math.max(0.88, 0.51 / aspect);
      camera.left = -halfHeight * aspect;
      camera.right = -camera.left;
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(ratio);
      renderer.setSize(width, height, false);
    },
    render() {
      renderer.render(scene, camera);
    },
    dispose,
  };
}

export function interpolateRotation(current, target, dt) {
  const difference = MathUtils.euclideanModulo(target - current + Math.PI, Math.PI * 2) - Math.PI;
  return MathUtils.damp(current, current + difference, 7, dt);
}
