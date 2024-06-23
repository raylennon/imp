// Import Three.js library
// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';

// Import OrbitControls.js for camera control
import * as THREE from 'three';
import { OrbitControls  } from 'three/addons/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

const scene = new THREE.Scene();
window.sceneObjects = []

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
window.camera = camera;

window.viewEuler = new THREE.Euler();
window.viewQuat = new THREE.Quaternion();


const clock = new THREE.Clock();

const renderer = new THREE.WebGLRenderer({canvas: document.getElementById('three-canvas'), alpha: true});
renderer.setPixelRatio( 1/1);


renderer.setClearColor(0xffffff); // Black background
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0); // 0x000000 is the color (black), 0 is the alpha (fully transparent)

document.body.appendChild(renderer.domElement);
scene.background = null;

function vertexShader() {
    return `

    varying vec3 vUv; 
    varying vec2 UV; 

    varying vec3 vposition;
    varying vec3 v_normal;
    varying vec4 vPos;

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
window.generateFragmentShader = async function (domainText) {

    const preambleText = (await import('../shaders/preamble.fs?raw')).default;
    const utilitiesText = (await import('../shaders/utilities.fs?raw')).default;
    // const domainText = (await import('../shaders/domain.fs?raw')).default;
    return preambleText+`
    varying vec3 vposition;
    varying vec3 vUv;`+`\n`+utilitiesText+`\n`+domainText+`\n
    varying vec3 v_normal;
    varying vec4 vPos;

    vec3 v_position;
    vec3 trueCamera;

    void main() {

  	    vec2 vCoords = vPos.xy;
		vCoords /= vPos.w;
		vCoords = vCoords * 0.5 + 0.5;
        vec2 uv = fract( vCoords * 10.0 );

        trueCamera = u_position.xzy;
        trueCamera.y = -trueCamera.y;

        v_position = vposition.xzy;
        v_position.y = -v_position.y;
        
        float opacity = 0.0;        
        int steps = 0;
        vec3 loc = trueCamera;
        
        vec3 dir = (v_position-trueCamera);
        dir *= 1.0/length(dir);
        float step_fac = 1.0;
        

        float val = 0.0;
        
        float current_sign = sign(domain(v_position, u_time));
        float camera_sign = sign(domain(trueCamera, u_time));

        if (current_sign != camera_sign) {
            steps=1000000000;
        }
        float dist =0.0;
        int MAX_STEPS = 100;
        while (steps < MAX_STEPS) {
            val = domain(loc, u_time);
            if (sign(val) != camera_sign) {
                opacity = 0.0;
                steps=10000000;
                break;  
            } else if (dot(v_position-trueCamera, v_position-loc)<0.0) {
                opacity = 1.0;
                steps=10000000;
                break;
            }
            dist += abs(val);
            loc += step_fac * dir * abs(val);
            steps += 1;
        }
        dir = -dir;
        dist = length(u_position-vposition);
        fragColor = vec4(vec3(0.5), opacity);
        }`
}
window.godMaterial = new THREE.ShaderMaterial({
    uniforms: {
        colorB: {type: 'vec3', value: new THREE.Color(0xACB6E5)},
        colorA: {type: 'vec3', value: new THREE.Color(0x74ebd5)},
        u_position: {type: 'vec3', value: camera.position.toArray()},
        u_time: {type: 'float', value: performance.now() / 1000.0}
    },
    fragmentShader: await window.generateFragmentShader((await import('../shaders/domain.fs?raw')).default),
    vertexShader: vertexShader(),
    blending: THREE.CustomBlending,
    glslVersion: THREE.GLSL3,
    blendEquation : THREE.AddEquation 
  })

  const size = 30;
  const divisions = 10;
  
  const gridHelper = new THREE.GridHelper( size, divisions );
  gridHelper.material = window.godMaterial;
  scene.add( gridHelper );
  window.sceneObjects.push(gridHelper);
// console.log(gridHelper);

const controls = new OrbitControls (camera, renderer.domElement);

camera.position.z = 20;
controls.update();


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);

function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update controls
    renderer.render(scene, camera);
    for (let i in sceneObjects) {
        if (Object.hasOwn(sceneObjects[i].material, 'uniforms')) {
            sceneObjects[i].material.uniforms.u_position.value = camera.position.toArray();
            sceneObjects[i].material.uniforms.u_time.value = performance.now() / 1000.0;
        }
    }
}
// startGraphics();
animate();
