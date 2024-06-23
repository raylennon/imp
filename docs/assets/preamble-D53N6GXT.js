const r=`precision mediump float;\r
\r
out vec4 fragColor;\r
\r
uniform vec2 u_resolution;\r
uniform vec4 u_orientation;\r
uniform vec3 u_position;\r
uniform float u_time;\r
uniform float u_FL;\r
\r
uniform sampler2D matcapTexture; `;export{r as default};
