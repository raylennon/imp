import { BaseObject } from "./BaseObject";
import {Euler, Vector3} from 'three';

class FieldObject extends BaseObject {
    constructor(origin = new Vector3(0,0,0), rotation = new Euler(0,0,0),f = function(x,y,z) {return 0;}) {
        super();
        this.function = f;
        this.type = "Field";
    }
}

export {FieldObject};