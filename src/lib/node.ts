import camera from "./camera";
import { engine } from "./engine";
import { circleCollidePoint, Vector2 } from "./math";
import type Mouse from "./mouse";
import mouse from "./mouse";
import renderer from "./render";

type NodeType = "None" | "Input" | "Output";
type PinMouseAction = "Drop" | "Select";


const PIN_RADUIS = 20;


class Pin {
    pos : Vector2;
    hover : boolean;
    uuid: string;

    constructor() {
        this.pos = new Vector2(0,0);
        this.uuid = crypto.randomUUID();
        this.hover = false;
    }
}

class Node {
    pos: Vector2;
    size: Vector2;
    pin : Pin = new Pin();
    draging: boolean = false;
    hovering: boolean = false;
    type: NodeType = "None";


    constructor(x: number,y: number,w: number,h: number) {
        this.pos = new Vector2(x, y);
        this.size = new Vector2(w, h);
        this.pin.pos = new Vector2(this.pos.x + (this.size.w - PIN_RADUIS) / 2, this.pos.y + this.size.h);
    }


    AABB(x: number, y: number, w: number, h: number) {
        return this.pos.x + this.size.w > x && this.pos.y + this.size.h > y && x + w > this.pos.x && y + h > this.pos.y;
    }

    collidePoint(p: Vector2) {
        return this.AABB(p.x, p.y, 1, 1);
    }

   


    onMouseMove() {
    }

    onMouseUp() {
        if(this.pin.hover) engine.onPinSelected({val : this.pin} ,"Drop");

    }
    onMouseDown() {
        if(this.pin.hover) engine.onPinSelected({val : this.pin},"Select");
        if(this.collidePoint(camera.toScreenSpace(new Vector2(mouse.pos.x,mouse.pos.y)))) {
            let THIS = this;
            engine.outlineRect = {
                posPointer: { val : THIS.pos},
                sizePointer: { val : THIS.size},
            };
        }
    }

    update() {
        let pinPos = camera.toWorldSpace(new Vector2(this.pin.pos.x,this.pin.pos.y));
        this.pin.hover = !engine.node.draging && circleCollidePoint(pinPos.x,pinPos.y,PIN_RADUIS,mouse.pos.x,mouse.pos.y);
        this.hovering = this.collidePoint(camera.toScreenSpace(new Vector2(mouse.pos.x,mouse.pos.y)));
    }

    draw() {
        renderer.drawRect(this.pos.x, this.pos.y, this.size.x, this.size.y, "white");
        renderer.drawCircle(this.pin.pos.x, this.pin.pos.y, PIN_RADUIS, "red");
        if(this.pin.hover)  renderer.drawCircleOutline(this.pin.pos.x, this.pin.pos.y, PIN_RADUIS, "green");
        if(!this.pin.hover && this.hovering) renderer.drawRectOutline(this.pos.x - 1, this.pos.y - 1, this.size.w + 1, this.size.h + 1, "blue") 
    }
}

class INode extends Node {
    constructor(x: number, y: number, w: number, h: number) {
        super(x,y,w,h);
        this.type = "Input";
        this.pin.pos = new Vector2(this.pos.x + (this.size.w - PIN_RADUIS) / 2, this.pos.y + this.size.h);
    }
    update() {
        this.pin.pos.x = this.pos.x + (this.size.w - PIN_RADUIS) / 2; 
        this.pin.pos.y = this.pos.y + this.size.h;
        super.update();

    }
}
class ONode extends Node {
    constructor(x: number, y: number, w: number, h: number) {
        super(x,y,w,h);
        this.type = "Output";
        this.pin.pos = new Vector2(this.pos.x + (this.size.w - PIN_RADUIS) / 2, this.pos.y);
    }
    update() {
        this.pin.pos.x = this.pos.x + (this.size.w - PIN_RADUIS) / 2;
        this.pin.pos.y = this.pos.y;
        super.update();
    }
}



export { Node, INode, ONode , Pin};
export type { PinMouseAction };
