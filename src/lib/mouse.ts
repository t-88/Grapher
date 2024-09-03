import { Vector2 } from "./math";

class Mouse {
    static #instance: Mouse;


    pos: Vector2;
    offset: Vector2;
    draging: boolean;

    constructor() {
        this.pos = new Vector2(0, 0);
        this.offset = new Vector2(0, 0);
        this.draging = false;
    }

    public static get instance(): Mouse {
        if (!Mouse.#instance) {
            Mouse.#instance = new Mouse();
        }
        return Mouse.#instance;
    }    
}

const mouse = Mouse.instance;
export default mouse;