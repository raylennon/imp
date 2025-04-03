import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
window.transformMode = "scale";

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';

import * as IMP from './lib/impcore.js';

window.ObjectLoader = new OBJLoader();

const scene = new THREE.Scene();

const canvas = document.getElementById('draw');
const camera = new THREE.PerspectiveCamera(1, canvas.clientWidth / canvas.clientHeight, 1., 10000000);
camera.position.set(-85.43, 31.15, 27.87);
camera.rotation.set(-0.84055, -1.1155, -0.7869);

// const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true});
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    reverseOrder: true
});
renderer.setPixelRatio(1 / 1);
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.setClearColor(0x000000, 0); // 0x000000 is the color (black), 0 is the alpha (fully transparent)
renderer.debug.onShaderError = (gl, program, vertexShader, fragmentShader) => {
    const vertexShaderSource = gl.getShaderSource(vertexShader);
    const fragmentShaderSource = gl.getShaderSource(fragmentShader);
    console.groupCollapsed("vertexShader")
    console.log(vertexShaderSource)
    console.groupEnd()
    console.groupCollapsed("fragmentShader")
    console.log(fragmentShaderSource)
    console.groupEnd()
}

window.onresize = function () {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
};

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
outlinePass.edgeStrength = 10;
outlinePass.edgeGlow = 0.2;
outlinePass.edgeThickness = 0.1;
outlinePass.pulsePeriod = 0.;
outlinePass.renderToScreen = true;
outlinePass.visibleEdgeColor.set('#00B0F0'); // Orange color
outlinePass.hiddenEdgeColor.set('#1B4151');
composer.addPass(outlinePass);

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

let moved = false
const downListener = () => {
    moved = false
}
const moveListener = () => {
    moved = true
}
// Attach listeners
canvas.addEventListener('mousedown', downListener)
canvas.addEventListener('mousemove', moveListener)
canvas.addEventListener('mouseup', upListener)
canvas.addEventListener('keypress', hotkeyListener)


const excludedFromSelectionClasses = [
    THREE.GridHelper,
    THREE.Line,];

function hotkeyListener(event) {
    console.log(event.code);
    if (event.code == "KeyG") {
        window.transformMode = "translate";
    } else if (event.code == "KeyS") {
        window.transformMode = "scale";
    } else if (event.code == "KeyR") {
        window.transformMode = "rotate";
    }

    if (outlinePass.selectedObjects.length > 0) {
        let currentController = outlinePass.selectedObjects[0].controller;
        currentController.mode = window.transformMode;
        if (event.code == "KeyM") {
            IMP.generateMesh(outlinePass.selectedObjects[0], scene);
        }
    }

}

function upListener(event) {
    if (moved) {
        return
    }
    // Update mouse coordinates
    const rect = renderer.domElement.getBoundingClientRect();

    // Calculate mouse coordinates relative to the canvas
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycasting
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    if (outlinePass.selectedObjects.length > 0) {
        let obj = outlinePass.selectedObjects[0];
        obj.controller.visible = false;
        if (typeof (obj.controller) !== 'undefined') {
            obj.controller.visible = false;
            obj.gizmo.visible = false;
            obj.controller.enabled = false;
        }
    }

    // Clear the selected objects array
    outlinePass.selectedObjects = [];
    console.log(window.editor);
    window.editor.getModel().setValue('');

    if (intersects.length > 0) {

        let intersect = intersects.find(item => (item.object.visible &&
            (window.relevant.indexOf(item.object) !== -1)));

        if (typeof (intersect) == "undefined") {
            return
        }

        const intersectedObject = intersect.object;
        window.editor.getModel().setValue(intersectedObject.material.domain);

        if (window.relevant.includes(intersectedObject)) {
            // console.log(intersectedObject);
            outlinePass.selectedObjects = [intersectedObject];
        }
        if (typeof (intersectedObject.controller) !== 'undefined') {
            intersectedObject.controller.visible = true;
            intersectedObject.controller.enabled = true;
            intersectedObject.controller.mode = window.transformMode;
            intersectedObject.gizmo.visible = true;
            // intersectedObject.controller.enabled = true;
        }
    }
}

const controls = new OrbitControls(camera, renderer.domElement);

const gridHelper = new THREE.GridHelper(30, 10);
gridHelper.material = new THREE.LineBasicMaterial({ color: 0xaaaaaa });
scene.add(gridHelper);

window.state = new IMP.EditorState(scene);

const frontRenderTarget = new THREE.WebGLRenderTarget(canvas.clientWidth, canvas.clientHeight,
    {
        type: THREE.FloatType,
    });

const backRenderTarget = new THREE.WebGLRenderTarget(canvas.clientWidth, canvas.clientHeight,
    {
        type: THREE.FloatType,
        format: THREE.RedFormat
    });

const defaultDomain = `float domain(vec3 v, float t) {
    float s =3.15159265;
    float g = dot(cos(v*s), sin(v.yzx*s))/(1.7*s);
    g = abs(g)-0.32/s;
    return g;
}`
const backMaterial = new IMP.SDFMaterial({}, defaultDomain, camera, "back");
const frontMaterial = new IMP.SDFMaterial({}, defaultDomain, camera, "front");
const fullscreenMaterial = new IMP.SDFMaterial({}, defaultDomain, camera, "full");
const standInObject = new THREE.Object3D();

const combineMaterial = new IMP.CombineMaterial(defaultDomain, camera,
    frontRenderTarget, backRenderTarget, standInObject.matrixWorld);

window.relevant = [];

window.addFSQuad = function () {
    // console.log("ok");
    var quad = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        fullscreenMaterial
    );
    scene.add(quad);
    addRow(0, "FSQuad", quad.uuid);
}

window.addCube = function () {
    var box = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2, 10, 10, 10),
    );
    box.domain = defaultDomain;
    box.fmaterial = new IMP.SDFMaterial({}, defaultDomain, camera, "front");
    box.bmaterial = new IMP.SDFMaterial({}, defaultDomain, camera, "back");
    box.cmaterial = new IMP.CombineMaterial(defaultDomain, camera,
        frontRenderTarget, backRenderTarget, box);

    scene.add(box);
    window.relevant.push(box);
    addRow(0, "Cube", box.uuid);

    box.controller = new TransformControls(camera, renderer.domElement);
    box.controller.mode = "scale";
    // shoutout to https://stackoverflow.com/questions/41000983/using-transformcontrols-with-outlinepass-in-three-js
    box.controller.visible = false;
    box.controller.enabled = false;
    box.controller.attach(box);

    box.gizmo = box.controller.getHelper();
    box.gizmo.visible = false;
    box.gizmo.traverse((obj) => { // To be detected correctly by OutlinePass.
        obj.isTransformControls = true;
    });
    // box.gizmo.visible = false;
    scene.add(box.gizmo);
    // scene.add(box.controller);


    box.controller.visible = false;
    box.controller.addEventListener('mouseDown', function () {
        controls.enabled = false;
    });
    box.controller.addEventListener('mouseUp', function () {
        controls.enabled = true;
    });
    return box;

}
window.addRabbit = function () {
    window.ObjectLoader.load(
        "js/just_bunny.obj",
        function (obj) {
            obj.children[0].material = frontMaterial;
            addRow(0, "Rabbit", obj.children[0].uuid);
            window.relevant.push(obj.children[0]);
            scene.add(obj);
        }
    );
}

const tbody = document.querySelector('table tbody');

// Function to add a new row
function addRow(id, name, type) {
    const row = document.createElement('tr');
    const cell1 = document.createElement('td');
    const cell2 = document.createElement('td');
    const cell3 = document.createElement('td');

    cell1.textContent = id;
    cell2.textContent = name;
    cell3.textContent = type;

    row.appendChild(cell1);
    row.appendChild(cell2);
    row.appendChild(cell3);

    tbody.appendChild(row);
}

if (typeof (window.editor.getModel) !== 'undefined') {

    window.editor.getModel().onDidChangeContent((event) => {
        var newDomain = window.editor.getValue();
        if (outlinePass.selectedObjects.length > 0) {
            let rel = outlinePass.selectedObjects[0];
            rel.domain = newDomain;
            rel.fmaterial.setDomain(newDomain);
            rel.bmaterial.setDomain(newDomain);

            fullscreenMaterial.setDomain(newDomain);

            combineMaterial.fragmentShader = combineMaterial.combineFragment(newDomain);
            rel.cmaterial.fragmentShader = combineMaterial.combineFragment(newDomain);
            combineMaterial.needsUpdate = true;
            rel.cmaterial.needsUpdate = true;
        }

    });
}

scene.add(gridHelper);
let defaultBox = window.addCube();
// IMP.generateMesh(defaultBox)

var normalMaterial = new THREE.MeshNormalMaterial();

var runtime;
function animate() {

    runtime = performance.now() / 1000.0;

    // Not sure why this is necessary, but it is
    if (window.relevant !== -1) {
        window.relevant.visible = true;
    }
    requestAnimationFrame(animate);

    for (const mtl of [frontMaterial, combineMaterial, fullscreenMaterial]) {
        mtl.uniforms.u_time.value = runtime;
        mtl.needsUpdate = true;
    }

    controls.update();
    if (window.relevant !== -1) {

        scene.remove(gridHelper);
        if (typeof(window.raster_mesh) !== 'undefined') {
            scene.remove(window.raster_mesh);
        }
        
        renderer.setRenderTarget(frontRenderTarget);
        renderer.render(scene, camera);

        for (const obj of window.relevant) {
            obj.material = obj.bmaterial;
            obj.material.needsUpdate = true;
        }

        renderer.setRenderTarget(backRenderTarget);
        renderer.render(scene, camera);

        for (const obj of window.relevant) {
            obj.material = obj.cmaterial;
            obj.material.needsUpdate = true;
        }

        scene.add(gridHelper);
        if (typeof(window.raster_mesh) !== 'undefined') {
            scene.add(window.raster_mesh);
        }
        renderer.setRenderTarget(null);
        composer.render(scene, camera);

        for (const obj of window.relevant) {
            obj.material = obj.fmaterial;
            obj.material.needsUpdate = true;
        }
    } else {
        // renderer.setRenderTarget(null);
        renderer.render(scene, camera);
    }
}

window.somethingChanged = true;
animate();