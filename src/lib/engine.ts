import camera from "./camera";
import { Vector2, type Pointer } from "./math";
import { INode, ONode, Node, type PinMouseAction, Pin, PIN_radius } from "./node";
import renderer from "./render";
import p5Types from "p5";
import Wire from "./wire";
import mouse from "./mouse";





interface CurrWire {
    wire: Wire;
    endPos: Vector2;
    startPos: Vector2;
    drag: boolean;
    connectedToEnd: boolean;
}

interface RectPointer {
    posPointer: Pointer<Vector2>,
    sizePointer: Pointer<Vector2>,
}


const CANVAS_VECTOR = new Vector2(1100,800);


class Engine {
    static #instance: Engine;

    ctx: CanvasRenderingContext2D | undefined = undefined;
    node!: Node;
    nodes: Array<Node> = new Array();
    wires: Map<Array<string>, Wire> = new Map();
    p5?: p5Types;


    curWire: CurrWire | null = null;
    nodePtr? : Pointer<Node>;
    setSelectedNode? : Function;

    // wire selected to be deleted
    selectedWire: Wire | null = null;

    // rect outline
    outlineRect: RectPointer | null = null;

    constructor() { }

    setup(p5: p5Types, canvasParentRef: Element) {
        this.p5 = p5;
        this.p5.createCanvas(CANVAS_VECTOR.w, CANVAS_VECTOR.h).parent(canvasParentRef);
        renderer.setP5(p5);
        camera.setP5(p5)

        this.nodes = new Array();
        this.nodes.push(new INode(200, 200, 0, 0));
        this.nodes.push(new ONode(200, 400, 0, 0));
        this.node = this.nodes[0];
        this.nodePtr = {
            val: this.nodes[0] 
        };
        this.curWire = null;
    
        
    }

    public static get instance(): Engine {
        if (!Engine.#instance) {
            Engine.#instance = new Engine();
        }
        return Engine.#instance;
    }


    addINode() {
        this.nodes.push(new INode(this.p5!.width / 2, this.p5!.height / 2, 0, 0));
    }
    addONode() {
        this.nodes.push(new ONode(this.p5!.width / 2, this.p5!.height / 2, 0, 0));
    }


    onMouseMove() {
        if (!this.p5) return;


        this.update();

        for (let node of this.nodes) {
            node.onMouseMove();
        }
    }
    onMouseDrag() {
        if (!this.p5) return;

        if (this.node.draging) {
            let pos: Vector2 = camera.toScreenSpace(mouse.pos.sub(mouse.offset));
            this.node.pos.x = Math.ceil(pos.x / 20) * 20;
            this.node.pos.y = Math.ceil(pos.y / 20) * 20;
        }
    }
    onMouseUp() {
        if (!this.p5) return;

        mouse.offset.x = 0;
        mouse.offset.y = 0;
        mouse.draging = false;
        this.node.draging = false;

        for (let node of this.nodes) {
            node.onMouseUp();
        }

        this.curWire = null;
    }
    onMouseDown() {
        if (!this.p5) return;

        mouse.draging = true;

        this.selectedWire = null;
        this.outlineRect = null;

        for (let wire of this.wires.values()) {
            wire.onMouseDown();
        }
        for (let node of this.nodes) {
            node.onMouseDown();
        }

        for (let node of this.nodes) {
            if (node.collidePoint(camera.toScreenSpace(mouse.pos))) {
                this.node = node;
                if(this.setSelectedNode) {
                    this.setSelectedNode({val : this.node});
                }
                if (this.node.pin.hover) {
                    this.node.draging = false;
                } else {
                    this.node.draging = true;
                }
                mouse.offset = new Vector2(this.p5.mouseX, this.p5.mouseY).sub(camera.toWorldSpace(this.node.pos))
                break;
            }
        }
    }
    onKeyDown() {
        if (!this.p5) return


        // if (this.p5.keyIsDown(this.p5.LEFT_ARROW)) {
        //     camera.setOffsetX(camera.offset.x + 10);

        // } else if (this.p5.keyIsDown(this.p5.RIGHT_ARROW)) {
        //     camera.setOffsetX(camera.offset.x - 10);
        // }
        // if (this.p5.keyIsDown(this.p5.UP_ARROW)) {
        //     camera.setOffsetY(camera.offset.y - 10);
        // } else if (this.p5.keyIsDown(this.p5.DOWN_ARROW)) {
        //     camera.setOffsetY(camera.offset.y + 10);
        // }

        if (this.p5.keyIsDown(109)) {
            camera.setZoom(camera.zoom - 0.1);
        } else if (this.p5.keyIsDown(107)) {
            camera.setZoom(camera.zoom + 0.1);
        }

        if (this.p5.keyIsDown(8)) {
            if (this.selectedWire) {
                for (let uuids of this.wires.keys()) {
                    if (uuids.includes(this.selectedWire.startPin.val.uuid) && uuids.includes(this.selectedWire.endPin.val.uuid)) {
                        this.wires.delete(uuids);
                        break;
                    }
                }
                this.selectedWire = null;
            }
        }
    }
    onPinSelected(pinPosPointer: Pointer<Pin>, action: PinMouseAction) {
        if (action == "Select") {
            this.curWire = { connectedToEnd: false, drag: true, wire: new Wire(), startPos: pinPosPointer.val.pos, endPos: new Vector2(0, 0) };
            this.curWire.wire.startPin = pinPosPointer;
        }

        if (action == "Drop") {
            if (this.curWire == null || pinPosPointer.val.uuid == this.curWire.wire.startPin.val.uuid) return;

            this.curWire.connectedToEnd = true;
            this.curWire.wire.endPin = pinPosPointer;
            this.curWire.endPos = pinPosPointer.val.pos;


            let cur_wire = new Wire();
            cur_wire.endPin = this.curWire.wire.endPin;
            cur_wire.startPin = this.curWire.wire.startPin;

            let cur_uuids: Array<string> = new Array();
            cur_uuids.push(this.curWire.wire.startPin.val.uuid);
            cur_uuids.push(this.curWire.wire.endPin.val.uuid);


            let found = false;
            for (let uuids of this.wires.keys()) {
                if (uuids.includes(cur_uuids[0]) && uuids.includes(cur_uuids[1])) {
                    this.wires.set(uuids, cur_wire);
                    found = true;
                    break;
                }
            }
            if (!found) {
                this.wires.set(cur_uuids, cur_wire);
            }

            this.curWire.startPos = new Vector2(0, 0);
            this.curWire.endPos = new Vector2(0, 0);
        }

    }
    update() {
        if (!this.p5) return

        mouse.pos.x = this.p5.mouseX;
        mouse.pos.y = this.p5.mouseY;

        if (this.curWire != null && this.curWire.drag) {
            this.curWire.endPos = camera.toScreenSpace(new Vector2(mouse.pos.x, mouse.pos.y));
        }

        for (let node of this.nodes) {
            node.update();
        }


        for (let wire of this.wires.values()) {
            wire.update();
        }

    }
    draw() {
        this.update()

        renderer.clearScreen("#FFFFFF");
        for (let y = 0; y < 50 / camera.zoom; y += 1) {
            for (let x = 0; x < 60 / camera.zoom; x += 1) {
                renderer.drawCircle(x * 20 * camera.zoom + camera.offset.x, y * 20 * camera.zoom + camera.offset.y, camera.zoom, "#000000F0");
            }
        }



        camera.begin();

        for (let wire of this.wires.values()) {
            wire.draw();
        }
        if(this.selectedWire) {
            renderer.drawVector(this.selectedWire.startPin.val.pos.x+ PIN_radius/2, 
                this.selectedWire.startPin.val.pos.y+ PIN_radius/2, 
                this.selectedWire.endPin.val.pos.x + PIN_radius/2, 
                this.selectedWire.endPin.val.pos.y - this.selectedWire.endPin.val.render_wire_offset.y,
                "green",
                {stoke: 2}
            );            
        }

        if(this.curWire) {
            renderer.drawVector(this.curWire.wire.startPin.val.pos.x+ PIN_radius/2, 
                                this.curWire.wire.startPin.val.pos.y+ PIN_radius/2, 
                                this.curWire.endPos.x, 
                                this.curWire.endPos.y,
                                "yellow",
                                {stoke: 2}
                            );

            // renderer.drawVector(this.curWire.startPos.x + PIN_radius/2, this.curWire.startPos.y+ PIN_radius/2, this.curWire.endPos.x, this.curWire.endPos.y, "yellow",{stoke: 2})
        }


        for (let node of this.nodes) {
            node.draw();
        }

        if (this.outlineRect) {
            renderer.drawRectOutline(this.outlineRect.posPointer.val.x - 1, this.outlineRect.posPointer.val.y - 1, this.outlineRect.sizePointer.val.w + 2, this.outlineRect.sizePointer.val.h + 2, "green",{radius: 8})
        }


        camera.end();
    }

}


let engine: Engine;
function init_engine() {
    engine = Engine.instance;
}

export { Engine, engine, init_engine };