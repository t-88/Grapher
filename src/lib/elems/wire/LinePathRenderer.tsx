import { useSnapshot } from "valtio";
import { engine } from "../../core/engine";
import {  Vector2 } from "../../libs/math";
import type EdgeInsets from "../../types/EdgeInsets";
import type { Node } from "../node";
import type Wire from "./Wire";




let MARGIN: EdgeInsets = { top: 20, bottom: 20, left: 20, right: 20 };
const PIN_SIZE = 10;
const headLen = 14;




export default function LinePathRenderer({ wire, node1, node2, onMouseDown }: { wire: Wire, node1: Node, node2: Node, onMouseDown: () => void }) {
    useSnapshot(engine.selectedWire);
    let startPos = Vector2.copy(node1.pinsPoses[wire.startDir]);
    let endPos = Vector2.copy(node2.pinsPoses[wire.endDir]);
    startPos.x += PIN_SIZE/2;
    startPos.y += PIN_SIZE/2;
    endPos.x += PIN_SIZE/2;
    endPos.y += PIN_SIZE/2;


   

    return <g className={engine.selectedWire.val?.uuid == wire.uuid ? "wire-selected" : ""}>
        <line  x1={startPos.x} y1={startPos.y} x2={endPos.x} y2={endPos.y} stroke="transparent" className="hidden-path" strokeWidth={10}  onMouseDown={onMouseDown} />
        <line  x1={startPos.x} y1={startPos.y} x2={endPos.x} y2={endPos.y} stroke="#999" className="curve" strokeWidth={2}  onMouseDown={onMouseDown} />
        <Arrow wire={wire}  startPos = {startPos} endPos={endPos} />
    </g>

}



function Arrow({ wire,  startPos, endPos }: { wire: Wire, startPos: Vector2, endPos: Vector2 }) {
    function leftArrow() {
        const angle = Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x);
        let v1 = new Vector2(endPos.x - headLen * Math.cos(angle - Math.PI / 6), endPos.y - headLen * Math.sin(angle - Math.PI / 6));
        let v2 = new Vector2(endPos.x - headLen * Math.cos(angle + Math.PI / 6), endPos.y - headLen * Math.sin(angle + Math.PI / 6));
        let v3 = new Vector2(endPos.x, endPos.y);
        return <polygon key="left" points={`${v1.x},${v1.y} ${v2.x},${v2.y} ${v3.x},${v3.y}`} fill="#999" stroke="transparent" strokeWidth={0} />
    }

    function rightArrow() { 
        const angle = Math.atan2(startPos.y - endPos.y, startPos.x - endPos.x);
        let v1 = new Vector2(startPos.x - headLen * Math.cos(angle - Math.PI / 6), startPos.y - headLen * Math.sin(angle - Math.PI / 6));
        let v2 = new Vector2(startPos.x - headLen * Math.cos(angle + Math.PI / 6), startPos.y - headLen * Math.sin(angle + Math.PI / 6));
        let v3 = new Vector2(startPos.x, startPos.y);
        return <polygon key="right" points={`${v1.x},${v1.y} ${v2.x},${v2.y} ${v3.x},${v3.y}`} fill="#999" stroke="transparent" strokeWidth={0} />
    }

    // arrow head logic
    const headLen = 14;
    switch (wire.arrowDir.val) {
        case "Left": {
          return leftArrow();
        }

        case "Right": {
            return rightArrow();
         
        }

        case "Both": {
            return [leftArrow(), rightArrow()]
        }
        case "None":
            return <></>
    }
}