import { Vector2, type Pointer } from "../libs/math";
import { Node } from "./node";
import { bazierCurve } from "../libs/utils";




function Line({ node1, node2 }: { node1: Node, node2: Node }) {
    let startPos = new Vector2(node1.pos.x, node1.pos.y);
    let endPos = new Vector2(node2.pos.x, node2.pos.y);
    let path = bazierCurve(startPos,endPos,0.25);

    return <path d={path}
        stroke="black"
        fill="transparent"
        strokeWidth={2}
    />
}
class Wire {
    uuid: string;
    hoverd: boolean = false;
    node1Ptr!: Pointer<Node>;
    node2Ptr!: Pointer<Node>;
    constructor() {
        this.uuid = crypto.randomUUID();
    }

    renderElem(): JSX.Element {
        return <Line node1={this.node1Ptr.val} node2={this.node2Ptr.val} />
    }
}

export default Wire;