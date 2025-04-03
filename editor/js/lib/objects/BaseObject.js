import {Euler, Vector3} from 'three';

class BaseObject {
    constructor(origin = new Vector3(0,0,0), rotation = new Euler(0,0,0)) {
        this.origin = origin;
        this.rotation = rotation;
    }
}

export {BaseObject};