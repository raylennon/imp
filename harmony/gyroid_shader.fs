uniform vec2 u_resolution;
uniform vec4 u_orientation;
uniform vec3 u_position;
uniform float u_time;
uniform float u_FL;

uniform sampler2D matcapTexture; // Your matcap texture


float udBox( vec3 p, vec3 b )
{
  return length(max(abs(p)-b,0.0));
}

vec2 matcap(vec3 eye, vec3 normal) {
  vec3 reflected = reflect(-eye, normal);
  float m = 2.8284271247461903 * sqrt( abs(reflected.y)+1.0 );
  return reflected.xz / m + 0.5;
}

float or = u_orientation.w;
float ox = u_orientation.x;
float oz = u_orientation.y;
float oy = -u_orientation.z;
float s = 1.0 / (or*or + ox*ox + oy*oy + oz*oz);

mat3 rot = mat3(
    1.0 - 2.0*s*(oy*oy+oz*oz), 2.0 * s * (ox*oy - oz*or), 2.0 * s * (ox*oz + oy*or),
		2.0 * s * (ox*oy + oz*or), 1.0 - 2.0*s*(ox*ox+oz*oz), 2.0 * s * (oy*oz - ox*or),
		2.0 * s * (ox*oz - oy*or), 2.0 * s * (oy*oz + ox*or), 1.0 - 2.0*s*(ox*ox+oy*oy)
);

vec3 grad (vec3 v) {
  float e = 0.001;
  float local = domain2(v,u_time);
  vec3 g = vec3(
    (domain2(vec3(v.x+e,v.yz),u_time)-local)/(1.0*e),
    (domain2(vec3(v.x,v.y+e,v.z),u_time)-local)/(1.0*e),
    (domain2(vec3(v.xy,v.z+e),u_time)-local)/(1.0*e)
  );

  g = g/length(g);
  return g;
}

void main() {

  vec2 uv = 2.0* gl_FragCoord.xy / u_resolution - 1.0;
  uv.x *= u_resolution.x/u_resolution.y;
  float time = u_time;
  
  float MAX_DIST = 100.0;
  const int MAX_STEPS = 120;

  vec3 loc = u_position.xzy;
  loc.y = -loc.y;
  vec3 dir =  vec3(uv.x, (u_resolution.x/u_resolution.y) * (u_FL/35.0)*2.0 , uv.y) * rot;

  vec3 base_color = vec3(1.0, 1.0, 1.0);
  float dist = 0.0;

  float step_fac = 1.0/length(dir);

  float current_sign = sign(domain2(loc,u_time));

for(int i = 0; i < MAX_STEPS; i++){
    if (sign(domain2(loc,u_time)) != current_sign) {
      break;
    }
    dist += abs(step_fac * domain2(loc,u_time));
    loc = loc + step_fac*dir*abs(domain2(loc,u_time));
  }

  float val = exp(-0.0001*pow(dist, 2.2))/1.0;
  // float val = 1.0;
  
    float gx = mod(loc.x, 3.1415926/2.0);
    float gy = mod(loc.y, 3.1415926/2.0);
    float gz = mod(loc.z,3.1415926/2.0);
    float bt = 0.1;
    // if (loc.z<-4.99) {
        if (( (-bt < gx && bt > gx) || (-bt < gy && bt > gy) || (-bt < gz && bt > gz) )) {
          val *= 0.9;
        }
    // }q

  vec3 g = grad(loc);
  // val = 1.0-val;
  float val1 = 0.5;
  float val2 = 0.25*g.x+0.75;
  gl_FragColor = vec4(val*val2, val*val2, val*val2, 1.0);
  }