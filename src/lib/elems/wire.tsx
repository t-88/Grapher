import { Vector2, type Pointer } from "../libs/math";
import { Node } from "./node";
import { bazierCurve } from "../libs/utils";
import type { PinDir } from "./pin";




function Line({ wire}: { wire : Wire }) {
    let startPos = wire.node1Ptr.val.pinsPoses[wire.startDir]
    let endPos = wire.node2Ptr.val.pinsPoses[wire.endDir]
    let path = bazierCurve(startPos,endPos,0.25,wire.startDir,wire.endDir);

    return <path d={path}
        stroke="#999"
        fill="transparent"
        strokeWidth={2}
    />
}
class Wire {
    uuid: string;
    hoverd: boolean = false;
    node1Ptr!: Pointer<Node>;
    node2Ptr!: Pointer<Node>;

    startDir : PinDir = "Bottom";
    endDir : PinDir = "Bottom";



    node1PinElem!: HTMLSpanElement;
    node2PinElem!: HTMLSpanElement;
    constructor() {
        this.uuid = crypto.randomUUID();
    }

    renderElem(): JSX.Element {
        return <Line wire={this}  />
    }
}

export default Wire;