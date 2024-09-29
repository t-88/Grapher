import "./Wire.css";
import { Node } from "../node";
import { proxy } from "valtio";
import type { PinDir } from "../pin";
import type { Pointer } from "../../libs/math";
import { engine } from "../../core/engine";
import BezierPathRenderer from "./BezierPathRenderer";
import OrthognalPathRenderer from "./OrthognalPathRenderer";



type ArrowDir = "Left" | "Right" | "Both" | "None";
type CurveType = "Bezier" | "Orthognal" | "Line";
class Wire {
    // proxies
    arrowDir: Pointer<ArrowDir>;
    curvature: Pointer<number>;
    curveType: Pointer<CurveType>;
    


    // inited
    uuid: string;
    hoverd: boolean = false;
    node1Ptr!: Pointer<Node>;
    node2Ptr!: Pointer<Node>;

    startDir: PinDir = "Bottom";
    endDir: PinDir = "Bottom";

    




    constructor() {
        this.uuid = crypto.randomUUID();
        this.arrowDir = proxy({ val: "Left" });
        this.curvature = proxy({ val: 25 });
        this.curveType = proxy({ val: "Orthognal" });
    }


    onWireSelected() {
        engine.onSelectWire(this);
    }

    renderElem(): JSX.Element {
        switch (this.curveType.val) {
            case "Line":
                return <BezierPathRenderer wire={this} node1={this.node1Ptr.val} node2={this.node2Ptr.val} onMouseDown={() => this.onWireSelected()} />
            break;
            case "Orthognal":
                return <OrthognalPathRenderer wire={this} node1={this.node1Ptr.val} node2={this.node2Ptr.val} onMouseDown={() => this.onWireSelected()} />
            break;
            default:
                return <BezierPathRenderer  wire={this} node1={this.node1Ptr.val} node2={this.node2Ptr.val} onMouseDown={() => this.onWireSelected()} />
            break;
        }
    }
}




export type { ArrowDir , CurveType };
export default Wire;