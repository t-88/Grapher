import { useSnapshot } from "valtio";
import { Canvas_Size } from "../../core/consts";
import { engine } from "../../core/engine";
import { rectCollidePoint, Vector2, type BLine } from "../../libs/math";
import type EdgeInsets from "../../types/EdgeInsets";
import type { Node } from "../node";
import type Wire from "./Wire";
import type { PinDir } from "../pin";
import { OrthogonalConnector } from "./ortho-connector";



class Vertex {
    uuid: string = crypto.randomUUID();
    pos: Vector2;
    left?: Vertex | null;
    right?: Vertex | null;
    top?: Vertex | null;
    bottom?: Vertex | null;

    constructor(pos?: Vector2) {
        this.pos = pos ?? Vector2.new(0, 0);
    }

    static new(pos: Vector2) {
        return new Vertex(pos);
    }
}
interface Line {
    start: Vertex;
    end: Vertex;
};

let MARGIN: EdgeInsets = { top: 20, bottom: 20, left: 20, right: 20 };
const PIN_SIZE = 10;
const headLen = 14;




export default function OrthognalPathRenderer({ wire, node1, node2, onMouseDown }: { wire: Wire, node1: Node, node2: Node, onMouseDown: () => void }) {
    useSnapshot(engine.selectedWire);

    const shapeA = { left: wire.node1Ptr.val.pos.x, top: wire.node1Ptr.val.pos.y, width: wire.node1Ptr.val.size.x, height: wire.node1Ptr.val.size.h };
    const shapeB = { left: wire.node2Ptr.val.pos.x, top: wire.node2Ptr.val.pos.y, width: wire.node2Ptr.val.size.x, height: wire.node2Ptr.val.size.h };
    const path = OrthogonalConnector.route({
        pointA: { shape: shapeA, side: wire.startDir, distance: 0.5 },
        pointB: { shape: shapeB, side: wire.endDir, distance: 0.5 },
        shapeMargin: 10,
        globalBoundsMargin: 10,
        globalBounds: { left: 0, top: 0, width: 5000, height: 5000 },
    });

    return <g className={engine.selectedWire.val?.uuid == wire.uuid ? "wire-selected" : ""}>
        {
            (() => {
                let elems = [];
                for (let i = 0; i < path.length - 1; i++) {
                    elems.push(<line key={i} x1={path[i].x} y1={path[i].y} x2={path[i + 1].x} y2={path[i + 1].y} stroke="transparent" className="hidden-path" strokeWidth={10}  onMouseDown={onMouseDown} />)
                }
                return elems;
            })()
        }       

        {
            (() => {
                let elems = [];
                for (let i = 0; i < path.length - 1; i++) {
                    elems.push(<line className="curve" key={i} x1={path[i].x} y1={path[i].y} x2={path[i + 1].x} y2={path[i + 1].y} stroke="#999" strokeWidth={2} />)
                }
                return elems;
            })()
        }
        <Arrow wire={wire}  path={path as Vector2[]}/>

    </g>

}



function Arrow({ wire, path, }: { wire: Wire,path : Vector2[] }) {


    // arrow head logic
    const headLen1 = 8;
    const headLen2 = 8;

    const endVect = Vector2.new(path[path.length - 1].x, path[path.length - 1].y);
    const startVec = Vector2.new(path[0].x, path[0].y);
    const isEndHorz = path[path.length - 1].y ==  path[path.length - 2].y;
    const isStartHorz = path[0].y ==  path[1].y;

    function leftArrow() {
        let v1 = Vector2.new(0,0);
        let v2 = Vector2.new(0,0);
        let v3 = Vector2.new(0,0);            
        if(!isEndHorz) {
            let dir = (path[path.length - 1].y >  path[path.length - 2].y) ? -1 : 1;
            v1.set(endVect.x - headLen1, endVect.y + dir *  headLen1);
            v2.set(endVect.x + headLen1, endVect.y + dir *  headLen1);
            v3.set(endVect.x, endVect.y);
        } else {
            let dir = (path[path.length - 1].x >  path[path.length - 2].x) ? -1 : 1;
            v1.set(endVect.x + dir * headLen1, endVect.y - headLen1);
            v2.set(endVect.x + dir * headLen1, endVect.y + headLen1);
            v3.set(endVect.x, endVect.y);
        }
        return <polygon points={`${v1.x},${v1.y} ${v2.x},${v2.y} ${v3.x},${v3.y}`} fill="#999" stroke="transparent" strokeWidth={0} />

    }

    function rightArrow() { 
        let v1 = Vector2.new(0,0);
        let v2 = Vector2.new(0,0);
        let v3 = Vector2.new(0,0);    
        if(!isStartHorz) {
            let dir = (path[0].y > path[1].y) ? -1 : 1;
            v1.set(startVec.x - headLen1, startVec.y + dir * headLen1);
            v2.set(startVec.x + headLen1, startVec.y + dir * headLen1);
            v3.set(startVec.x, startVec.y);
        } else {
            let dir = (path[0].x > path[1].x) ? -1 : 1;
            v1.set(startVec.x + dir * headLen1, startVec.y - headLen1);
            v2.set(startVec.x + dir * headLen1, startVec.y + headLen1);
            v3.set(startVec.x, startVec.y);
        }

        return <polygon points={`${v1.x},${v1.y} ${v2.x},${v2.y} ${v3.x},${v3.y}`} fill="#999" stroke="transparent" strokeWidth={0} />
    }

    
    switch (wire.arrowDir.val) {
        case "Left": {
            return leftArrow();
        }

        case "Right": {
          return rightArrow();
        }

        case "Both": {
          return [leftArrow(),rightArrow()];
        }
        case "None":
            return <></>
    }
}

// NOTE: debug drawing 

// function DebugGrid({ wire, lines, grid_edjes, srcPos, targetPos }: { wire: Wire, lines: Line[], grid_edjes: Vertex[], srcPos: Vector2, targetPos: Vector2 }) {
//     const shapeA = { left: wire.node1Ptr.val.pos.x, top: wire.node1Ptr.val.pos.y, width: wire.node1Ptr.val.size.x, height: wire.node1Ptr.val.size.h };
//     const shapeB = { left: wire.node2Ptr.val.pos.x, top: wire.node2Ptr.val.pos.y, width: wire.node2Ptr.val.size.x, height: wire.node2Ptr.val.size.h };
//     const path = OrthogonalConnector.route({
//         pointA: { shape: shapeA, side: "bottom", distance: 0.5 },
//         pointB: { shape: shapeB, side: "top", distance: 0.5 },
//         shapeMargin: 10,
//         globalBoundsMargin: 10,
//         globalBounds: { left: 0, top: 0, width: 1000, height: 1000 },
//     });


//     return <>
//         {
//             (() => {
//                 let elems = [];
//                 for (let i = 0; i < path.length - 1; i++) {
//                     elems.push(<line key={i} x1={path[i].x} y1={path[i].y} x2={path[i + 1].x} y2={path[i + 1].y} stroke="#900" strokeWidth={2} />)
//                 }
//                 return elems;
//             })()

//         }
//         </>
// }


