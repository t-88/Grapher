import { proxy } from "valtio";
import { Vector2, type Pointer } from "../libs/math";
import CurrWire from "../elems/curWire";
import mouse from "./mouse";
import { Node, type NodeSelectAction } from "../elems/node";
import type { Pin, PinDir } from "../elems/pin";
import Wire from "../elems/wire/Wire";


type SelectedElem = "Node" | "Wire";

class Engine {
    static #instance: Engine;
    public static get instance(): Engine {
        if (!Engine.#instance) {
            Engine.#instance = new Engine();
        }
        return Engine.#instance;
    }


    // prxoy
    wiresElems: Array<Wire>;
    nodes: Array<Node>;
    selectedNode: Pointer<Node | null>;
    selectedWire: Pointer<Wire | null>;  // select wire to delete or config
    seletedElem : Pointer<SelectedElem | null>;

    // not inited
    elem!: HTMLDivElement;

    // inited
    curWire: CurrWire = new CurrWire();


    constructor() { 
        this.selectedNode = proxy({ val: null});
        this.selectedWire = proxy({ val: null });
        this.seletedElem = proxy({ val: null });

        this.wiresElems = proxy([]);
        this.nodes = proxy([]);
    }


    // events
    onLoad(elem: HTMLDivElement) {
        this.elem = elem;
        document.addEventListener("mousemove", (evt) => this.onMouseMove(evt));
        this.elem.addEventListener("click", (evt) => this.onMouseClick(evt));
    }
    onMouseClick(evt: MouseEvent) {
        evt.stopPropagation();
        // this.selectedNode.val = null;
    }
    onMouseMove(evt: MouseEvent) {
        evt.stopPropagation();

        const rect = this.elem.getBoundingClientRect();
        mouse.pos.set(evt.clientX - rect.left, evt.clientY - rect.top);

        if (mouse.draging) this.onMouseDrag();

        if (this.curWire.render.val) {
            this.curWire.endPos.set(mouse.pos.x, mouse.pos.y);
        }
    }
    onMouseDrag() {
        if (this.selectedNode.val?.draging) {
            let pos: Vector2 = mouse.pos.sub(mouse.offset);
            this.selectedNode.val.pos.set(pos.x, pos.y);
        }
    }
    onMouseUp(evt: MouseEvent) {
        evt.stopPropagation();
        if (this.selectedNode.val) { this.selectedNode.val.draging = false; }

        // mouse.offset.set(0,0);
        mouse.draging = false;

        this.curWire.render.val = false;


    }
    onMouseDown(evt: MouseEvent) {
        evt.stopPropagation();
        mouse.draging = true;
    }

    onNodeSelected(nodePtr: Pointer<Node>, action: NodeSelectAction, pinDir: PinDir) {
        switch (action) {
            case "Select":
                this.curWire.render.val = true;
                this.curWire.node1 = nodePtr;
                

                this.curWire.startDir = pinDir;
                this.curWire.startPos.set(mouse.pos.x, mouse.pos.y);
                this.curWire.endPos.set(this.curWire.startPos.x, this.curWire.startPos.y);

                let oppositePinMap: Map<PinDir, PinDir> = new Map();
                oppositePinMap.set("Left", "Right");
                oppositePinMap.set("Right", "Left");
                oppositePinMap.set("Top", "Bottom");
                oppositePinMap.set("Bottom", "Top");
                this.curWire.endDir = oppositePinMap.get(pinDir)!;
                break;
            case "Drop":
                if (this.curWire.render.val) {
                    this.curWire.endDir = pinDir;
                    this.curWire.node2 = nodePtr;
                    this.curWire.render.val = false;

                    if(this.curWire.node1.val!.uuid == this.curWire.node2.val!.uuid) {
                        return;
                    }


                    let wire: Wire = new Wire();
                    wire.node1Ptr = { val: this.curWire.node1.val! };
                    wire.node2Ptr = { val: this.curWire.node2.val! };
                wire.startDir = this.curWire.startDir;
                    wire.endDir = this.curWire.endDir;
                    this.wiresElems.push(wire);
                }
                break;
        }
    }

    addNode() {
        this.nodes.push(new Node(500, 500, 100, 100));
    }



    onSelectNode(node: Node) {
        this.selectedNode.val = node;
        this.seletedElem.val = "Node";
        this.selectedWire.val = null;

    }
    onSelectWire(wire: Wire) {
        this.selectedWire.val = wire;
        this.seletedElem.val = "Wire";
        this.selectedNode.val = null;

    }    




    saveToJson() {
        let nodes_json : {[key : string] : any}= {};
        for(let node of this.nodes) {
            nodes_json[node.uuid] = node.jsonDump();
        }
        let wires_json = [];
        for(let wire of this.wiresElems) {
            wires_json.push(wire.jsonDump());
        }

        let out = {
            nodes : nodes_json,
            wires : wires_json,
        };

        localStorage.setItem("lastGraph",JSON.stringify(out));
        return out;
    }

    loadFromJson(data : {[key : string] : any}) {
        let nodesMap : {[key : string] : Pointer<Node>} = {};

        this.nodes.length = 0;
        for(let nodeUUID of Object.keys(data["nodes"]!)) {
            const nodeData = data["nodes"][nodeUUID];
            const node = Node.jsonLoad(nodeData);
            nodesMap[nodeUUID] = { val : node };
            this.nodes.push(node);
        }

        this.wiresElems.length = 0;
        for(let wire of data["wires"]!) {
            this.wiresElems.push(Wire.jsonLoad(wire,nodesMap));
        }

    }
}





let engine: Engine;
function init_engine() {
    engine = Engine.instance;
}

export { Engine, engine, init_engine };

