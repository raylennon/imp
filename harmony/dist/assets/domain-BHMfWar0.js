const n=`precision mediump float;\r
\r
float sdSphere( vec3 p, float s )\r
{\r
  return length( p ) - s;\r
}\r
float sdBox( vec3 p, vec3 b )\r
{\r
\r
  vec3 q = abs(p) - b;\r
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);\r
}\r
float trippy(vec3 v, float t)\r
{\r
  float s = 0.4;\r
  float a = sin(s * (v.x)) * cos(s * (v.y)) + sin(s * (v.y)) * cos(s * (v.z-t)) + sin(s * (v.z-t)) * cos(s * (v.x)) -0.3 * cos(t/5.0);\r
  // a = cos(s*v.x) + cos(s*v.y)+cos(s*v.z);\r
  return a;\r
}\r
float sdCappedCylinder( vec3 p, float h, float r )\r
{\r
  vec2 d = abs(vec2(length(p.zy),p.x)) - vec2(r,h);\r
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));\r
}\r
float sdPlane( vec3 p, vec4 n )\r
{\r
  // n must be normalized\r
  return dot(p,n.xyz) + n.w;\r
}\r
\r
float smin(float a, float b, float k) {\r
  float res = exp(-k * a) + exp(-k * b);\r
  return -log(res) / k;\r
}\r
\r
\r
float domain2(vec3 v, float t) {\r
  return \r
      -smin(\r
        -sdSphere(v-vec3(0.0,60.0,0.0), 35.0),\r
          -1.0*(pow(trippy(0.5*v.xzy,1.0 ),2.0)-0.55), 1.0\r
      );\r
\r
}`;export{n as default};
