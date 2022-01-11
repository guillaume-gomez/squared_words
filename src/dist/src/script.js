import './style.css';
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { times } from "lodash";
var top = new THREE.Vector3(1, 0, 0);
var bottom = new THREE.Vector3(-1, 0, 0);
var left = new THREE.Vector3(0, 0, -1);
var right = new THREE.Vector3(0, 0, 1);
var topPosition = new THREE.Vector3(0, 2, 0);
var bottomPosition = new THREE.Vector3(0, -2, 0);
var leftPosition = new THREE.Vector3(-2, 0, 0);
var rightPosition = new THREE.Vector3(2, 0, 0);
var ZSpeed = -0.01;
var topVelocity = new THREE.Vector3(0, -ZSpeed, ZSpeed);
var bottomVelocity = new THREE.Vector3(0, ZSpeed, ZSpeed);
var leftVelocity = new THREE.Vector3(-ZSpeed, 0, ZSpeed);
var rightVelocity = new THREE.Vector3(ZSpeed, 0, ZSpeed);
var texts = [];
// Scene
var scene = new THREE.Scene();
// load font
var fontLoader = new FontLoader();
fontLoader.load('/fonts/helvetiker_regular.typeface.json', function (font) {
    var textMaterial = new THREE.MeshBasicMaterial({ wireframe: false, color: 0x0ff01d });
    var configs = [
        { position: topPosition, velocity: topVelocity, rotation: top },
        { position: leftPosition, velocity: leftVelocity, rotation: left },
        { position: rightPosition, velocity: rightVelocity, rotation: right },
        { position: bottomPosition, velocity: bottomVelocity, rotation: bottom }
    ];
    configs.map(function (_a) {
        var position = _a.position, rotation = _a.rotation;
        times(10, Number).map(function (it) {
            var textPosition = position.clone();
            textPosition.z = -it;
            instantiateText(font, textMaterial, textPosition, velocity, rotation);
        });
    });
});
// Sizes
var sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};
// Axe Helper
var axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);
// Camera
var camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
scene.add(camera);
// Renderer
var renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('canvas.webgl')
});
renderer.setSize(sizes.width, sizes.height);
// Controls
var controls = new OrbitControls(camera, renderer.domElement);
function tick() {
    // Render
    renderer.render(scene, camera);
    for (var i = 0; i < texts.length; i++) {
        var _a = texts[i].velocity, x = _a.x, y = _a.y, z = _a.z;
        var _b = texts[i].mesh.position, meshX = _b.x, meshY = _b.y, meshZ = _b.z;
        texts[i].mesh.position.set(meshX + x, meshY + y, meshZ + z);
        texts[i].mesh.scale.x -= 0.001;
        if (texts[i].mesh.position.z <= -10.0) {
            texts[i].mesh.position.z = 0;
            texts[i].mesh.scale.x = 1;
        }
    }
    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
}
window.onload = function () {
    tick();
};
window.addEventListener('resize', function () {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
window.addEventListener('dblclick', function () {
    var fullscreenElement = document.fullscreenElement;
    var canvas = document.querySelector('canvas.webgl');
    if (!canvas) {
        return;
    }
    if (!fullscreenElement) {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen();
        }
    }
    else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
});
function instantiateText(font, material, position, rotationVector) {
    var textGeometry = new TextGeometry('Hello Three.js', {
        font: font,
        size: 0.5,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.01,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
    });
    textGeometry.center();
    var text = new THREE.Mesh(textGeometry, material);
    text.scale.set(1, 1, 0.1);
    text.position.set(position.x, position.y, position.z);
    texts.push({ mesh: text, velocity: new THREE.Vector3(0, 0, -0.01) });
    text.rotateOnAxis(rotationVector, (Math.PI / 2));
    //text.rotateOnAxis(new THREE.Vector3(1,0,0), -(Math.PI / 4));
    scene.add(text);
}
//# sourceMappingURL=script.js.map