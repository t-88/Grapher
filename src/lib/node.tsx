import { proxy, useSnapshot } from "valtio";
import camera from "./camera";
import { engine } from "./engine";
import { rectCollidePoint, Vector2 } from "./math";
import mouse from "./mouse";
import renderer from "./render";
import { mkProxy } from "./utils";

import "./node.css";

const PIN_radius = 14;



function NodeElem({ node }: { node: Node }) {
    const posSnap = useSnapshot(node.pos);

    const container_style: React.CSSProperties = {
        position: "absolute",
        left: `${posSnap.x}px`, top: `${posSnap.y}px`,
    };
    const node_style: React.CSSProperties = {
        position: "absolute",
        padding: `${node.padding.top}px ${node.padding.left}px ${node.padding.bottom}px ${node.padding.right}px`,
        width: `${node.size.x}px`, height: `${node.size.y}px`,
        background: node.type == "Input" ? "blue" : "pink",
    };
    const pin_style: React.CSSProperties = {
        position: "absolute",
        left: `${node.pin.pos.x}px`, top: `${node.pin.pos.y}px`,
        width: `${PIN_radius}px`, height: `${PIN_radius}px`,
        background: "red",
    };

    return  <div style={container_style} >
        <div className="pin-elem"   style={pin_style} 
                                    onMouseDown={() => node.onSelect()}
                                    onMouseUp={() => node.onDrop()}
        ></div>
        <div className="rect-elem" style={node_style} onMouseDown={() => node.onMouseDown()}></div>
    </div>
}

type NodeType = "None" | "Input" | "Output";
type PinMouseAction = "Drop" | "Select";


const MAX_WIDTH = 300;
const FONT_SIZE = 16;
const LETTER_HEIGHT = FONT_SIZE - 2;




class Pin {
    pos: Vector2;
    hover: boolean;
    uuid: string;
    render_wire_offset: Vector2 = new Vector2(0, 0)
    constructor() {
        this.pos = new Vector2(0, 0);
        this.uuid = crypto.randomUUID();
        this.hover = false;
    }
}

class EdgeInsets {
    left: number = 0;
    right: number = 0;
    top: number = 0;
    bottom: number = 0;

    constructor(left: number, right: number, top: number, bottom: number) {
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
    }
}

class Node {
    orig_size: Vector2;

    pin: Pin = new Pin();
    draging: boolean = false;
    hovering: boolean = false;
    type: NodeType = "None";

    text: string = " ";
    orig_text: string = "";
    splited_text: Array<string> = new Array();

    pos: Vector2 = proxy(new Vector2(0, 0));
    size: Vector2;
    padding: EdgeInsets = proxy(new EdgeInsets(16, 16, 16, 16));
    papddingProx: EdgeInsets;


    constructor(x: number, y: number, w: number, h: number) {
        this.pos.x = x;
        this.pos.y = y;
        this.size = proxy(new Vector2(w, h));
        this.pin.pos = new Vector2(this.pos.x + (this.size.w - PIN_radius) / 2, this.pos.y + this.size.h);
        this.orig_size = new Vector2(w, h);


        // on padding change
        const self = this;
        this.papddingProx = mkProxy(this.padding, {
            onSet: () => {
                self.recalculateSizeAndText();

            }
        });
        self.recalculateSizeAndText();


    }


    AABB(x: number, y: number, w: number, h: number) {
        return this.pos.x + this.size.w > x && this.pos.y + this.size.h > y && x + w > this.pos.x && y + h > this.pos.y;
    }

    collidePoint(p: Vector2) {
        return this.AABB(p.x, p.y, 1, 1);
    }

    onSelect() {
        engine.onPinSelected({ val: this }, "Select");
    }
    onDrop() {
        engine.onPinSelected({ val: this }, "Drop");
    }


    onMouseMove() {

    }

    onMouseUp() {
        // if (this.pin.hover) engine.onPinSelected({ val: this.pin }, "Drop");

    }
    onMouseDown() {
        mouse.offset = new Vector2(mouse.pos.x, mouse.pos.y).sub(camera.toWorldSpace(this.pos))
        this.draging = true;
        engine.node = this;

        console.log(engine.node)
        // if (this.collidePoint(camera.toScreenSpace(new Vector2(mouse.pos.x, mouse.pos.y)))) {
        //     let THIS = this;
        //     engine.outlineRect = {
        //         posPointer: { val: THIS.pos },
        //         sizePointer: { val: THIS.size },
        //     };
        // }
    }

    recalculateSizeAndText() {
        this.text = this.orig_text;

        this.size.x = 20 + 50;
        let chars: Map<string, number> = new Map();
        let all_width = 0;
        let str = "";

        let max_width = 0;

        this.splited_text = [];
        for (let char of this.text) {
            let width = 0;
            if (![...chars.keys()].includes(char)) {
                chars.set(char, 20);
            }
            width = chars.get(char)!;

            if (char == "\n") {
                if (all_width > max_width) {
                    max_width = all_width;
                }
                all_width = 0;
                this.splited_text.push(str);
                str = "";
            } else {
                if (all_width + width + 8 < MAX_WIDTH) {
                    str += char;
                    all_width += width;
                } else {
                    this.splited_text.push(str);
                    str = char;

                    if (all_width > max_width) {
                        max_width = all_width;
                    }
                    all_width = width;

                }
            }

        }
        if (str.length) {
            this.splited_text.push(str);
            str = ""
        }

        if (all_width > max_width) {
            max_width = all_width;
        }



        this.size.x = Math.min(this.orig_size.x + this.padding.right + this.padding.left, MAX_WIDTH) + max_width;
        this.size.y = LETTER_HEIGHT + (this.splited_text.length - 1) * 20 + this.padding.bottom + this.padding.top;
    }

    update() {
        let pinPos = camera.toWorldSpace(new Vector2(this.pin.pos.x, this.pin.pos.y));
        this.pin.hover = !(engine.node?.draging ?? true) && rectCollidePoint(mouse.pos.x, mouse.pos.y, pinPos.x, pinPos.y, PIN_radius, PIN_radius);
        this.hovering = this.collidePoint(camera.toScreenSpace(new Vector2(mouse.pos.x, mouse.pos.y)));

        if (this.orig_text !== this.text) {
            this.recalculateSizeAndText();
        }
    }

    draw() {

        renderer.drawRect(this.pos.x, this.pos.y, this.size.w, this.size.h, "#606060", { radius: 4 });
        for (let i = 0; i < this.splited_text.length; i++) {
            renderer.drawText(
                this.splited_text[i],
                16,
                this.pos.x + Math.min(this.padding.left, Math.max(0, this.size.x - renderer.textWidth(this.splited_text[0], FONT_SIZE) - this.padding.right)),
                this.pos.y + i * 20 + LETTER_HEIGHT + this.padding.top,
                "white",
            );
        }

        renderer.drawRect(this.pin.pos.x, this.pin.pos.y, PIN_radius, PIN_radius, "red",);
        if (this.pin.hover) renderer.drawRect(this.pin.pos.x, this.pin.pos.y, PIN_radius, PIN_radius, "green");

    }


    renderElem(): JSX.Element {
        return <NodeElem key={this.pin.uuid} node={this} />
    }
}

class INode extends Node {
    constructor(x: number, y: number, w: number, h: number) {
        super(x, y, w, h);

        this.type = "Input";
        this.pin.pos = new Vector2((this.size.w - PIN_radius) / 2,this.size.h);
        this.pin.render_wire_offset.y = -PIN_radius;
        // this.update();
    }
    update() {
        super.update();

    }
}
class ONode extends Node {
    constructor(x: number, y: number, w: number, h: number) {
        super(x, y, w, h);
        this.type = "Output";
        this.pin.pos = new Vector2((this.size.w - PIN_radius) / 2,-PIN_radius/2);
        // this.update();
    }
    update() {
        super.update();
    }
}



export { Node, INode, ONode, Pin, PIN_radius };
export type { PinMouseAction };
