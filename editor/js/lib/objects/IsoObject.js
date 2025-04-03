import { FieldObject } from "./FieldObject";
import {Euler, Vector3} from 'three';

// Represents an Isosurface of a function-defined field

class IsoObject extends FieldObject {
    constructor(origin = new Vector3(0,0,0), rotation = new Euler(0,0,0),f = function(x,y,z) {return 0;}, val =0) {
        super();
        this.function = f;
        this.isovalue = val;
        this.type = "Scalar Isosurface";
    }
}

export {IsoObject};