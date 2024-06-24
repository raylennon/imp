const r=`float udBox( vec3 p, vec3 b )\r
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
vec3 grad (vec3 v) {\r
  float e = 0.0001;\r
  float local = domain(v,u_time);\r
  vec3 g = vec3(\r
    (domain(vec3(v.x+e,v.yz),u_time)-local)/(1.0*e),\r
    (domain(vec3(v.x,v.y+e,v.z),u_time)-local)/(1.0*e),\r
    (domain(vec3(v.xy,v.z+e),u_time)-local)/(1.0*e)\r
  );\r
\r
  // g = g/length(g);\r
  return g;\r
}\r
void main() {\r
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
  vec2 uv = 2.0* gl_FragCoord.xy / u_resolution - 1.0;\r
  uv.x *= u_resolution.x/u_resolution.y;\r
  float time = u_time;\r
  \r
  float MAX_DIST = 1000.0;\r
  const int MAX_STEPS = 1000;\r
\r
  vec3 loc = u_position.xzy;\r
  loc.y = -loc.y;\r
  \r
  vec3 dir =  vec3(uv.x, (u_resolution.x/u_resolution.y) * (u_FL/35.0)*2.0 , uv.y) * rot;\r
\r
  float dist = 0.0;\r
  float step_fac = 1.0/length(dir);\r
  float current_sign = sign(domain(loc,u_time));\r
  fragColor = vec4(1.0);\r
  for(int i = 0; i < MAX_STEPS; i++){\r
    if (sign(domain(loc,u_time)) != current_sign) {\r
      break;\r
    } \r
    dist += abs(domain(loc,u_time));\r
    loc = loc + step_fac*dir*abs(domain(loc,u_time));\r
  }\r
  \r
  vec3 v_normal = grad(loc);\r
  vec3 v_position = loc;\r
  v_normal = v_normal.xzy;\r
  v_normal.z = -v_normal.z;\r
\r
  fragColor.w *= exp(-0.0001*pow(dist, 1.6))/1.5;\r
  fragColor.xyz *= 0.2 * v_normal / step_fac;\r
  fragColor.xyz += 0.2;\r
\r
  // fragColor.xyz = vec3(length(fragColor.xyz));\r
\r
  // fragColor.yz -= 10.0*abs(length(v_normal)-1.0);\r
\r
}`;export{r as default};
