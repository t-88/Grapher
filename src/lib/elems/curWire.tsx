import { proxy, useSnapshot } from "valtio";
import { Vector2, type Pointer } from "../libs/math";
import { bazierCurve } from "../libs/utils";
import type { Node } from "./node";

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

class CurrWire {
    // proxy
    render: { val: boolean };
    endPos: Vector2; // it moves with mouse


    // inited
    node1: Pointer<Node | null>  = {val : null};
    node2: Pointer<Node | null>  = {val : null};
    startPos: Vector2 = new Vector2(0,0);
    connectedToEnd: boolean = false;
    revDir: boolean = false; 

    constructor() {
        this.render = proxy({val : false});
        this.endPos = proxy(new Vector2(0,0));
    }   

    renderElem(): JSX.Element {
        return <TmpLine curWire={this} />
    }
}


export default CurrWire;