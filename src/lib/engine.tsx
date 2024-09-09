import camera from "./camera";
import { Vector2, type Pointer } from "./math";
import { INode, ONode, Node, type PinMouseAction, Pin, PIN_radius } from "./node";
import renderer from "./render";
import p5Types from "p5";
import Wire from "./wire";
import mouse from "./mouse";
import { proxy, useSnapshot } from "valtio";
import { bazierCurve } from "./utils";


function TmpLine({ curWire }: { curWire: CurrWire }) {


    let render = useSnapshot(curWire.render);
    let endPosSnap = useSnapshot(curWire.endPos);

    let path = bazierCurve(curWire.startPos, endPosSnap, 0.25);
    if (curWire.revDir) {
        path = bazierCurve(endPosSnap, curWire.startPos, 0.25);
    }


    if (render.val) {
        return <path d={path}
            stroke="white"
            fill="transparent"
            strokeWidth={2}
        />
    }

    return <></>
}

interface CurrWire {
    render: { val: boolean };
    node1?: Pointer<Node>,
    node2?: Pointer<Node>,
    startPos: Vector2;
    endPos: Vector2;
    connectedToEnd: boolean;
    revDir: boolean, // false : output input, true: input output 
    renderElem: () => JSX.Element;

}

interface RectPointer {
    posPointer: Pointer<Vector2>,
    sizePointer: Pointer<Vector2>,
}


class Engine {
    static #instance: Engine;

    ctx: CanvasRenderingContext2D | undefined = undefined;
    node: Node | null = null;
    nodes: Array<Node> = new Array();
    // wires: Map<Array<string>, Wire> = new Map();
    p5?: p5Types;


    curWire: CurrWire;
    nodePtr?: Pointer<Node>;
    setSelectedNode?: Function;

    // wire selected to be deleted
    selectedWire: Wire | null = null;

    // rect outline
    outlineRect: RectPointer | null = null;

    wiresElems: Array<Wire> = proxy([]);
    wire: Wire | null = null;

    constructor() {
        this.curWire = {
            connectedToEnd: false,
            render: proxy({ val: false }),
            startPos: new Vector2(0, 0),
            endPos: proxy(new Vector2(0, 0)),
            revDir: false,
            renderElem: () => {
                return <TmpLine curWire={this.curWire} />
            },
        };


        this.nodes = new Array();
        this.nodes.push(new INode(200, 200, 0, 0));
        this.nodes.push(new ONode(200, 400, 0, 0));

        this.node = this.nodes[0];
        this.nodePtr = { val: this.nodes[0] };
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


    onMouseMove(evt: React.MouseEvent, elem: HTMLDivElement) {
        const rect = elem.getBoundingClientRect();
        mouse.pos.x = evt.nativeEvent.clientX - rect.left;
        mouse.pos.y = evt.nativeEvent.clientY - rect.top;
        evt.stopPropagation();

        if (mouse.draging) {
            this.onMouseDrag();
        }

        this.update();
    }
    onMouseDrag() {
        if (this.node?.draging) {
            let pos: Vector2 = mouse.pos.sub(mouse.offset);
            this.node.pos.x = Math.ceil(pos.x / 20) * 20;
            this.node.pos.y = Math.ceil(pos.y / 20) * 20;
        }
    }
    onMouseUp() {
        if (this.node) { this.node.draging = false; }
        mouse.offset.x = 0; mouse.offset.y = 0;
        mouse.draging = false;
        this.curWire.render.val = false;
        console.log(this.curWire.render);
    }
    onMouseDown() {
        mouse.draging = true;
        this.selectedWire = null;
        this.outlineRect = null;

        // for (let wire of this.wires.values()) {
        //     wire.onMouseDown();
        // }
        // for (let node of this.nodes) {
        //     node.onMouseDown();
        // }
        // for (let node of this.nodes) {
        //     if (node.collidePoint(mouse.pos)) {
        //         this.node = node;
        //         if(this.setSelectedNode) {
        //             this.setSelectedNode({val : this.node});
        //         }
        //         if (this.node.pin.hover) {
        //             this.node.draging = false;
        //         } else {
        //             this.node.draging = true;
        //         }
        //         mouse.offset = new Vector2(mouse.pos.x, mouse.pos.y).sub(camera.toWorldSpace(this.node.pos))
        //         break;
        //     }
        // }
    }
    onKeyDown() {

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

        // if (this.p5.keyIsDown(109)) {
        //     camera.setZoom(camera.zoom - 0.1);
        // } else if (this.p5.keyIsDown(107)) {
        //     camera.setZoom(camera.zoom + 0.1);
        // }

        // if (this.p5.keyIsDown(8)) {
        //     if (this.selectedWire) {
        //         for (let uuids of this.wires.keys()) {
        //             if (uuids.includes(this.selectedWire.startPin.val.uuid) && uuids.includes(this.selectedWire.endPin.val.uuid)) {
        //                 this.wires.delete(uuids);
        //                 break;
        //             }
        //         }
        //         this.selectedWire = null;
        //     }
        // }
    }
    onPinSelected(nodePtr: Pointer<Node>, action: PinMouseAction) {
        switch (action) {
            case "Select":
                this.curWire.render.val = true;
                this.curWire.node1 = nodePtr;

                this.curWire.startPos = new Vector2(nodePtr.val.pos.x + nodePtr.val.pin.pos.x + PIN_radius / 2, mouse.pos.y);
                this.curWire.endPos.x = this.curWire.startPos.x;
                this.curWire.endPos.y = this.curWire.startPos.y;

                if (nodePtr.val.type == "Input") {
                    this.curWire.revDir = true;
                }
                break;
            case "Drop":
                if (this.curWire.render.val) {
                    this.curWire.node2 = nodePtr;
                    this.curWire.render.val = false;

                    let wire: Wire = new Wire();
                    wire.node1Ptr = this.curWire.node1!;
                    wire.node2Ptr = this.curWire.node2!;
                    this.wiresElems.push(wire);
                }
                break;
        }
        // if (action == "Select") {
        // this.curWire = { connectedToEnd: false, drag: true, wire: new Wire(), startPos: pinPosPointer.val.pos, endPos: new Vector2(0, 0) };
        // this.curWire.wire.startPin = pinPosPointer;
        // }

        // if (action == "Drop") {
        // if (this.curWire == null || pinPosPointer.val.uuid == this.curWire.wire.startPin.val.uuid) return;

        // this.curWire.connectedToEnd = true;
        // this.curWire.wire.endPin = pinPosPointer;
        // this.curWire.endPos = pinPosPointer.val.pos;


        // let cur_wire = new Wire();
        // cur_wire.endPin = this.curWire.wire.endPin;
        // cur_wire.startPin = this.curWire.wire.startPin;

        // let cur_uuids: Array<string> = new Array();
        // cur_uuids.push(this.curWire.wire.startPin.val.uuid);
        // cur_uuids.push(this.curWire.wire.endPin.val.uuid);


        // let found = false;
        // for (let uuids of this.wires.keys()) {
        //     if (uuids.includes(cur_uuids[0]) && uuids.includes(cur_uuids[1])) {
        //         this.wires.set(uuids, cur_wire);
        //         found = true;
        //         break;
        //     }
        // }
        // if (!found) {
        //     this.wires.set(cur_uuids, cur_wire);
        // }

        // this.curWire.startPos = new Vector2(0, 0);
        // this.curWire.endPos = new Vector2(0, 0);
        // }

    }
    update() {
        if (this.curWire.render.val) {
            let pos = camera.toScreenSpace(new Vector2(mouse.pos.x, mouse.pos.y));
            this.curWire.endPos.x = pos.x;
            this.curWire.endPos.y = pos.y;
        }

        for (let node of this.nodes) {
            node.update();
        }

        // for (let wire of this.wires.values()) {
        // wire.update();
        // }
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

        // for (let wire of this.wires.values()) {
        // wire.draw();
        // }
        if (this.selectedWire) {
            renderer.drawVector(this.selectedWire.startPin.val.pos.x + PIN_radius / 2,
                this.selectedWire.startPin.val.pos.y + PIN_radius / 2,
                this.selectedWire.endPin.val.pos.x + PIN_radius / 2,
                this.selectedWire.endPin.val.pos.y - this.selectedWire.endPin.val.render_wire_offset.y,
                "green",
                { stoke: 2 }
            );
        }
        if (this.curWire.render.val) {
            renderer.drawVector(this.curWire.startPos.x,
                this.curWire.startPos.y,
                this.curWire.endPos.y,
                this.curWire.endPos.y,
                "yellow",
                { stoke: 2 }
            );
        }


        for (let node of this.nodes) {
            node.draw();
        }

        if (this.outlineRect) {
            renderer.drawRectOutline(this.outlineRect.posPointer.val.x - 1, this.outlineRect.posPointer.val.y - 1, this.outlineRect.sizePointer.val.w + 2, this.outlineRect.sizePointer.val.h + 2, "green", { radius: 8 })
        }


        camera.end();
    }

}


let engine: Engine;
function init_engine() {
    engine = Engine.instance;
}

export { Engine, engine, init_engine };