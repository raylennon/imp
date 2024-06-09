// Import Three.js library
// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';

// Import OrbitControls.js for camera control
import * as THREE from 'three';
import { FlyControls } from './controls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

const scene = new THREE.Scene();
window.sceneObjects = []

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
window.camera = camera;

window.viewEuler = new THREE.Euler();
window.viewQuat = new THREE.Quaternion();


const clock = new THREE.Clock();

const renderer = new THREE.WebGLRenderer({canvas: document.getElementById('three-canvas'), alpha: true});

// var threecanvas = document.getElementById('three-canvas');
// const windowWidth = threecanvas.clientWidth;
// const windowHeight = threecanvas.clientHeight;
// renderer.setSize(windowWidth/5, windowHeight/5, false);
// camera.updateProjectionMatrix();

renderer.setPixelRatio( 1/5);


renderer.setClearColor(0xffffff); // Black background
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0); // 0x000000 is the color (black), 0 is the alpha (fully transparent)

document.body.appendChild(renderer.domElement);

// Add a wireframe cube to the scene
// const geometry = new THREE.BoxGeometry(4.1,4.1,4.1);
// const material = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
// const cube = new THREE.Mesh(geometry, material);
// sceneObjects.push(cube);

scene.background = null;

function vertexShader() {
    return `

    varying vec3 vUv; 
    varying vec2 UV; 


    // attribute vec3 normal;
    // uniform mat4 normalMatrix;


    varying vec3 vposition;
    varying vec3 v_normal;

    void main() {
      vUv = position; 
      UV = uv;
      vposition = (modelMatrix * vec4(position, 1.0)).xyz;

      vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    
      v_normal = normal;

      gl_Position = projectionMatrix * modelViewPosition; 
    }
  `
}
async function fragmentShader() {

    const domainText = (await import('./domain.fs?raw')).default;
    const visualText = (await import('./visual.fs?raw')).default;
    return `
    
    uniform vec3 cameraLoc; 
    uniform float u_time; 

    varying vec3 vposition;
    varying vec3 vUv;`+`\n`+domainText+`\n
    varying vec3 v_normal;

    vec3 v_position;
    vec3 sillyCamera;

    void main() {
        sillyCamera = cameraLoc.xzy;
        sillyCamera.y = -sillyCamera.y;

        v_position = vposition.xzy/1.0;
        v_position.y = -v_position.y;

        // float opacity = sign(domain2(v_position, u_time));
        
        float opacity = 0.0;
        
        float steps = 0.0;

        vec3 loc = sillyCamera;
        
        vec3 dir = (v_position-sillyCamera);
        dir *= 1.0/length(dir);
        float step_fac = 1.0;
        

        float val = 0.0;
        
        float current_sign = sign(domain2(v_position, u_time));
        float camera_sign = sign(domain2(sillyCamera, u_time));

        if (current_sign != camera_sign) {
            steps=1000000000.0;
        }
        float dist =0.0;
        while (steps < 100.0) {
            val = domain2(loc, u_time);
            if (sign(val) != camera_sign) {
                opacity = 0.0;
                steps=10000000.0;
                break;  
            } else if (dot(v_position-sillyCamera, v_position-loc)<0.0) {
                opacity = 1.0;
                steps=10000000.0;
                break;
            }
            dist += abs(val);
            loc += step_fac * dir * abs(val);
            steps +=1.0;
        }

        dist = length(cameraLoc-vposition);
        gl_FragColor = vec4(1,1,1, opacity);
        gl_FragColor.w = opacity;
        `+`\n`+visualText
}
window.godMaterial = new THREE.ShaderMaterial({
    uniforms: {
        colorB: {type: 'vec3', value: new THREE.Color(0xACB6E5)},
        colorA: {type: 'vec3', value: new THREE.Color(0x74ebd5)},
        cameraLoc: {type: 'vec3', value: camera.position.toArray()},
        u_time: {type: 'float', value: performance.now() / 1000.0}
    },
    fragmentShader: await fragmentShader(),
    vertexShader: vertexShader(),
    blending: THREE.CustomBlending,
    blendEquation : THREE.AddEquation 
  })

async function addExperimentalCube(location) {
  
    let geometry = new THREE.BoxGeometry(4,4,4)
    let material =  godMaterial.clone();
  
    var coolCube = new THREE.Mesh(geometry, material);
    coolCube.position.set(...location);
    // console.log(coolCube.position);
    sceneObjects.push(coolCube)
    // console.log(sceneObjects[sceneObjects.length-1]);
  }

// for (var i=-10; i<10; i++) {
//     await addExperimentalCube([0,10*i,-30]);

// }

// const loader = new STLLoader();
// loader.load('./ship.stl', function (geometry) {
//     // const material q= new THREE.MeshBasicMaterial( { color: 0x009900, wireframe: true });
//     const material = godMaterial.clone();
//     const mesh = new THREE.Mesh(geometry, material);
//     mesh.translateX(10);
//     mesh.translateZ(-30);
//     mesh.translateY(-8);
//     sceneObjects.push( mesh );
//     scene.add(mesh);
// });
// loader.load('./RaceCourse.stl', function (geometry) {
//     // const material q= new THREE.MeshBasicMaterial( { color: 0x009900, wireframe: true });
//     const material = godMaterial.clone();
//     const mesh = new THREE.Mesh(geometry, material);
//     mesh.translateX(10);
//     mesh.translateZ(-30);
//     mesh.translateY(-8);
//     sceneObjects.push( mesh );
//     scene.add(mesh);
// });


for (let i in sceneObjects) {
    // console.log(sceneObjects[i]);
    scene.add(sceneObjects[i]);
}


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Set up fly controls
const controls = new FlyControls(camera, renderer.domElement);
controls.rollSpeed = 10 * Math.PI / 24;
controls.movementSpeed = 15;

controls.autoForward = false;
controls.dragToLook = false;

camera.rotation.set(0, 3.1415/2, 0);

console.log(camera.position);
console.log(camera.rotation);

// Function to handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);
// console.log(camera.getFocalLength());
// Function to render the scene



function animate() {
    // coolCube.position.z -= 0.02;
    requestAnimationFrame(animate);
    const delta = clock.getDelta(); // Compute delta inside the animation loop
    controls.update(delta); // Update controls
    renderer.render(scene, camera);
    for (let i in sceneObjects) {
        if (Object.hasOwn(sceneObjects[i].material, 'uniforms')) {
            sceneObjects[i].material.uniforms.cameraLoc.value = camera.position.toArray();
            sceneObjects[i].material.uniforms.u_time.value =performance.now() / 1000.0;
        }
    }
}
startGraphics();
animate();
