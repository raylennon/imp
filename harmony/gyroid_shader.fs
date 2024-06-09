out vec4 fragColor;

uniform vec2 u_resolution;
uniform vec4 u_orientation;
uniform vec3 u_position;
uniform float u_time;
uniform float u_FL;

uniform sampler2D matcapTexture; 

float softshadow( in vec3 ro, in vec3 rd, float mint, float maxt, float k )
{
    float res = 1.0;
    float tstep = mint;
    for( int i=0; i<256 && tstep<maxt; i++ )
    {
        float h = domain2(ro + rd*tstep, u_time);
        if( h<0.001 )
            return 0.0;
        res = min( res, k*h/tstep );
        tstep += h;
    }
    return res;
}


float udBox( vec3 p, vec3 b )
{
  return length(max(abs(p)-b,0.0));
}

vec2 matcap(vec3 eye, vec3 normal) {
  vec3 reflected = reflect(-eye, normal);
  float m = 2.8284271247461903 * sqrt( abs(reflected.y)+1.0 );
  return reflected.xz / m + 0.5;
}

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

  vec2 uv = 2.0* gl_FragCoord.xy / u_resolution - 1.0;
  uv.x *= u_resolution.x/u_resolution.y;
  float time = u_time;
  
  float MAX_DIST = 100.0;
  const int MAX_STEPS = 100;

  vec3 loc = u_position.xzy;
  loc.y = -loc.y;
  
  vec3 dir =  vec3(uv.x, (u_resolution.x/u_resolution.y) * (u_FL/35.0)*2.0 , uv.y) * rot;

  float dist = 0.0;
  float step_fac = 1.0/length(dir);
  float current_sign = sign(domain2(loc,u_time));

for(int i = 0; i < MAX_STEPS; i++){
    if (sign(domain2(loc,u_time)) != current_sign) {
      break;
    }
    dist += abs(domain2(loc,u_time));
    loc = loc + step_fac*dir*abs(domain2(loc,u_time));
  }

  vec3 v_normal = grad(loc);
  vec3 v_position = loc;
  v_normal = v_normal.xzy;
  v_normal.z = -v_normal.z;

  // vec3 blendWeights = abs(v_normal);
  // blendWeights /= (blendWeights.x + blendWeights.y + blendWeights.z);

  // vec4 colorX = texture(matcapTexture, v_position.yz/10.0);
  // vec4 colorY = texture(matcapTexture, v_position.zx/10.0);
  // vec4 colorZ = texture(matcapTexture, v_position.xy/10.0);

  // vec4 triplanarColor = colorX * blendWeights.x + colorY * blendWeights.y + colorZ * blendWeights.z;
  
  fragColor = vec4(1.0, 1.0, 1.0, 1.0);
  fragColor.xyz -= 0.0*v_normal;
  
  //  fragColor.xyz = triplanarColor.xyz;
  // the color parts get modified by visual.fs