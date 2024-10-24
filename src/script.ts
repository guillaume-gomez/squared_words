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

const textColorParam = "text-color";
const backgroundColorParam = "background-color";
const nbTextParam = "nb-text";
const messageParam = "message";
const ZSpeedParam = "z-speed";
const ZCameraParam = "z-camera";

const depth = 10.0;
let backgroundColor = 0x723bf2;
let textColor = 0xe85eb0;
let nbText = 10;
let message = "Infinite Loop";
let ZSpeed = -1;
let ZCamera = 2;


const top = new THREE.Vector3(1,0,0);
const bottom = new THREE.Vector3(-1,0,0);
const left = new THREE.Vector3(0,0,-1);
const right = new THREE.Vector3(0,0,1);

let texts : CustomMesh[] = [];
// Scene
let scene = new THREE.Scene();

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// lights
const pointLight = new THREE.PointLight( 0xffffff, 1, 10);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.80)
scene.add(ambientLight)
pointLight.position.set( 0, 0, 2 );
scene.add( pointLight );

const sphereSize = 10;
const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
//scene.add( pointLightHelper );

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = ZCamera;
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('canvas.webgl')
});

renderer.setSize(sizes.width, sizes.height);

// Controls (Debug Only)
//const controls = new OrbitControls( camera, renderer.domElement );

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
    parseUrlParameters();
    initLigGui();
    scene.background = new THREE.Color(backgroundColor);
    init(message, nbText, textColor)
    .then(() => {
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

async function generateGeometry(message: string) {
    const fontLoader = new FontLoader();
    const result : TextGeometry = await new Promise(resolve => {
        fontLoader.load(
        './fonts/helvetiker_regular.typeface.json',
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
            resolve(textGeometry);
        });
   });
   return result;
}

function clearTexts() {
    texts.forEach(text => {
        scene.remove(scene.getObjectById(text.mesh.id));
    })
}

async function init(message: string, nbText: number, textColor: number) {
   const textMaterial = new THREE.MeshStandardMaterial({ wireframe: false, color: textColor } );
   const textGeometry = await generateGeometry(message);

   const textSize = textGeometry.boundingBox.max.x;

   const topPosition = new THREE.Vector3(0,1,0);
    const bottomPosition = new THREE.Vector3(0,-1,0);
    const leftPosition = new THREE.Vector3(-1,0,0);
    const rightPosition = new THREE.Vector3(1,0,0);


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
}

function parseUrlParameters() {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString);
    backgroundColor = parseFloat(urlParams.get(backgroundColorParam)) || backgroundColor;
    textColor = parseFloat(urlParams.get(textColorParam)) || textColor;
    nbText = parseInt(urlParams.get(nbTextParam)) || nbText;
    message = sanitizeMessage(urlParams.get(messageParam));
    ZSpeed = parseFloat(urlParams.get(ZSpeedParam)) || ZSpeed;
    ZCamera = parseFloat(urlParams.get(ZCameraParam)) || ZCamera;
}

function updateUrlParams(key: string, value: string) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete(key);
    urlParams.append(key, value)
    window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
}

function sanitizeMessage(str: string | null) : string {

    if(!str || str.length < 1) {
       return "Infinite Loop";
    }
    
    if(str.length > 1 && str.length <= 75) {
        return str;
    }

    if(str.length >= 75) {
        return str.substring(0, 75);
    }
}

function initLigGui() {
    // LIL GUI
    const parameters = {
        backgroundColor,
        textColor,
        ZSpeed,
        ZCamera,
        message,
        saveMessage() {
            clearTexts();
            init(message, nbText, textColor);
            updateUrlParams(messageParam, message);
        },
        nbText,
        saveNbText() {
            clearTexts();
            init(message, nbText, textColor);
            updateUrlParams(nbTextParam, nbText.toString());
        },
        shareLink() {
            const url = window.location.href;
            navigator.clipboard.writeText(url);
            const shareLinkButton = document.getElementById('lil-gui-name-9');
            shareLinkButton.innerHTML = "Link copied to clipboard";
            setTimeout(() => {
                shareLinkButton.innerHTML = "Share Link";
            }, 2500);
        }
    }

    const gui = new dat.GUI();
    gui.title("Customize");

    gui.addColor(parameters, 'backgroundColor').
        name("Background color").
        onChange(() =>
        {
            scene.background = new THREE.Color(parameters.backgroundColor);
            updateUrlParams(backgroundColorParam, parameters.backgroundColor.toString());
        });

    gui.addColor(parameters, 'textColor').
        name("Text color").
        onChange(() =>
        {
            texts.forEach(text => {
               (text.mesh.material as any).color.set(parameters.textColor)
            });
            textColor = parameters.textColor;
            updateUrlParams(textColorParam, textColor.toString());
        });

    gui.add(parameters, 'ZCamera').
        name("Depth Camera").
        min(0).
        max(10).
        onChange(() =>
        {
            camera.position.z = parameters.ZCamera;
            ZCamera = parameters.ZCamera;
            updateUrlParams(ZCameraParam, ZCamera.toString());
        });

    gui.add(parameters, 'ZSpeed').
        name("Speed").
        min(-10).
        max(0).
        onFinishChange(() =>
        {
            ZSpeed = parameters.ZSpeed;
            updateUrlParams(ZSpeedParam, ZSpeed.toString());
        });

    const messageFolder = gui.addFolder("Message option");
    messageFolder.add(parameters, 'message').
        onChange(() => {
            message = sanitizeMessage(parameters.message);
        });
    messageFolder.add(parameters, 'saveMessage').
    name("Update message");

    const nbTextFolder = gui.addFolder("Number of text");
    nbTextFolder.add(parameters, 'nbText').
        min(10).
        max(25).
        step(1).
        name("Update text").
        onChange(() => {
            nbText = parameters.nbText;
        });
    nbTextFolder.add(parameters, 'saveNbText');

    const shareFolder = gui.addFolder("Share the result");
    shareFolder.add(parameters, 'shareLink' ).
        name("Share link");
}