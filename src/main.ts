import * as THREE from 'three';

// --- 1. 初期化 ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 15);
camera.lookAt(0, 0, 0);

// --- 変数定義 ---
const mouseNDC = new THREE.Vector2(0, 0); 
let mode: 'attract' | 'repel' = 'attract';
let currentStrength = 5.0;
let velocity = new THREE.Vector3(0, 0, 0);

// --- 2. オブジェクト生成 ---
const magnetGroup = new THREE.Group();
const nPole = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 2), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
nPole.position.z = 1;
magnetGroup.add(nPole);
const sPole = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 2), new THREE.MeshBasicMaterial({ color: 0x0000ff }));
sPole.position.z = -1;
magnetGroup.add(sPole);
scene.add(magnetGroup);

const ball = new THREE.Mesh(new THREE.SphereGeometry(0.5), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
scene.add(ball);

// --- 3. イベント登録 ---
window.addEventListener('mousemove', (e) => {
    mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

const toggleBtn = document.getElementById('toggleModeBtn') as HTMLButtonElement;
const modeText = document.getElementById('modeText') as HTMLSpanElement;

toggleBtn?.addEventListener('click', () => {
    mode = (mode === 'attract') ? 'repel' : 'attract';
    modeText.innerText = (mode === 'attract') ? 'Attract (N)' : 'Repel (S)';
    toggleBtn.style.backgroundColor = (mode === 'attract') ? '#ffcccc' : '#ccccff';
});

// --- 4. メインループ ---
function animate() {
    requestAnimationFrame(animate);

    // 磁石追従
    const vector = new THREE.Vector3(mouseNDC.x, mouseNDC.y, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    magnetGroup.position.copy(camera.position.clone().add(dir.multiplyScalar(15)));

    // 物理計算
    const diff = magnetGroup.position.clone().sub(ball.position);
    const dist = diff.length();
    const force = new THREE.Vector3(); // ここで force を定義

    if (dist > 1.0) {
        const magnitude = currentStrength / (dist * dist + 1);
        // モード判定による向きの設定
        const direction = (mode === 'attract') ? diff.normalize() : diff.normalize().multiplyScalar(-1);
        force.copy(direction.multiplyScalar(magnitude));
    }

    velocity.add(force);
    velocity.multiplyScalar(0.9); // 摩擦
    ball.position.add(velocity);

    renderer.render(scene, camera);
}

animate();