const n=`float sphere( vec3 p, float s )\r
{\r
  return length( p ) - s;\r
}\r
float box( vec3 p, vec3 b )\r
{\r
  vec3 q = abs(p) - b;\r
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);\r
}\r
float plane( vec3 p, vec4 n )\r
{\r
  return dot(p,n.xyz) + n.w;\r
}\r
float smin(float a, float b, float k) {\r
  float res = exp(-k * a) + exp(-k * b);\r
  return -log(res) / k;\r
}\r
float smin2( float a, float b, float k )\r
{\r
    k *= 6.0;\r
    float h = max( k-abs(a-b), 0.0 )/k;\r
    return min(a,b) - h*h*h*k*(1.0/6.0);\r
}`;export{n as default};
