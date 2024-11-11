import "./Wire.css";
import { Node } from "../node";
import { proxy } from "valtio";
import type { PinDir } from "../pin";
import type { Pointer } from "../../libs/math";
import { engine } from "../../core/engine";
import BezierPathRenderer from "./BezierPathRenderer";
import OrthognalPathRenderer from "./OrthognalPathRenderer";
import LinePathRenderer from "./LinePathRenderer";



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
        this.curveType = proxy({ val: "Bezier" });
    }

    jsonDump() {
        return JSON.parse(JSON.stringify({
            uuid: this.uuid, 
            arrowDir: this.arrowDir.val, 
            curvature: this.curvature.val, 
            curveType: this.curveType.val, 
            srcUUID: this.node1Ptr.val.uuid, 
            targetUUID: this.node2Ptr.val.uuid,
            srcDir: this.startDir,
            targetDir: this.endDir,
        }));
    }

    static jsonLoad(data : {[key : string] : any},nodesMap : {[key : string] : Pointer<Node>})  : Wire {
        let out = new Wire();
        
        out.uuid = data["uuid"];
        out.arrowDir.val = data["arrowDir"];
        out.curvature.val = data["curvature"];
        out.curveType.val = data["curveType"];

        out.node1Ptr = nodesMap[data["srcUUID"]];
        out.node2Ptr = nodesMap[data["targetUUID"]];
        out.startDir = data["srcDir"];
        out.endDir = data["targetDir"];
        return out;
    }

    onWireSelected() {
        engine.onSelectWire(this);
    }

    renderElem(): JSX.Element {
        switch (this.curveType.val) {
            case "Line":
                return <LinePathRenderer wire={this} node1={this.node1Ptr.val} node2={this.node2Ptr.val} onMouseDown={() => this.onWireSelected()} />
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