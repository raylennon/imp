precision mediump float;


// float domain(vec3 v) {
//     vec3 l = vec3(3.0, 0.0, 0.0);
//     return length(v-l)-1.0;
// }

// float size_factor = 3.0*3.141592653589793238462;

float domain(vec3 v) {
  float s = 0.5;
  float a = sin(s * v.x) * cos(s * v.y) + sin(s * v.y) * cos(s * v.z) + sin(s * v.z) * cos(s * v.x);
  if (v.y < 2.0) {
		return a-v.y + 2.0;
	}
  return a;
}

float domain2(vec3 v, float t) {
  float s = 0.5;
  float a = sin(s * (v.x)) * cos(s * (v.y-t)) + sin(s * (v.y-t)) * cos(s * v.z) + sin(s * v.z) * cos(s * (v.x)) -cos(t/2.0);
  return max(-(v.y-2.0), a*a);
}