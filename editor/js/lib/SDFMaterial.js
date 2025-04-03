import { ShaderMaterial } from 'three';
import * as SC from './ShaderComponents.js';
import * as THREE from 'three';

class SDFMaterial extends ShaderMaterial {
    constructor(parameters, domainstring, camera, opt) {
        super();
        this.uniforms = {
            colorB: { type: 'vec3', value: new THREE.Color(0xACB6E5) },
            colorA: { type: 'vec3', value: new THREE.Color(0x74ebd5) },
            u_position: { type: 'vec3', value: camera.position },
            u_time: { type: 'float', value: performance.now() / 1000.0 },

            // obj_matrix: {type: 'mat4', value: matrix},
            camera_iproj_matrix: {type: 'mat4', value: camera.projectionMatrixInverse},
            camera_view_matrix: {type: 'mat4', value: camera.matrixWorld}
        };
        this.opt = opt;
        this.vertexShader = SC.vertex;
        this.glslVersion = THREE.GLSL3;
        this.setDomain(domainstring);
        this.domain = domainstring;

    }

    setDomain(domainstring) {
        this.domain = domainstring;
        if (this.opt == "back") {
            this.fragmentShader = [SC.preamble, SC.utilities, domainstring, SC.backtracer].join('\n');
            this.side = THREE.BackSide;
        } else if (this.opt == "front") {
            this.fragmentShader = [SC.preamble, SC.utilities, domainstring, SC.fronttracer].join('\n');
            this.side = THREE.FrontSide;
        } else if (this.opt == "full") {
            this.vertexShader = `
uniform mat4 camera_iproj_matrix;
uniform mat4 camera_view_matrix;
out vec3 other_position;

void main() {
vec4 homolog = vec4(position, 1.);
homolog.z = -1.;
gl_Position = homolog;

other_position = ((camera_view_matrix) * camera_iproj_matrix * homolog).xyz;

}`
            this.fragmentShader = [SC.preamble, SC.utilities, domainstring, SC.fulltracer].join('\n');
            this.side = THREE.FrontSide;
            this.transparent = true;
        }
        this.needsUpdate = true;
    }
}

export { SDFMaterial };