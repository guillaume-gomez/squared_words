import './style.css';
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from 'gsap';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { times } from "lodash";

const top = new THREE.Vector3(1,0,0);
const bottom = new THREE.Vector3(-1,0,0);
const left = new THREE.Vector3(0,0,-1);
const right = new THREE.Vector3(0,0,1);

const topPosition = new THREE.Vector3(0,2,0);
const bottomPosition = new THREE.Vector3(0,-2,0);
const leftPosition = new THREE.Vector3(-2,0,0);
const rightPosition = new THREE.Vector3(2,0,0);


let texts : THREE.Mesh[] = [];
// Scene
const scene = new THREE.Scene();

// load font
const fontLoader = new FontLoader();

fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) =>
    {
       const textMaterial = new THREE.MeshBasicMaterial({ wireframe: false, color: 0x0ff01d } )

       const configs = [
           {position: topPosition, rotation: top},
           {position: leftPosition, rotation: left},
           {position: rightPosition, rotation: right},
           {position: bottomPosition, rotation: bottom}
       ];

       configs.map(({position, rotation}) => {
           times(10, Number).map((it: number) => {
               let textPosition = position.clone();
               textPosition.z = -it;
               instantiateText(font, textMaterial, textPosition, rotation);
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
        texts[i].position.z -= 0.01;
        texts[i].scale.x -= 0.001;
        if(texts[i].position.z <= -10.0) {
            texts[i].position.z = 0;
            texts[i].scale.x = 1;
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

function instantiateText(font: any, material: THREE.MeshBasicMaterial, position: THREE.Vector3, rotationVector: THREE.Vector3) {
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
        let text = new THREE.Mesh(textGeometry, material);
        text.scale.set(1,1, 0.1);
        text.position.set(position.x, position.y, position.z );
        texts.push(text);
        text.rotateOnAxis(rotationVector, (Math.PI / 2))
        //text.rotateOnAxis(new THREE.Vector3(1,0,0), -(Math.PI / 4));
        /**
         * Animate
         */
        //gsap.to(text.position, { duration: 2, z: text.position.z - 3, repeat:-1 });
        //gsap.to(text.scale, { duration: 2, x: 0.1, repeat:-1 });

        scene.add(text)
}