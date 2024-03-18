const n=`precision mediump float;\r
\r
\r
// float domain(vec3 v) {\r
//     vec3 l = vec3(3.0, 0.0, 0.0);\r
//     return length(v-l)-1.0;\r
// }\r
\r
// float size_factor = 3.0*3.141592653589793238462;\r
\r
float domain(vec3 v) {\r
  float s = 0.5;\r
  float a = sin(s * v.x) * cos(s * v.y) + sin(s * v.y) * cos(s * v.z) + sin(s * v.z) * cos(s * v.x);\r
  if (v.y < 2.0) {\r
		return a-v.y + 2.0;\r
	}\r
  return a;\r
}\r
\r
float domain2(vec3 v, float t) {\r
  float s = 0.5;\r
  float a = sin(s * (v.x)) * cos(s * (v.y-t)) + sin(s * (v.y-t)) * cos(s * v.z) + sin(s * v.z) * cos(s * (v.x)) -0.3 * cos(t/5.0);\r
  return max(-(v.y-2.0), a*a - 0.2);\r
}`;export{n as default};
