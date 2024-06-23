float domain(vec3 v, float t) {
  float val1 = sphere(v-vec3(0.0,0.0,0.0), 4.0);
  return smin2(val1, box(v-vec3(3, 3, 3), vec3(2.0, 2.0, 2.0)), 0.2);
}