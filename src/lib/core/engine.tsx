import { proxy } from "valtio";
import { Vector2, type Pointer } from "../libs/math";
import CurrWire from "../elems/curWire";
import Wire from "../elems/wire";
import mouse from "./mouse";
import type { Node, NodeSelectAction } from "../elems/node";
import type { Pin } from "../elems/pin";


class Engine {
    static #instance: Engine;
    public static get instance(): Engine {
        if (!Engine.#instance) {
            Engine.#instance = new Engine();
        }
        return Engine.#instance;
    }

    
    // prxoy
    selectedNode: Pointer<Node | null>;
    wiresElems: Array<Wire>;

    // not inited
    elem!: HTMLDivElement;

    // inited
    nodes: Array<Node> = new Array();
    curWire: CurrWire = new CurrWire();
    selectedWire: Pointer<Wire | null>  = {val  : null}; // select wire to delete or config


    constructor() {
        this.selectedNode  = proxy({val : null});
        this.wiresElems  = proxy([]);
    }

    onLoad(elem: HTMLDivElement) {
        this.elem = elem;
        document.addEventListener("mousemove",(evt) => this.onMouseMove(evt));
    }

    onMouseMove(evt: MouseEvent) {
        evt.stopPropagation();

        const rect = this.elem.getBoundingClientRect();
        mouse.pos.set(evt.clientX - rect.left,evt.clientY - rect.top);

        if (mouse.draging) this.onMouseDrag();
    }
    onMouseDrag() {
        if (this.selectedNode.val?.draging) {
            let pos: Vector2 = mouse.pos.sub(mouse.offset);
            this.selectedNode.val.pos.set(pos.x,pos.y);
        }
    }
    onMouseUp() {
        if (this.selectedNode.val) { this.selectedNode.val.draging = false; }

        mouse.offset.set(0,0);
        mouse.draging = false;

        this.curWire.render.val = false;
    }
    onMouseDown() {
        mouse.draging = true;
        this.selectedWire.val = null;
    }

    onNodeSelected(nodePtr: Pointer<Node>,action : NodeSelectAction, pin : Pin) {
        switch (action) {
            case "Select":
                this.curWire.render.val = true;
                this.curWire.node1 = nodePtr;

                this.curWire.startPos.set(nodePtr.val.pos.x,mouse.pos.y);
                this.curWire.endPos.set(this.curWire.startPos.x,this.curWire.startPos.y);
            break;
            case "Drop":
                if (this.curWire.render.val) {
                    this.curWire.node2 = nodePtr;
                    this.curWire.render.val = false;

                    let wire: Wire = new Wire();
                    wire.node1Ptr.val = this.curWire.node1.val!;
                    wire.node2Ptr.val = this.curWire.node2.val!;
                    this.wiresElems.push(wire);
                }
            break;
        }
    }
}





let engine: Engine;
function init_engine() {
    engine = Engine.instance;
}

export { Engine, engine, init_engine };