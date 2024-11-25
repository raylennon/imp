
float domain(vec3 v, float t) {
	float cube = box(v, vec3(3.0));
        float fillet_plane = (v.x+v.y-4.0)/2.;
        fillet_plane -= 0.6*sin(t);
        cube = max(cube, fillet_plane);
        return cube;
}
