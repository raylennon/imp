const n=`precision mediump float;\r
\r
// float domain(vec3 v) {\r
//   float s = 0.5;\r
//   float a = sin(s * v.x) * cos(s * v.y) + sin(s * v.y) * cos(s * v.z) + sin(s * v.z) * cos(s * v.x);\r
//   if (v.y < 2.0) {\r
// 		return a-v.y + 2.0;\r
// 	}\r
//   return a;\r
// }\r
\r
float sdBox( vec3 p, vec3 b )\r
{\r
\r
  vec3 q = abs(p) - b;\r
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);\r
}\r
float trippy(vec3 v, float t)\r
{\r
  float s = 0.4;\r
  float a = sin(s * (v.x)) * cos(s * (v.y-t)) + sin(s * (v.y-t)) * cos(s * v.z) + sin(s * v.z) * cos(s * (v.x)) -0.3 * cos(t/5.0);\r
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
    min(\r
      max(\r
            max(-sdBox(v-vec3(10.0,10.0,15.0), vec3(30.0, 60.0, 20.0)), sdBox(v-vec3(0.0,0.0,5.0), vec3(21.0, 21.0, 11.0))), // room\r
          \r
      -min(sdBox(vec3(v.x+20.0,mod(min(v.y, 16.1)+1.0, 6.0)-3.0,(v.z-2.0)), vec3(3.0, 2.0, 5.0)), sdCappedCylinder(vec3(v.x+20.0,mod(min(v.y, 16.1)+1.0, 6.0)-3.0,v.z-7.0), 3.0, 2.0))\r
    ),\r
      max(\r
        -sdPlane(v, vec4(0.0,-1.0,0.0,-20.0)),\r
        smin(\r
          smin(\r
            0.2*(pow(trippy(1.0*v.xzy, 0.0),2.0)),\r
            sdPlane(v, vec4(0.0,0.0,1.0,5.0)),\r
            1.0\r
          ),\r
          sdPlane(v, vec4(0.0,0.0,-1.0,20.0)),\r
          1.0\r
        )\r
\r
      )\r
    );\r
}`;export{n as default};
