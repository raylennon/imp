import { SDFMaterial } from './SDFMaterial.js';
import { utilities } from './ShaderComponents.js';
import * as THREE from 'three';


class CombineMaterial extends THREE.ShaderMaterial {
    constructor(domainFunction, camera, frontRenderTarget, backRenderTarget, obj) {
        super({
            vertexShader: `
            
        uniform mat4 objectMatrix;
        out vec2 vUv; 
        out vec3 v_normal;
        
        void main() {
            
            vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
            mat4 inv = inverse(objectMatrix);
            v_normal = (inv * vec4(normal, 1.0)).xyz - (inv*vec4(0.,0.,0.,1.)).xyz;
        
            gl_Position = projectionMatrix * modelViewPosition; 
        
            vUv = gl_Position.xy; 
            vUv /= gl_Position.w;
            vUv = vUv*0.5 + 0.5;
        
        }`,
            fragmentShader: combineFragment(domainFunction),
            uniforms: {
                objectMatrix: { value: obj.matrixWorld },
                normalMatrix: { value: obj.normalMatrix },
                u_time: { value: performance.now() / 1000.0 },
                u_position: { value: camera.position },
                frontTexture: { value: frontRenderTarget.texture },
                backTexture: { value: backRenderTarget.texture },
            },
        });
        // this.transparent = true;
    }
    combineFragment(domainFunction) {
        return combineFragment(domainFunction);
    }

}

function combineFragment(domainFunction) {
    return `uniform sampler2D frontTexture;
uniform sampler2D backTexture;

varying vec2 vUv;
in vec3 v_normal;
uniform vec3 u_position;
uniform float u_time;
uniform mat3 normalMatrix;
`+ utilities + `\n` + domainFunction + `
vec3 grad (vec3 v) {
  float e = 0.0001;
  float local = domain(v, u_time);
  return normalize(vec3(
    (domain(vec3(v.x+e,v.yz),    u_time)-local)/(1.0*e),
    (domain(vec3(v.x,v.y+e,v.z), u_time)-local)/(1.0*e),
    (domain(vec3(v.xy,v.z+e),    u_time)-local)/(1.0*e)
  ));
}

void main() {
    float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
    vec3 trueCamera = u_position.xyz;

    vec4 frontColor = texture2D(frontTexture, vUv);
    vec4 backColor = texture2D(backTexture, vUv);

    float backDistance = backColor.x ;
    float frontDistance = length(trueCamera-frontColor.xyz);

    vec3 normal = frontColor.w==0. ? v_normal : (grad(frontColor.xyz));
    vec3 surf_pos = frontColor.xyz;
    vec3 surf_norm = normalize(normal);
    mat3 noscale = normalMatrix;
    noscale[0][0]=1.;
    noscale[1][1]=1.;
    noscale[2][2]=1.;
    // normal = normalize(normalMatrix * normal);
    normal = normalize(noscale * normal);
    vec3 color = 0.5 * normal+0.5;

    gl_FragColor = backDistance > frontDistance ? vec4(color, 1.0) : vec4(vec3(0.2), 0.1);


    }`
}

export { CombineMaterial };