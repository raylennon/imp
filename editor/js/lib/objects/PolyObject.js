import { BaseObject } from "./BaseObject";
import {BufferGeometry, Euler, Vector3} from 'three';

class PolyObject extends BaseObject {
    constructor(origin = new Vector3(0,0,0), rotation = new Euler(0,0,0), geometry = new BufferGeometry()) {
        super();
        this.geometry = geometry;
        this.type = "Polygonal Mesh";

    }
}

export {PolyObject};