import camera from "./camera";
import { engine } from "./engine";
import { circleCollidePoint, rectCollidePoint, Vector2 } from "./math";
import mouse from "./mouse";
import renderer from "./render";

type NodeType = "None" | "Input" | "Output";
type PinMouseAction = "Drop" | "Select";


const PIN_radius = 14;
const MAX_WIDTH = 200;


class Pin {
    pos : Vector2;
    hover : boolean;
    uuid: string;
    render_wire_offset : Vector2 = new Vector2(0,0)
    

    constructor() {
        this.pos = new Vector2(0,0);
        this.uuid = crypto.randomUUID();
        this.hover = false;
    }
}

class Node {
    pos: Vector2;
    size: Vector2;
    orig_size : Vector2;

    pin : Pin = new Pin();
    draging: boolean = false;
    hovering: boolean = false;
    type: NodeType = "None";

    text : string = "A";
    orig_text: string = "AA";
    splited_text : Array<string> = new Array();


    constructor(x: number,y: number,w: number,h: number) {
        this.pos = new Vector2(x, y);
        this.size = new Vector2(w, h);
        this.pin.pos = new Vector2(this.pos.x + (this.size.w - PIN_radius) / 2, this.pos.y + this.size.h);
        this.orig_size = new Vector2(w, h);;
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
        this.pin.hover = !engine.node.draging && rectCollidePoint(mouse.pos.x,mouse.pos.y,pinPos.x,pinPos.y,PIN_radius,PIN_radius);
        this.hovering = this.collidePoint(camera.toScreenSpace(new Vector2(mouse.pos.x,mouse.pos.y)));

        if(this.orig_text !== this.text) {
            this.text = this.orig_text;
            this.splited_text = [];
            
            this.size.x = renderer.textWidth(this.text,16) + 50;
            let chars : Map<string,number> = new Map();
            let all_width = 0;
            let str = "";

            this.splited_text = [];
            for(let char of this.text) {
                let width = 0;
                if(![...chars.keys()].includes(char)) {
                    chars.set(char,renderer.textWidth(char,16) + 1);
                }
                width = chars.get(char)!; 

                if(all_width + width < MAX_WIDTH) {
                    str += char;
                } else {
                    this.splited_text.push(str);
                    str = "";
                    all_width = 0;
                }
                all_width += width;
            }
            if(str.length) {
                this.splited_text.push(str);
            }


            this.size.y = this.orig_size.y + (this.splited_text.length - 1) *  20 ;
            this.size.x = Math.min(this.size.x,MAX_WIDTH);
        }
    }

    draw() {

        // if(!this.pin.hover && this.hovering) renderer.drawRectOutline(this.pos.x - 1, this.pos.y - 1, this.size.w + 2, this.size.h + 2, "blue",{radius : 4}); 
        renderer.drawRect(this.pos.x, this.pos.y, Math.min(this.size.w,MAX_WIDTH),  this.size.h, "grey",{radius : 4});
        for(let i = 0; i < this.splited_text.length; i++) {
            renderer.drawText(
                             this.splited_text[i],
                             16,
                             this.pos.x + (Math.min(this.size.w,MAX_WIDTH) - renderer.textWidth(this.splited_text[i],16)) / 2,
                             this.pos.y + i * 20 + 24,
                             "white",
                            );
        }

        renderer.drawRect(this.pin.pos.x, this.pin.pos.y, PIN_radius,PIN_radius, "red",);
        if(this.pin.hover)  renderer.drawRect(this.pin.pos.x, this.pin.pos.y, PIN_radius,PIN_radius, "green");

    }
}

class INode extends Node {
    constructor(x: number, y: number, w: number, h: number) {
        super(x,y,w,h);
        this.type = "Input";
        this.pin.pos = new Vector2(this.pos.x + (this.size.w - PIN_radius) / 2, this.pos.y + this.size.h);
        this.pin.render_wire_offset.y = -PIN_radius;
    }
    update() {
        this.pin.pos.x = this.pos.x + (this.size.w  - PIN_radius ) / 2; 
        this.pin.pos.y = this.pos.y + this.size.h ;
        super.update();

    }
}
class ONode extends Node {
    constructor(x: number, y: number, w: number, h: number) {
        super(x,y,w,h);
        this.type = "Output";
        this.pin.pos = new Vector2(this.pos.x + (this.size.w - PIN_radius) / 2, this.pos.y);
    }
    update() {
        this.pin.pos.x = this.pos.x + (this.size.w - PIN_radius) / 2;
        this.pin.pos.y = this.pos.y - PIN_radius;
        super.update();
    }
}



export { Node, INode, ONode , Pin, PIN_radius};
export type { PinMouseAction };
