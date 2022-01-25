import './style.css';
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from 'gsap';
import * as dat from 'lil-gui';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { times } from "lodash";

interface CustomMesh {
    mesh : THREE.Mesh;
    originalPosition: THREE.Vector3;
}


const backgroundColor = 0x723bf2;
const textColor = 0xe85eb0;
const nbText = 10;
const depth = 10.0;
let ZSpeed = -1;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const message = urlParams.get("text") || "Infinite Loop";


const top = new THREE.Vector3(1,0,0);
const bottom = new THREE.Vector3(-1,0,0);
const left = new THREE.Vector3(0,0,-1);
const right = new THREE.Vector3(0,0,1);

const topPosition = new THREE.Vector3(0,1,0);
const bottomPosition = new THREE.Vector3(0,-1,0);
const leftPosition = new THREE.Vector3(-1,0,0);
const rightPosition = new THREE.Vector3(1,0,0);

let texts : CustomMesh[] = [];
// Scene
let scene = new THREE.Scene();
scene.background = new THREE.Color(backgroundColor);

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// lights
const pointLight = new THREE.PointLight( 0xf794ca, 1, 25 );
const ambientLight = new THREE.AmbientLight(0xffffff, 0.75)
scene.add(ambientLight)
pointLight.position.set( 0, 0, 1 );
scene.add( pointLight );

const sphereSize = 10;
const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
//scene.add( pointLightHelper );

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 2;
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('canvas.webgl')
});

renderer.setSize(sizes.width, sizes.height);

// Controls
const controls = new OrbitControls( camera, renderer.domElement );

const parameters = {
    backgroundColor,
    textColor,
    ZSpeed,
    depth
}

const gui = new dat.GUI();
gui.title("Customize");

gui.addColor(parameters, 'backgroundColor').
    onChange(() =>
    {
        scene.background = new THREE.Color(parameters.backgroundColor);
    });

gui.addColor(parameters, 'textColor').
    onChange(() =>
    {
        texts.forEach(text => {
           (text.mesh.material as any).color.set(parameters.textColor)

        });
    });

gui.add(parameters, 'ZSpeed').
    min(-10).
    max(0).
    onFinishChange(() =>
    {
        ZSpeed = parameters.ZSpeed;
    });


const clock = new THREE.Clock();
function tick()
{
    const delta = clock.getDelta();
    // Render
    renderer.render(scene, camera);
    for(let i = 0; i < texts.length; i++) {
        const { x: meshX, y: meshY, z: meshZ } = texts[i].mesh.position;

        const newZ = meshZ + (ZSpeed * delta);

        const zRatio = ( texts[i].originalPosition.z - newZ ) / depth;
        const newX = texts[i].originalPosition.x - texts[i].originalPosition.x * zRatio;
        const newY = texts[i].originalPosition.y - texts[i].originalPosition.y * zRatio;


        texts[i].mesh.position.set(newX, newY, newZ);
        if(texts[i].mesh.position.z <= -depth) {
            const { x, y, z } = texts[i].originalPosition;
            texts[i].mesh.position.set(x, y , z);
            texts[i].mesh.scale.x = 1;
        }
        texts[i].mesh.scale.x = 1 - zRatio;
        
    }
    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
}


window.onload = () => {
    init()
    .then(() => {
        console.log("tick")
        tick();
    });
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

async function init() {
    // load font
    const fontLoader = new FontLoader();
    return new Promise(resolve => {
        fontLoader.load(
        '/fonts/helvetiker_regular.typeface.json',
        (font) =>
        {
           const textMaterial = new THREE.MeshStandardMaterial({ wireframe: false, color: textColor } );
           const textGeometry =  new TextGeometry(
                message,
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


           const textSize = textGeometry.boundingBox.max.x;
           const configs = [
               { position: topPosition.multiplyScalar(textSize), rotation: top },
               { position: leftPosition.multiplyScalar(textSize), rotation: left },
               { position: rightPosition.multiplyScalar(textSize), rotation: right },
               { position: bottomPosition.multiplyScalar(textSize), rotation: bottom }
           ];

           const interval = depth / nbText;
           configs.map(({ position, rotation }) => {
               times(nbText, Number).map((it: number) => {
                   let text = new THREE.Mesh(textGeometry, textMaterial);
                   text.position.set(position.x - (position.x * it * interval), position.y - (position.y * it * interval), -it * interval );
                   text.scale.set((20 - it) / 20,1, 0.05);

                   text.rotateOnAxis(rotation, (Math.PI / 2));
                   texts.push({ mesh: text, originalPosition: position });
                   scene.add(text);
               })
           })
           resolve("ok");
        });
    });
}