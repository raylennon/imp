class EditorState {
    constructor(scene) {
        this.scene = scene
        this.objects = [];
    }
    add(object) {
        this.objects.push(object);
    }

}

export {EditorState};