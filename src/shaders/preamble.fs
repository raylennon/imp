precision mediump float;

out vec4 fragColor;

uniform vec2 u_resolution;
uniform vec4 u_orientation;
uniform vec3 u_position;
uniform float u_time;
uniform float u_FL;

uniform sampler2D matcapTexture; 