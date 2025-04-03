import * as THREE from 'three';
import { EvalMaterial } from './EvalMaterial.js';
import { MarchingCubes } from './MarchingCubes.js';
const res = 50;


function generateMesh(obj, scene) {
    if (typeof (window.raster) == "undefined") {
        window.raster = {};
        window.raster.scene = new THREE.Scene();
        window.raster.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        window.raster.target = new THREE.WebGLRenderTarget(res, res, {
            type: THREE.FloatType,
            format: THREE.RedFormat
        });
        window.raster.render = new THREE.WebGLRenderer({});
        window.raster.render.setRenderTarget(window.raster.target);
    }
    
    
    const bbox = new THREE.Box3().setFromObject(obj);
    
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new EvalMaterial(obj.domain, obj);
    const plane = new THREE.Mesh(geometry, material);
    
    plane.position.set((bbox.max.x + bbox.min.x)/2, bbox.min.y, (bbox.max.z + bbox.min.z)/2)
    plane.rotation.set(Math.PI / 2, 0, 0);
    plane.scale.set(obj.scale.x, obj.scale.z, 1);
    
    // plane.scale.copy(obj.scale);
    
    plane.updateMatrix();
    console.log(plane);

    plane.material.uniforms.objMatrix.value = plane.matrixWorld;
    plane.material.needsUpdate = true;

    window.raster.scene.add(plane);

    window.raster.render.setSize(res, res, false)
    let renderSize = new THREE.Vector2();
    window.raster.render.getSize(renderSize);

    window.raster.render.render(window.raster.scene, window.raster.cam);
    console.log("Render Size: " + renderSize.width + " x " + renderSize.height)

    // the entire thing
    let buff = new Float32Array(res * res * res);
    // the slice
    let incbuf = new Float32Array(res * res);
    for (let i=0; i<res; i++) {
        plane.position.y = bbox.min.y + i * (bbox.max.y - bbox.min.y)/(res-1);
        
        plane.updateMatrix();
        // debugPlane.updateMatrix();
        window.raster.render.render(window.raster.scene, window.raster.cam);
        window.raster.render.readRenderTargetPixels(window.raster.target, 0, 0, res, res, incbuf)
        displayTheResult(incbuf, res)
        
        buff.set(incbuf, i * res*res)

    }

    const mtl = new THREE.MeshNormalMaterial();
    console.log(mtl.frag)
    mtl.side = THREE.DoubleSide;
    let effect = new MarchingCubes( res, mtl, false, false );
    effect.position.copy(obj.position);
    // effect.rotation.copy(plane.rotation);
    // effect.scale.copy(obj.scale);
    effect.field = buff;
    effect.enableUvs = false;
    effect.enableColors = false;
    effect.render();
    let geo = effect.generateGeometry();
    geo.computeVertexNormals();// Assume 'mesh' is your Three.js mesh object
    
    window.raster_mesh = new THREE.Mesh(geo, mtl);
    window.raster_mesh.scale.set(obj.scale.x, obj.scale.z, obj.scale.y);
    window.raster_mesh.position.set((bbox.max.x + bbox.min.x)/2, (bbox.max.y + bbox.min.y)/2, (bbox.max.z + bbox.min.z)/2);
    scene.add( window.raster_mesh );


}

function displayTheResult(buffer, res) {

    // delete previous
    const canvases = document.querySelectorAll('canvas[id="floating-canvas"]');
    canvases.forEach(canvas => canvas.remove());

    const canvas = document.createElement('canvas');
    canvas.id = 'floating-canvas';
    canvas.width = res;
    canvas.height = res;
    document.body.appendChild(canvas);

    // Get the canvas context
    const ctx = canvas.getContext('2d');

    // Create a Uint8ClampedArray to hold the pixel data
    const pixelData = new Uint8ClampedArray(buffer.length * 4);

    // Convert the float buffer to RGBA pixel data
    for (let i = 0; i < buffer.length; i++) {
        const val = Math.floor(buffer[i] * 255); // Convert float to RGBA
        pixelData[i * 4] = val; // Red
        pixelData[i * 4 + 1] = val; // Green
        pixelData[i * 4 + 2] = val; // Blue
        pixelData[i * 4 + 3] = 255; // Alpha
    }

    // Create an ImageData object from the pixel data
    const imageData = new ImageData(pixelData, res, res);

    // Draw the image data on the canvas
    ctx.putImageData(imageData, 0, 0);

    canvas.style.position = 'absolute';
    canvas.style.width = '400px';
    canvas.style.height = '400px';
    canvas.style.zIndex = '100';
    canvas.style.aspectRatio = '1/1';
    canvas.style.bottom = '0';
    // image-rendering: pixelated; image-rendering: crisp-edges;
    canvas.style.imageRendering = 'pixelated';
    // canvas.style.

}

export { generateMesh };