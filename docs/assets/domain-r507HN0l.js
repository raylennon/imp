const a=`\r
float domain(vec3 v, float t) {\r
	float cube = box(v, vec3(3.0));\r
        float fillet_plane = (v.x+v.y-4.0)/2.;\r
        fillet_plane -= 0.6*sin(t);\r
        cube = max(cube, fillet_plane);\r
        return cube;\r
}\r`;export{a as default};
