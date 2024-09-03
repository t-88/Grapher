import camera from "./camera";
import { engine } from "./engine";
import { circleCollidePoint, Vector2 } from "./math";
import type Mouse from "./mouse";
import renderer from "./render";

type NodeType = "None" | "Input" | "Output";
type PinMouseAction = "Drop" | "Select";


const PIN_RADUIS = 20;

class Node {
    pos: Vector2;
    size: Vector2;
    pinPos : Vector2;
    pinHover : boolean = false;
    draging: boolean = false;
    type: NodeType = "None";


    constructor(x: number,y: number,w: number,h: number) {
        this.pos = new Vector2(x, y);
        this.size = new Vector2(w, h);
        this.pinPos = new Vector2(this.pos.x + (this.size.w - PIN_RADUIS) / 2, this.pos.y + this.size.h);
    }


    AABB(x: number, y: number, w: number, h: number) {
        return this.pos.x + this.size.w > x && this.pos.y + this.size.h > y && x + w > this.pos.x && y + h > this.pos.y;
    }

    collidePoint(p: Vector2) {
        return this.AABB(p.x, p.y, 1, 1);
    }

    draw() {
        renderer.drawRect(this.pos.x, this.pos.y, this.size.x, this.size.y, "white");
        renderer.drawCircle(this.pinPos.x, this.pinPos.y, PIN_RADUIS, "red");
        if(this.pinHover)  renderer.drawCircleOutline(this.pinPos.x, this.pinPos.y, PIN_RADUIS, "green");
    }


    onMouseMove(mouse : Mouse) {
    }

    onMouseUp(mouse : Mouse) {
        if(this.pinHover) engine.onPinSelected({val : this.pinPos} ,"Drop");

    }
    onMouseDown(mouse : Mouse) {
        if(this.pinHover) engine.onPinSelected({val : this.pinPos},"Select");
    }

    update(mouse : Mouse) {
        let pinPos = camera.toWorldSpace(new Vector2(this.pinPos.x,this.pinPos.y));
        this.pinHover = !engine.node.draging && circleCollidePoint(pinPos.x,pinPos.y,PIN_RADUIS,mouse.pos.x,mouse.pos.y)
    }
}

class INode extends Node {
    constructor(x: number, y: number, w: number, h: number) {
        super(x,y,w,h);
        this.type = "Input";
        this.pinPos = new Vector2(this.pos.x + (this.size.w - PIN_RADUIS) / 2, this.pos.y + this.size.h);
    }
    update(mouse : Mouse) {
        this.pinPos.x = this.pos.x + (this.size.w - PIN_RADUIS) / 2; 
        this.pinPos.y = this.pos.y + this.size.h;

        super.update(mouse);

    }
}
class ONode extends Node {
    constructor(x: number, y: number, w: number, h: number) {
        super(x,y,w,h);
        this.type = "Output";
        this.pinPos = new Vector2(this.pos.x + (this.size.w - PIN_RADUIS) / 2, this.pos.y);
    }
    update(mouse : Mouse) {
        this.pinPos.x = this.pos.x + (this.size.w - PIN_RADUIS) / 2;
        this.pinPos.y = this.pos.y;

        super.update(mouse);
    }
}



export { Node, INode, ONode };
export type { PinMouseAction };
