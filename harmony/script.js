// Import Three.js library
// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';

// Import OrbitControls.js for camera control
import * as THREE from 'three';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';

const scene = new THREE.Scene();
window.sceneObjects = []

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
window.camera = camera;

window.viewEuler = new THREE.Euler();
window.viewQuat = new THREE.Quaternion();


const clock = new THREE.Clock();

const renderer = new THREE.WebGLRenderer({canvas: document.getElementById('three-canvas'), alpha: true});

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
    varying vec3 vposition;

    void main() {
      vUv = position; 
      UV = uv;
      vposition = (modelMatrix * vec4(position, 1.0)).xyz;

      vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * modelViewPosition; 
    }
  `
}
async function imageFragmentShader() {
    // const domainResponse = await fetch('./domain.fs',  { credentials: true });
    // const domainText = await domainResponse.text();
    const domainText = (await import('./domain.fs?raw')).default;
    return `

    uniform sampler2D uTexture;
    uniform vec3 cameraLoc;
    uniform float u_time; 
    varying vec3 vposition;
    varying vec2 UV;
    varying vec3 vUv;`+`\n`+domainText+`\n

    vec3 silly;
    vec3 sillyCamera;
    void main() {
        sillyCamera = cameraLoc.xzy;
        sillyCamera.y = -sillyCamera.y;

        silly = vposition.xzy/1.0;
        silly.y = -silly.y;

        // float opacity = sign(domain2(silly, u_time));
        
        float opacity = 0.0;
        
        float steps = 0.0;

        vec3 loc = sillyCamera;
        vec3 dir = (silly-sillyCamera);
        dir *= 1.0/length(dir);
        
        float val = 0.0;
        float dist=0.0;
        float current_sign = sign(domain2(silly, u_time));
        float camera_sign = sign(domain2(sillyCamera, u_time));

        if (current_sign != camera_sign) {
            steps=1000000000.0;
        }
        while (steps < 100.0) {
            val = domain2(loc, u_time);
            if (sign(val) != camera_sign) {
                opacity = 0.0;
                steps=10000000.0;
                break;  
            } else if (dot(silly-sillyCamera, silly-loc)<0.0) {
                opacity = 1.0;
                steps=10000000.0;
                break;
            }
            loc += dir * abs(val);
            dist += abs(val);
            steps +=1.0;
        }
        gl_FragColor = texture(uTexture, UV);
        gl_FragColor.xyz *= exp(-0.0002*pow(dist, 2.2))/1.0;
        gl_FragColor.w *= opacity;
    }`
}
async function fragmentShader() {
    // const domainResponse = await fetch('./domain.fs');
    // const domainText = await domainResponse.text();
    const domainText = (await import('./domain.fs?raw')).default;
    return `


    uniform vec3 colorA;
    uniform vec3 colorB; 
    uniform vec3 cameraLoc; 
    uniform float u_time; 

    varying vec3 vposition;
    varying vec3 vUv;`+`\n`+domainText+`\n

    vec3 silly;
    vec3 sillyCamera;
    void main() {
        sillyCamera = cameraLoc.xzy;
        sillyCamera.y = -sillyCamera.y;

        silly = vposition.xzy/1.0;
        silly.y = -silly.y;

        // float opacity = sign(domain2(silly, u_time));
        
        float opacity = 0.0;
        
        float steps = 0.0;

        vec3 loc = sillyCamera;
        vec3 dir = (silly-sillyCamera);
        dir *= 1.0/length(dir);
        
        float val = 0.0;
        
        float current_sign = sign(domain2(silly, u_time));
        float camera_sign = sign(domain2(sillyCamera, u_time));

        if (current_sign != camera_sign) {
            steps=1000000000.0;
        }

        while (steps < 100.0) {
            val = domain2(loc, u_time);
            if (sign(val) != camera_sign) {
                opacity = 0.0;
                steps=10000000.0;
                break;  
            } else if (dot(silly-sillyCamera, silly-loc)<0.0) {
                opacity = 1.0;
                steps=10000000.0;
                break;
            }
            loc += dir * abs(val);
            steps +=1.0;
        }
        // float opacity = sign(domain2(silly, u_time));
        gl_FragColor = vec4((silly/3.0+1.0)/2.0, opacity);
    }`
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

// const texture = new THREE.TextureLoader().load( "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Grosser_Panda.JPG/1280px-Grosser_Panda.JPG" );
// const texture = new THREE.TextureLoader().load( "https://i.imgur.com/bGqHJve.pngq" );
// const texture = new THREE.TextureLoader().load( "WELCOME.png" );
// texture.wrapS = THREE.RepeatWrapping;
// texture.wrapT = THREE.RepeatWrapping;
// texture.needsUpdate = true;

window.imageMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTexture: null,
        cameraLoc: {type: 'vec3', value: camera.position.toArray()},
        u_time: {type: 'float', value: performance.now() / 1000.0}
    },
    side: THREE.DoubleSide,
    fragmentShader: await imageFragmentShader(),
    vertexShader: vertexShader(),
    blending: THREE.CustomBlending,
    blendEquation : THREE.AddEquation 
  })

// Set initial cube position
// cube.position.set(0, 0, 0);

// Set initial camera position and orientation
camera.position.set(4, 5, 0); // Moved the camera further back to ensure the cube is within its field of view
// camera.rotation.y -= 3.141592/2.0;
// camera.lookAt(cube.position);
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// WEIRD BUSINESS

async function addExperimentalCube(location) {
  
    let geometry = new THREE.BoxGeometry(4,4,4)
    let material =  godMaterial.clone();
  
    var coolCube = new THREE.Mesh(geometry, material);
    coolCube.position.set(...location);
    console.log(coolCube.position);
    // coolCube.position.x = 2;
    sceneObjects.push(coolCube)
    console.log(sceneObjects[sceneObjects.length-1]);
  }
async function addImagePlane(location, rotation, texpath, sx=3, sy=2) {
  
    const material = imageMaterial.clone();
    var fac = 1.0;
    var tex = new THREE.TextureLoader().load( texpath, function ( tex ) {
        return
        // fac=tex.image.width/tex.image.height;
    } );
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.needsUpdate = true;
    material.uniforms.uTexture = new THREE.Uniform(tex);
    let geometry = new THREE.PlaneGeometry(sx,sy);
    const plane = new THREE.Mesh( geometry, material );
    plane.position.set(...location);
    plane.rotation.set(...rotation);
    sceneObjects.push( plane );
  }


await addImagePlane([0, 10, -25], [0, 0, 0], "WELCOME.png",30, 20);

await addImagePlane([32, 3, -2-3*3.1415], [0, -3.141592/2, 0], "https://upload.wikimedia.org/wikipedia/en/thumb/a/a3/Escher%27s_Relativity.jpg/270px-Escher%27s_Relativity.jpg",3,3);
await addImagePlane([32+3.1415/0.4, 3+3.1415/0.4, -2-3*3.1415-3.1415/0.4], [0, -3.141592/2, 0], "https://upload.wikimedia.org/wikipedia/en/thumb/3/33/Study_of_Regular_Division_of_the_Plane_with_Reptiles.jpg/220px-Study_of_Regular_Division_of_the_Plane_with_Reptiles.jpg",3,3);

await addImagePlane([32, 3, -2+2.5*3.1415], [0, -3.141592/2, 0], "https://upload.wikimedia.org/wikipedia/en/2/28/Escher_Poster_Dulwich_Picture_Gallery_2015.jpg",2,3);
await addImagePlane([32+3.1415/0.4, 3+3.1415/0.4, -2+2.5*3.1415-3.1415/0.4], [0, -3.141592/2, 0], "https://upload.wikimedia.org/wikipedia/en/b/ba/DrawingHands.jpg",3,3);

await addImagePlane([32, 3, -2+2.5*3.1415+2*3.1415/0.4], [0, -3.141592/2, 0], "https://upload.wikimedia.org/wikipedia/en/0/03/Escher_Puddle.jpg",3,3);

// await addImagePlane([19.5, 0.0, -8.0]);



for (let i in sceneObjects) {
    // console.log(sceneObjects[i]);
    scene.add(sceneObjects[i]);
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Set up fly controls
const controls = new FlyControls(camera, renderer.domElement);
controls.rollSpeed = 10 * Math.PI / 24;
controls.movementSpeed = 5;


// const controls = new FirstPersonControls(camera, renderer.domElement);
// controls.lookSpeed = 0.2;
// controls.lookVertical = false;
// controls.movementSpeed = 10;

controls.autoForward = false;
controls.dragToLook = false;

// Function to handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);
console.log(camera.getFocalLength());
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
