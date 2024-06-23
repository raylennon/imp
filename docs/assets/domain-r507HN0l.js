const a=`float domain(vec3 v, float t) {\r
  float val1 = sphere(v-vec3(0.0,0.0,0.0), 4.0);\r
  return smin2(val1, box(v-vec3(3, 3, 3), vec3(2.0, 2.0, 2.0)), 0.2);\r
}`;export{a as default};
