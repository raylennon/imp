const r=`uniform vec2 u_resolution;\r
uniform vec4 u_orientation;\r
uniform vec3 u_position;\r
uniform float u_time;\r
uniform float u_FL;\r
\r
// uniform vec4 bingus;\r
uniform sampler2D matcapTexture; // Your matcap texture\r
\r
\r
float udBox( vec3 p, vec3 b )\r
{\r
  return length(max(abs(p)-b,0.0));\r
}\r
\r
vec2 matcap(vec3 eye, vec3 normal) {\r
  vec3 reflected = reflect(-eye, normal);\r
  float m = 2.8284271247461903 * sqrt( abs(reflected.y)+1.0 );\r
  return reflected.xz / m + 0.5;\r
}\r
\r
float or = u_orientation.w;\r
float ox = u_orientation.x;\r
float oz = u_orientation.y;\r
float oy = -u_orientation.z;\r
float s = 1.0 / (or*or + ox*ox + oy*oy + oz*oz);\r
\r
mat3 rot = mat3(\r
    1.0 - 2.0*s*(oy*oy+oz*oz), 2.0 * s * (ox*oy - oz*or), 2.0 * s * (ox*oz + oy*or),\r
		2.0 * s * (ox*oy + oz*or), 1.0 - 2.0*s*(ox*ox+oz*oz), 2.0 * s * (oy*oz - ox*or),\r
		2.0 * s * (ox*oz - oy*or), 2.0 * s * (oy*oz + ox*or), 1.0 - 2.0*s*(ox*ox+oy*oy)\r
);\r
\r
vec3 grad (vec3 v) {\r
  float e = 0.001;\r
  float local = domain2(v,u_time);\r
  vec3 g = vec3(\r
    (domain2(vec3(v.x+e,v.yz),u_time)-local)/(1.0*e),\r
    (domain2(vec3(v.x,v.y+e,v.z),u_time)-local)/(1.0*e),\r
    (domain2(vec3(v.xy,v.z+e),u_time)-local)/(1.0*e)\r
  );\r
\r
  g = g/length(g);\r
  return g;\r
}\r
void main() {\r
\r
  vec2 uv = 2.0* gl_FragCoord.xy / u_resolution - 1.0;\r
  uv.x *= u_resolution.x/u_resolution.y;\r
  float time = u_time;\r
  \r
  float MAX_DIST = 100.0;\r
  const int MAX_STEPS = 120;\r
\r
  vec3 loc = u_position.xzy;\r
  loc.y = -loc.y;\r
  \r
  \r
  \r
  vec3 dir =  vec3(uv.x, (u_resolution.x/u_resolution.y) * (u_FL/35.0)*2.0 , uv.y) * rot;\r
\r
  vec3 base_color = vec3(1.0, 1.0, 1.0);\r
  float dist = 0.0;\r
\r
  float step_fac = 1.0/length(dir);\r
\r
  float current_sign = sign(domain2(loc,u_time));\r
\r
for(int i = 0; i < MAX_STEPS; i++){\r
    if (sign(domain2(loc,u_time)) != current_sign) {\r
      break;\r
    }\r
    dist += abs(step_fac * domain2(loc,u_time));\r
    loc = loc + step_fac*dir*abs(domain2(loc,u_time));\r
  }\r
\r
  float val = exp(-0.001*pow(dist, 2.2))/1.0;\r
  // float val = 1.0;\r
  \r
    float gx = mod(loc.x, 3.1415926/2.0);\r
    float gy = mod(loc.y, 3.1415926/2.0);\r
    float gz = mod(loc.z,3.1415926/2.0);\r
    float bt = 0.1;\r
    // if (loc.z<-4.99) {\r
        if (( (-bt < gx && bt > gx) || (-bt < gy && bt > gy) || (-bt < gz && bt > gz) )) {\r
          val *= 0.9;\r
        }\r
    // }q\r
\r
  vec3 g = grad(loc);\r
  // val = 1.0-val;\r
  float val1 = 0.5;\r
  float val2 = 0.25*g.x+0.75;\r
  vec2 bingus = matcap(dir, g);\r
  \r
  gl_FragColor = vec4(val*val2, val*val2, val*val2, 1.0);\r
\r
  // gl_FragColor = vec4(texture2D(\r
  //   matcapTexture, bingus\r
  // ).rgb, 1.0);\r
\r
 }`;export{r as default};
