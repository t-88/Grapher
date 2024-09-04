import camera from "./camera";
import { Vector2, type Pointer } from "./math";
import { INode, ONode, Node, type PinMouseAction, Pin } from "./node";
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

class Engine {
    static #instance: Engine;

    ctx: CanvasRenderingContext2D | undefined = undefined;
    node!: Node;
    nodes: Array<Node> = new Array();
    wires: Map<Array<string>, Wire> = new Map();
    p5?: p5Types;


    curWire!: CurrWire;


    // wire selected to be deleted
    selectedWire: Wire | null = null;

    // rect outline
    outlineRect: RectPointer | null = null;

    constructor() { }

    setup(p5: p5Types, canvasParentRef: Element) {
        this.p5 = p5;
        this.p5.createCanvas(1200, 900).parent(canvasParentRef);
        renderer.setP5(p5);
        camera.setP5(p5)

        this.nodes = new Array();
        this.nodes.push(new INode(200, 200, 200, 60));
        this.nodes.push(new ONode(200, 400, 200, 60));
        this.node = this.nodes[0];

        this.curWire = { connectedToEnd: false, drag: false, wire: new Wire(), startPos: new Vector2(0, 0), endPos: new Vector2(0, 0) };
        this.curWire.drag = false;
        this.curWire.connectedToEnd = false;



    }

    public static get instance(): Engine {
        if (!Engine.#instance) {
            Engine.#instance = new Engine();
        }
        return Engine.#instance;
    }


    addINode() {
        this.nodes.push(new INode(this.p5!.width / 2, this.p5!.height / 2, 200, 60));
    }
    addONode() {
        this.nodes.push(new ONode(this.p5!.width / 2, this.p5!.height / 2, 200, 60));
    }


    onMouseMove() {
        if (!this.p5) return;


        if (!mouse.draging) {
            this.curWire.drag = false;
        }

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
        this.curWire.drag = false;

        if (!this.curWire.connectedToEnd) {
            this.curWire.startPos = new Vector2(0, 0);
            this.curWire.endPos = new Vector2(0, 0);
        }
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


        if (this.p5.keyIsDown(this.p5.LEFT_ARROW)) {
            camera.setOffsetX(camera.offset.x + 10);

        } else if (this.p5.keyIsDown(this.p5.RIGHT_ARROW)) {
            camera.setOffsetX(camera.offset.x - 10);
        }
        if (this.p5.keyIsDown(this.p5.UP_ARROW)) {
            camera.setOffsetY(camera.offset.y - 10);
        } else if (this.p5.keyIsDown(this.p5.DOWN_ARROW)) {
            camera.setOffsetY(camera.offset.y + 10);
        }

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
            }
            this.selectedWire = null;
        }
    }
    onPinSelected(pinPosPointer: Pointer<Pin>, action: PinMouseAction) {
        if (action == "Select") {
            this.curWire.drag = true;
            this.curWire.connectedToEnd = false;
            this.curWire.wire.startPin = pinPosPointer;
            this.curWire.startPos = pinPosPointer.val.pos;
        }

        if (action == "Drop") {
            if (pinPosPointer.val.uuid == this.curWire.wire.startPin.val.uuid) return;

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

        if (this.curWire.drag) {
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

        renderer.clearScreen("black");
        for (let y = 0; y < 50 / camera.zoom; y += 1) {
            for (let x = 0; x < 60 / camera.zoom; x += 1) {
                renderer.drawCircle(x * 20 * camera.zoom + camera.offset.x, y * 20 * camera.zoom + camera.offset.y, camera.zoom, "yellow");
            }
        }



        camera.begin();

        for (let wire of this.wires.values()) {
            wire.draw();
        }

        renderer.drawVector(this.curWire.startPos.x, this.curWire.startPos.y, this.curWire.endPos.x, this.curWire.endPos.y, "yellow")


        for (let node of this.nodes) {
            node.draw();
        }

        if (this.outlineRect) {
            renderer.drawRectOutline(this.outlineRect.posPointer.val.x - 1, this.outlineRect.posPointer.val.y - 1, this.outlineRect.sizePointer.val.w + 1, this.outlineRect.sizePointer.val.h + 1, "green")
        }
        if(this.selectedWire) {
        renderer.drawVector(this.selectedWire.startPin.val.pos.x, this.selectedWire.startPin.val.pos.y, this.selectedWire.endPin.val.pos.x, this.selectedWire.endPin.val.pos.y, "green");

        }


        camera.end();
    }

}


let engine: Engine;
function init_engine() {
    engine = Engine.instance;
}

export { Engine, engine, init_engine };