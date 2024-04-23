precision mediump float;

// float domain(vec3 v) {
//   float s = 0.5;
//   float a = sin(s * v.x) * cos(s * v.y) + sin(s * v.y) * cos(s * v.z) + sin(s * v.z) * cos(s * v.x);
//   if (v.y < 2.0) {
// 		return a-v.y + 2.0;
// 	}
//   return a;
// }
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
  float a = sin(s * (v.x)) * cos(s * (v.y-t)) + sin(s * (v.y-t)) * cos(s * v.z) + sin(s * v.z) * cos(s * (v.x)) -0.3 * cos(t/5.0);
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
  return 
    min(
      max(
            max(-sdBox(v-vec3(10.0,10.0,15.0), vec3(30.0, 60.0, 20.0)), sdBox(v-vec3(0.0,0.0,5.0), vec3(21.0, 21.0, 11.0))), // room
          
      -min(sdBox(vec3(v.x+20.0,mod(min(v.y, 16.1)+1.0, 6.0)-3.0,(v.z-2.0)), vec3(3.0, 2.0, 5.0)), sdCappedCylinder(vec3(v.x+20.0,mod(min(v.y, 16.1)+1.0, 6.0)-3.0,v.z-7.0), 3.0, 2.0))
    ),
      max(
        -sdBox(v-vec3(0.0,0.0,10.0), vec3(30.0,30.0,15.0)),
        smin(
          smin(
            0.1*(pow(trippy(1.0*v.xzy,0.0 ),2.0)-0.05),
            sdPlane(v, vec4(0.0,0.0,1.0,5.0)),
            1.0
          ),
          sdPlane(v, vec4(0.0,0.0,-1.0,20.0)),
          1.0
        )

      )
    );
}