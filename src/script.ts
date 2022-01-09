import './style.css';
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from 'gsap';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { times } from "lodash";

interface CustomMesh {
    mesh : THREE.Mesh;
    velocity: THREE.Vector3;
    originalPosition: THREE.Vector3;
}

const top = new THREE.Vector3(1,0,0);
const bottom = new THREE.Vector3(-1,0,0);
const left = new THREE.Vector3(0,0,-1);
const right = new THREE.Vector3(0,0,1);

const topPosition = new THREE.Vector3(0,2,0);
const bottomPosition = new THREE.Vector3(0,-2,0);
const leftPosition = new THREE.Vector3(-2,0,0);
const rightPosition = new THREE.Vector3(2,0,0);

const ZSpeed = -0.01;
const YSpeed = 0.002;
const topVelocity = new THREE.Vector3(0, -YSpeed, ZSpeed);
const bottomVelocity = new THREE.Vector3(0, YSpeed, ZSpeed);
const leftVelocity = new THREE.Vector3(YSpeed, 0, ZSpeed);
const rightVelocity = new THREE.Vector3(-YSpeed, 0, ZSpeed);


let texts : CustomMesh[] = [];
// Scene
let scene = new THREE.Scene();
scene.background = new THREE.Color(0x723bf2);

// load font
const fontLoader = new FontLoader();

fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) =>
    {
       const textMaterial = new THREE.MeshBasicMaterial({ wireframe: false, color: 0xe85eb0 } )

       const configs = [
           { position: topPosition, velocity: topVelocity, rotation: top },
           { position: leftPosition, velocity: leftVelocity, rotation: left },
           { position: rightPosition, velocity: rightVelocity, rotation: right },
           { position: bottomPosition, velocity: bottomVelocity, rotation: bottom }
       ];

       configs.map(({ position, rotation, velocity }) => {
           times(20, Number).map((it: number) => {

               let text = instantiateText(font, textMaterial);
               text.position.set(position.x, position.y, -it * 0.5 );
               text.scale.set((20 - it) / 20,1, 0.1);

               text.rotateOnAxis(rotation, (Math.PI / 2));
        

               texts.push({ mesh: text, velocity, originalPosition: position });
               scene.add(text);
           })

       })
    }
);

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
// Axe Helper
const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('canvas.webgl')
});

renderer.setSize(sizes.width, sizes.height);

// Controls
const controls = new OrbitControls( camera, renderer.domElement );


function tick()
{
    // Render
    renderer.render(scene, camera);
    for(let i = 0; i < texts.length; i++) {
        const { x, y, z } = texts[i].velocity;
        const { x: meshX, y: meshY, z: meshZ } = texts[i].mesh.position;
        texts[i].mesh.position.set(meshX + x, meshY + y, meshZ + z);
        texts[i].mesh.scale.x -= 0.001;
        if(texts[i].mesh.position.z <= -10.0) {
            const { x, y, z } = texts[i].originalPosition;
            texts[i].mesh.position.set(x, y ,z);
            texts[i].mesh.scale.x = 1;
        }
    }

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
}


window.onload = () => {
    tick();
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

window.addEventListener('dblclick', () =>
{
    const fullscreenElement = document.fullscreenElement;
    const canvas = document.querySelector('canvas.webgl');

    if(!canvas) {
        return;
    }

    if(!fullscreenElement)
    {
        if(canvas.requestFullscreen)
        {
            canvas.requestFullscreen()
        }
    }
    else
    {
        if(document.exitFullscreen)
        {
            document.exitFullscreen()
        }
        
    }
})

function instantiateText(
    font: any,
    material: THREE.MeshBasicMaterial,
    ) : THREE.Mesh {
    const textGeometry = new TextGeometry(
            'Hello Three.js',
            {
                font: font,
                size: 0.5,
                height: 0.2,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.01,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 5
            }
        )
        textGeometry.center();
        console.log(textGeometry)
        let text = new THREE.Mesh(textGeometry, material);
        //text.rotateOnAxis(new THREE.Vector3(1,0,0), -(Math.PI / 4));
        return text;
}