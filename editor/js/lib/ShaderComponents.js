const vertex = `
out vec3 worldPosition;

void main() {
  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * modelViewPosition; 
  worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
}`;

const preamble = `precision mediump float;

uniform vec2 u_resolution;
uniform vec4 u_orientation;
uniform vec3 u_position;
uniform float u_time;
uniform float u_FL;

// uniform mat4 camera_matrix;

uniform sampler2D matcapTexture;`;

const utilities = `float sphere( vec3 p, float s )
{
  return length( p ) - s;
}
float box( vec3 p, vec3 b )
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}
float plane( vec3 p, vec4 n )
{
  return dot(p,n.xyz) + n.w;
}
float smin(float a, float b, float k) {
  float res = exp(-k * a) + exp(-k * b);
  return -log(res) / k;
}
float smin2( float a, float b, float k )
{
    k *= 6.0;
    float h = max( k-abs(a-b), 0.0 )/k;
    return min(a,b) - h*h*h*k*(1.0/6.0);
}`
const fronttracer = `

  out vec4 loc;
  in vec3 worldPosition;

  vec3 trueCamera;
  vec3 current;
  vec3 direction;
  float value;
  int nSteps = 0;

  void main() {
    value = 100.;
    current = worldPosition.xyz;
    trueCamera = u_position.xyz;
    direction = normalize(worldPosition - trueCamera);
    // direction = (camera_matrix * vec4(direction,1.)).xyz;
    while (nSteps < 100 && value > 0.0) {
      value = domain(current, u_time); 
      if ( value > 0.0) {
        current += direction * max(0., value);
        nSteps += 1;
      } 
    }
    loc = vec4(current, (nSteps==0)? 0. : 1.) ;
}`;

const backtracer = `

out float dist;

    in vec3 worldPosition;

    void main() {
      dist = length(worldPosition-u_position);
    }
    `;
const fulltracer = `

    out vec4 color;
    in vec3 other_position;
    // in vec3 worldPosition;
  
  uniform mat4 camera_iproj_matrix;
  uniform mat4 camera_view_matrix;

  
  vec3 trueCamera;
  // vec3 other_position;
    vec3 current;
    vec3 direction;
    float value;
    float dist;
    int nSteps = 0;

  vec3 grad (vec3 v) {
    float e = 0.0001;
    float local = domain(v,u_time);
    vec3 g = vec3(
        (domain(vec3(v.x+e,v.yz),u_time)-local)/(1.0*e),
        (domain(vec3(v.x,v.y+e,v.z),u_time)-local)/(1.0*e),
        (domain(vec3(v.xy,v.z+e),u_time)-local)/(1.0*e)
    );
    return g;
    }

    void main() {
      value = 100.;
      dist =0.;

      // other_position = ((camera_view_matrix) * camera_iproj_matrix * vec4(worldPosition, 1.0)).xyz;

      trueCamera = u_position.xyz;
      current = trueCamera;

      direction = normalize(other_position - trueCamera);
      int MAX_STEPS = 1000;
      while (nSteps < MAX_STEPS && value > 0.0) {
        value = domain(current, u_time); 
        if ( value > 0.0) {
          dist += value;
          current += direction * max(0., value);
          nSteps += 1;
          }  else {
            break;
          }
      }
      if (value > 0.1) {
        color = vec4(0.0);
      }else {
        // color = vec4( vec3(0.5)+0.3*normalize(grad(current)), 1.0) ;
        color = vec4( normalize(grad(current)), 1.0) ;
      }
  }`;

export { vertex, preamble, utilities, fronttracer, backtracer, fulltracer };

