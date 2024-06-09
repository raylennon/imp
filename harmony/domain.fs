#version 300 es
precision mediump float;

float sdSphere( vec3 p, float s )
{
  return length( p ) - s;
}
float sdBox( vec3 p, vec3 b )
{

  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}
float trippy(vec3 v, float t)
{
  float s = 0.4;
  float a = sin(s * (v.x)) * cos(s * (v.y)) + sin(s * (v.y)) * cos(s * (v.z-t)) + sin(s * (v.z-t)) * cos(s * (v.x)) -0.3 * cos(t/5.0);
  // a = cos(s*v.x) + cos(s*v.y)+cos(s*v.z);
  return a;
}
float sdCappedCylinder( vec3 p, float h, float r )
{
  vec2 d = abs(vec2(length(p.zy),p.x)) - vec2(r,h);
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}
float sdPlane( vec3 p, vec4 n )
{
  // n must be normalized
  return dot(p,n.xyz) + n.w;
}

float smin(float a, float b, float k) {
  float res = exp(-k * a) + exp(-k * b);
  return -log(res) / k;
}


float domain2(vec3 v, float t) {
  float trip = 1.0*(trippy(3.3*v.xzy,t));
  float tripbig = 1.0*(trippy(0.3*v.xzy,0.3*t));

 
  float val1 = -min(trip+0.6, 0.6-trip);
  // float val1 = trip;

  float val2 = -min(tripbig+0.6, 0.6-tripbig);

  return -smin(smin(-val1, -val2, 2.2), -sdSphere(v-vec3(-60.0,0.0,0.0), 35.0), 3.0);
  // return -smin(-val1, -val2, 2.2);
}
float domain(vec3 v, float t) {
  float val1 = -smin(
        -sdSphere(v-vec3(0.0,60.0,0.0), 35.0),
          -1.0*(trippy(1.3*v.xzy,1.0)-0.15), 1.0
      );
  return val1;

}