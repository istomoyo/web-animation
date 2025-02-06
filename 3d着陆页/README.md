这段代码是使用 `three.js` 创建一个 3D 场景，并加载一个 `GLTF` 格式的建筑模型，加入了一些光照效果、景深、辉光 (`Bloom`)，以及胶片颗粒 (`Film Grain`) 效果，使得整个场景更加真实和沉浸式。

------

## **代码解析**

### **1. 创建场景（Scene）、摄像机（Camera）和渲染器（Renderer）**

```js
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
```

- 创建 `THREE.Scene()` 作为 3D 场景，并设置背景颜色为白色。

```js
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
```

- 使用 

  透视相机 (`PerspectiveCamera`)

  ，参数分别是：

  - `75` 代表视角（FOV）
  - `window.innerWidth / window.innerHeight` 代表屏幕宽高比
  - `0.1` 和 `1000` 代表最近和最远的可视距离

```js
const renderer = new THREE.WebGLRenderer({
  powerPreference: "high-performance",
  antialias: false,
  stencil: false,
  depth: false,
});
```

- 创建 `THREE.WebGLRenderer()` 作为 WebGL 渲染器。
- `powerPreference: "high-performance"` 提高 GPU 计算性能
- `antialias: false` 关闭抗锯齿（以提高性能）
- `stencil: false` 和 `depth: false` 关闭模板缓冲区和深度缓冲区（减少计算开销）

```js
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.querySelector(".corridor").appendChild(renderer.domElement);
```

- 让渲染器适配屏幕大小，并将其添加到 `HTML` 页面中的 `.corridor` 容器。

------

### **2. 设置光照**

```js
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
```

- 添加 **环境光**，颜色为 `白色`，强度 `0.5`，用于照亮整个场景。

```js
const keyLight = new THREE.DirectionalLight(0xffffff, 0.5);
keyLight.position.set(5, 8, 5);
keyLight.castShadow = true;
scene.add(keyLight);
```

- **主光源**（方向光），用于模拟太阳光，启用了 `castShadow = true` 生成阴影。

```js
const fillLight = new THREE.DirectionalLight(0x000000, 0.5);
fillLight.position.set(-5, 3, -5);
scene.add(fillLight);
```

- **补光**，但这里颜色是黑色 `0x000000`，实际上不会产生光照，可能是个冗余设置。

```js
const light1 = new THREE.PointLight(0xffffff, 2, 1);
light1.position.set(2, 3, 2);
scene.add(light1);
```

- **点光源**，白色，强度 `2`，照射范围 `1`，模拟房间中的灯光。

```js
const light2 = new THREE.PointLight(0xffffff, 2, 1);
light2.position.set(-2, 3, -2);
scene.add(light2);
```

- 添加第二个点光源，与 `light1` 形成对称照明。

------

### **3. 摄像机的鼠标交互**

```js
const initialAngle = Math.PI / 4;
const radius = Math.sqrt(50);
let currentAngle = initialAngle;
let targetAngle = initialAngle;
let currentY = 0;
let targetY = 0;
camera.position.set(5, 0, 5);
camera.lookAt(0, 0, 0);
```

- 设置相机初始角度、移动范围，并将摄像机放置在 `(5, 0, 5)`。

```js
document.addEventListener("mousemove", (event) => {
  mouseX = (event.clientX - windowHalfX) / windowHalfX;
  mouseY = (event.clientY - windowHalfY) / windowHalfY;
  targetAngle = initialAngle + -mouseX * 0.35;
  targetY = -mouseY * 1.5;
});
```

- 监听 

  ```
  mousemove
  ```

   事件：

  - `mouseX` 控制摄像机的水平旋转角度
  - `mouseY` 控制摄像机的垂直位置
  - 目标角度 `targetAngle` 和 `targetY` 会随着鼠标移动而变化

------

### **4. 加载 3D 模型**

```js
const loader = new THREE.GLTFLoader();
loader.load("./textures/brutalist_interior/scene.gltf", function (gltf) {
```

- 使用 `GLTFLoader` 加载 `GLTF` 格式的建筑模型。

```js
model.traverse((child) => {
  if (child.isMesh) {
    child.castShadow = true;
    child.receiveShadow = true;
```

- 遍历模型中的所有 `Mesh`，并启用 **投影和接收阴影**。

```js
if (child.material) {
  let emissiveColor = emissiveColors.default;
  for (const [key, color] of Object.entries(emissiveColors)) {
    if (child.name.toLowerCase().includes(key)) {
      emissiveColor = color;
      break;
    }
  }
```

- 根据 

  ```
  Mesh
  ```

   的名称，自动匹配不同的自发光颜色：

  - 绿色 `0x00ff00`（屏幕）
  - 橙色 `0xffaa00`（灯）
  - 白色 `0xffffff`（其他光源）

```js
const newMaterial = new THREE.MeshStandardMaterial({
  color: child.material.color,
  map: child.material.map,
  emissive: emissiveColor,
  emissiveIntensity: 0,
  roughness: 5.0,
  metalness: 0.125,
});
child.material = newMaterial;
```

- 使用 `MeshStandardMaterial` 来提高渲染效果，并赋予材质一定的金属度和粗糙度。

```js
const box = new THREE.Box3().setFromObject(model);
const center = box.getCenter(new THREE.Vector3());
model.position.sub(center);
scene.add(model);
document.querySelector(".loading").style.display = "none";
```

- **自动居中**模型，并隐藏 `.loading` 加载动画。

------

### **5. 添加后处理效果**

```js
const renderScene = new THREE.RenderPass(scene, camera);
const bloomPass = new THREE.UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  2.0,
  0.25,
  0.5
);
```

- **添加辉光 (Bloom)** 效果，使光源区域看起来更有层次感。

```js
const filmGrainPass = new THREE.ShaderPass(FilmGrainShader);
filmGrainPass.renderToScreen = true;
```

- **胶片颗粒** (`Film Grain`)，模拟老电影效果。

```js
const composer = new THREE.EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);
composer.addPass(filmGrainPass);
```

- 使用 `EffectComposer` 进行 **后处理渲染**，依次应用 `Bloom` 和 `Film Grain`。

------

### **6. 动画循环**

```js
function animate() {
  requestAnimationFrame(animate);
  filmGrainPass.uniforms.time.value = performance.now() * 0.001;

  currentAngle = lerp(currentAngle, targetAngle, 0.025);
  currentY = lerp(currentY, targetY, 0.025);
  camera.position.x = Math.cos(currentAngle) * radius;
  camera.position.y = lerp(camera.position.y, currentY, 0.05);
  camera.lookAt(0, 0, 0);
  composer.render();
}
animate();
```

- **相机平滑移动** (`lerp`)
- **胶片颗粒动画**
- **渲染循环** (`requestAnimationFrame`)

------

## **总结**

- `three.js` 创建 3D 交互场景
- `GLTFLoader` 加载建筑模型
- `EffectComposer` 实现 **辉光 & 电影颗粒**
- **鼠标控制相机旋转**