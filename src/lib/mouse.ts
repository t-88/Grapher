import { Vector2 } from "./math";

class Mouse {
    pos: Vector2;
    offset: Vector2;
    draging: boolean;

    constructor() {
        this.pos = new Vector2(0, 0);
        this.offset = new Vector2(0, 0);
        this.draging = false;
    }
}


export default Mouse;