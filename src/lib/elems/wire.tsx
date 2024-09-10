import { Vector2, type Pointer } from "../libs/math";
import { Node } from "./node";
import { bazierCurve, bezierCubic } from "../libs/utils";
import type { PinDir } from "./pin";




function Line({ wire }: { wire: Wire }) {
    let startPos =  wire.node1Ptr.val.pinsPoses[wire.startDir];
    let endPos = wire.node2Ptr.val.pinsPoses[wire.endDir];
    startPos = new Vector2(startPos.x + 5,startPos.y);
    endPos = new Vector2(endPos.x + 5,endPos.y);

    let {path , c0 , c1} = bazierCurve(startPos, endPos, 0.4, wire.startDir, wire.endDir);


    const headLen = 16;
    const prevPoint = bezierCubic(startPos,endPos,c0,c1,0.95  );
    const angle = Math.atan2(endPos.y - prevPoint.y, endPos.x - prevPoint.x);

    let v1 = new Vector2(endPos.x - headLen * Math.cos(angle - Math.PI / 6),endPos.y - headLen * Math.sin(angle- Math.PI / 6));
    let v2 = new Vector2(endPos.x - headLen * Math.cos(angle + Math.PI / 6),endPos.y - headLen * Math.sin(angle+ Math.PI / 6));
    let v3 = new Vector2(endPos.x,endPos.y);

    return <>
        <path d={path}
            stroke="#999"
            fill="transparent"
            strokeWidth={2}
        />

        <polygon points={`${v1.x},${v1.y} ${v2.x},${v2.y} ${v3.x},${v3.y}`} fill="#999" stroke="transparent"  strokeWidth={0} />
    </>
}
class Wire {
    uuid: string;
    hoverd: boolean = false;
    node1Ptr!: Pointer<Node>;
    node2Ptr!: Pointer<Node>;

    startDir: PinDir = "Bottom";
    endDir: PinDir = "Bottom";



    node1PinElem!: HTMLSpanElement;
    node2PinElem!: HTMLSpanElement;
    constructor() {
        this.uuid = crypto.randomUUID();
    }

    renderElem(): JSX.Element {
        return <Line wire={this} />
    }
}

export default Wire;