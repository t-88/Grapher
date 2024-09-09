import { useSnapshot } from "valtio";
import camera from "./camera";
import { engine } from "./engine";
import { Vector2, type Pointer } from "./math";
import mouse from "./mouse";
import { Node, Pin, PIN_radius } from "./node";
import renderer from "./render";
import { bazierCurve } from "./utils";




function Line({ node1, node2 }: { node1: Node, node2: Node }) {
    // changes bc position of node changes and the array proxy detecting it
    let startPos = new Vector2(node1.pos.x + node1.pin.pos.x + PIN_radius / 2, node1.pos.y + node1.pin.pos.y + PIN_radius / 2);
    let endPos = new Vector2(node2.pos.x + node2.pin.pos.x + PIN_radius / 2, node2.pos.y + node2.pin.pos.y + PIN_radius / 2);
    let path = bazierCurve(startPos,endPos,0.25);
    if(node1.type == "Input") {
        path = bazierCurve(endPos,startPos,0.25);
    }


    return <path d={path}
        stroke="white"
        fill="transparent"
        strokeWidth={2}
    />
}

class Wire {
    uuid: string;
    startPin: Pointer<Pin>;
    endPin: Pointer<Pin>;
    hoverd: boolean = false;

    node1Ptr!: Pointer<Node>;
    node2Ptr!: Pointer<Node>;
    constructor() {
        this.startPin = { val: new Pin() };
        this.endPin = { val: new Pin() };
        this.uuid = crypto.randomUUID();
    }

    onMouseDown() {
        if (this.hoverd) engine.selectedWire = this;
    }

    update() {
        if (mouse.draging) return;
        let len1 = mouse.pos.sub(camera.toWorldSpace(this.startPin.val.pos)).length();
        let len2 = mouse.pos.sub(camera.toWorldSpace(this.endPin.val.pos)).length();
        let len = camera.toWorldSpace(this.startPin.val.pos.sub(this.endPin.val.pos)).length();
        if (Math.abs(len - (len1 + len2)) < 1) {
            this.hoverd = true;
        } else {
            this.hoverd = false;
        }
    }

    draw() {
        if (this.hoverd) {
            renderer.drawVector(this.startPin.val.pos.x + PIN_radius / 2, this.startPin.val.pos.y + PIN_radius / 2, this.endPin.val.pos.x + PIN_radius / 2, this.endPin.val.pos.y - this.endPin.val.render_wire_offset.y, "blue", { stoke: 2 });
        } else {
            renderer.drawVector(this.startPin.val.pos.x + PIN_radius / 2, this.startPin.val.pos.y + PIN_radius / 2, this.endPin.val.pos.x + PIN_radius / 2, this.endPin.val.pos.y - this.endPin.val.render_wire_offset.y, "yellow", { stoke: 2 });
        }
    }


    renderElem(): JSX.Element {
        console.log("UR MOM");
        return <Line node1={this.node1Ptr.val} node2={this.node2Ptr.val} />
    }
}


export default Wire;