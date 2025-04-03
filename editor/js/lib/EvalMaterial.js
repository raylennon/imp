/*

This is a special material which just evaluates a domain function at a point in space.
It's used to make rasterized 'slices' of the function, which are then passed -as a float buffer-
into a marching cubes algorithm to produce a polygonal mesh. You can see it in action
in ./GenerateMesh.js

*/
import { utilities } from './ShaderComponents.js';
import { ShaderMaterial } from 'three';
import * as THREE from 'three';

class EvalMaterial extends ShaderMaterial {
    constructor(domainstring, obj) {
        console.log(obj.matrixWorld);
        super();
        this.uniforms = {
            objMatrix :  { type: 'mat4', value: obj.matrixWorld },
            yVal: {type: 'float', value: 0}
        }
        this.glslVersion = THREE.GLSL3;
        this.side = THREE.DoubleSide;
        this.vertexShader = `
uniform float yVal;
uniform mat4 objMatrix;
out vec3 worldPosition;
void main() {
  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = vec4(position, 1.0);  
  worldPosition = ((objMatrix) * vec4(position, 1.0)).xyz;
}
  `;
        this.fragmentShader = `
in vec3 worldPosition;
out float color;\n` + utilities + domainstring +`\n
void main() {
color = domain(worldPosition.xzy, 0.);
}
`;
    }
}

export { EvalMaterial };