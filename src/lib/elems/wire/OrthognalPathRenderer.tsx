import { useSnapshot } from "valtio";
import { Canvas_Size } from "../../core/consts";
import { engine } from "../../core/engine";
import { rectCollidePoint, Vector2, type BLine } from "../../libs/math";
import type EdgeInsets from "../../types/EdgeInsets";
import type { Node } from "../node";
import type Wire from "./Wire";
import type { PinDir } from "../pin";



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
function Line_new(x0: number, y0: number, x1: number, y1: number): Line {
    return { start: Vertex.new(Vector2.new(x0, y0)), end: Vertex.new(Vector2.new(x1, y1)) };
}

let MARGIN: EdgeInsets = { top: 20, bottom: 20, left: 20, right: 20 };
const PIN_SIZE = 5;
const headLen = 14;



function vertexFromDir(dir: PinDir, node: Node): Vertex {
    switch (dir) {
        case "Top": return Vertex.new(new Vector2(node.pinsPoses.Top.x + PIN_SIZE, node.pos.y));
        case "Bottom": return Vertex.new(new Vector2(node.pinsPoses.Bottom.x + PIN_SIZE, node.pos.y + node.size.h));
        case "Left": return Vertex.new(new Vector2(node.pos.x, node.pinsPoses.Left.y + PIN_SIZE));
        case "Right": return Vertex.new(new Vector2(node.pos.x + node.size.w, node.pinsPoses.Right.y + PIN_SIZE));
    }
}
function offsetFromMDir(dir: PinDir): Vector2 {
    switch (dir) {
        case "Top": return Vector2.new(0, -MARGIN.top);
        case "Bottom": return Vector2.new(0, MARGIN.bottom);
        case "Left": return Vector2.new(-MARGIN.left, 0);
        case "Right": return Vector2.new(MARGIN.right, 0);
    }
}
function setVtxNeighborsFromDir(dir: PinDir, vtx: Vertex, neighnorVtx: Vertex) {
    switch (dir) {
        case "Left": vtx.left = neighnorVtx; break;
        case "Right": vtx.right = neighnorVtx; break;
        case "Top": vtx.top = neighnorVtx; break;
        case "Bottom": vtx.bottom = neighnorVtx; break;
    }
}
function overrideVtxConnectionFromDir(dir: PinDir, mainVtx: Vertex, vtx: Vertex) {
    switch (dir) {
        case "Left": if (vtx.uuid == mainVtx.left?.uuid) vtx.right = mainVtx; break;
        case "Right": if (vtx.uuid == mainVtx.right?.uuid) vtx.left = mainVtx; break;
        case "Top": if (vtx.uuid == mainVtx.top?.uuid) vtx.bottom = mainVtx; break;
        case "Bottom": if (vtx.uuid == mainVtx.bottom?.uuid) vtx.top = mainVtx; break;
    }
}
function mkGrid(nodes: Node[]): Line[] {
    let lines: Line[] = [];
    for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];

        // horizontal
        lines.push({ start: Vertex.new(new Vector2(0, node.pos.y - MARGIN.top)), end: Vertex.new(new Vector2(Canvas_Size.w, node.pos.y - MARGIN.top)) });
        lines.push({ start: Vertex.new(new Vector2(0, node.pos.y + node.size.h + MARGIN.bottom)), end: Vertex.new(new Vector2(Canvas_Size.w, node.pos.y + node.size.h + MARGIN.bottom)) });

        // vertical
        lines.push({ start: Vertex.new(new Vector2(node.pos.x - MARGIN.left, 0)), end: Vertex.new(new Vector2(node.pos.x - MARGIN.left, Canvas_Size.h)), });
        lines.push({ start: Vertex.new(new Vector2(node.pos.x + MARGIN.right + node.size.w, 0)), end: Vertex.new(new Vector2(node.pos.x + MARGIN.right + node.size.w, Canvas_Size.h)), });


        if (node.pins.Bottom || node.pins.Top) {
            let x = node.pins.Top ? node.pinsPoses.Top.x : node.pinsPoses.Bottom.x;
            lines.push({ start: Vertex.new(new Vector2(x + PIN_SIZE, 0)), end: Vertex.new(new Vector2(x + PIN_SIZE, Canvas_Size.h)) });
        }

        if (node.pins.Left || node.pins.Right) {
            let y = node.pins.Left ? node.pinsPoses.Left.y : node.pinsPoses.Right.y;
            lines.push({ start: Vertex.new(new Vector2(0, y + PIN_SIZE)), end: Vertex.new(new Vector2(Canvas_Size.w, y + PIN_SIZE)) });
        }
    }
    return lines;
}
function getEdjes(wire: Wire, srcVtx: Vertex, targetVtx: Vertex, lines: Line[]): Vertex[] {
    const srcOffset = offsetFromMDir(wire.startDir);
    const targetOffset = offsetFromMDir(wire.endDir);
    let edjes: Vertex[] = [];

    let a = false;
    let b = false;
    for (let line of lines) {
        if (line.start.pos.x == line.end.pos.x) {
            for (let pline of lines) {
                if (pline.start.pos.y == pline.end.pos.y) {
                    let edje = Vertex.new(new Vector2(line.start.pos.x, pline.start.pos.y));

                    if (edje.pos.equal(srcVtx.pos.add(srcOffset))) {
                        a = true;
                        setVtxNeighborsFromDir(wire.startDir, srcVtx, edje);
                    }
                    if (edje.pos.equal(targetVtx.pos.add(targetOffset))) {
                        setVtxNeighborsFromDir(wire.endDir, targetVtx, edje);
                        b = true;
                    }
                    edjes.push(edje);
                }
            }
        }
    }

    // sort the grid. left to right, top to bottom 
    edjes = edjes.sort((a: Vertex, b: Vertex) => a.pos.y - b.pos.y);
    let tmp_edjes: Vertex[] = [];
    for (let j = 0; j < 6; j++) {
        tmp_edjes = tmp_edjes.concat(edjes.slice(j * 6, (j + 1) * 6).sort((a: Vertex, b: Vertex) => a.pos.x - b.pos.x));
    }
    edjes = tmp_edjes;


    // add edje connections
    // edit the grid to include the target and src edjes
    for (let y = 0; y < 6; y++) {
        for (let x = 0; x < 6; x++) {
            let edje = edjes[y * 6 + x];

            if (y != 0 && srcVtx.top?.uuid != edjes[(y - 1) * 6 + (x - 0)].uuid && targetVtx.top?.uuid != edjes[(y - 1) * 6 + (x - 0)].uuid)
                edje.top = edjes[(y - 1) * 6 + (x - 0)];
            if (y != 5 && srcVtx.bottom?.uuid != edjes[(y + 1) * 6 + (x - 0)].uuid && targetVtx.bottom?.uuid != edjes[(y + 1) * 6 + (x - 0)].uuid)
                edje.bottom = edjes[(y + 1) * 6 + (x + 0)];
            if (x != 0 && srcVtx.left?.uuid != edjes[(y - 0) * 6 + (x - 1)].uuid && targetVtx.left?.uuid != edjes[(y - 0) * 6 + (x - 1)].uuid)
                edje.left = edjes[(y - 0) * 6 + (x - 1)];
            if (x != 5 && srcVtx.right?.uuid != edjes[(y - 0) * 6 + (x + 1)].uuid && targetVtx.right?.uuid != edjes[(y - 0) * 6 + (x + 1)].uuid)
                edje.right = edjes[(y - 0) * 6 + (x + 1)];

            overrideVtxConnectionFromDir(wire.startDir, srcVtx, edje);
            overrideVtxConnectionFromDir(wire.endDir, targetVtx, edje);
        }
    }

    return edjes;
}

export default function OrthognalPathRenderer({ wire, node1, node2, onMouseDown }: { wire: Wire, node1: Node, node2: Node, onMouseDown: () => void }) {
    let srcVtx: Vertex = vertexFromDir(wire.startDir, node1);
    let targetVtx: Vertex = vertexFromDir(wire.endDir, node2);

    useSnapshot(engine.selectedWire);

    // mkGrid then generate edjes from grid
    let edjes: Vertex[] = getEdjes(wire, srcVtx, targetVtx, mkGrid([node1, node2]));
    // generate the path and arcs
    // let [path, arcs] = dijkstra_alg(wire, srcVtx, targetVtx, [srcVtx, targetVtx, ...edjes]);

    return <g className={engine.selectedWire.val?.uuid == wire.uuid ? "wire-selected" : ""}>
        <DebugGrid wire={wire} lines={mkGrid([node1, node2])} grid_edjes={getEdjes(wire, srcVtx, targetVtx, mkGrid([node1, node2]))} srcPos={srcVtx.pos.add(offsetFromMDir(wire.startDir))} targetPos={targetVtx.pos.add(offsetFromMDir(wire.endDir))} />
        {/* <DrawPath path={path} /> */}
        {/* <DrawArcs arcs={arcs} />
        <Arrow wire={wire} startLine={path[0]} endLine={path[path.length - 1]} />

        {
            (() => {
                let elems = [];
                for (let i = 0; i < path.length; i++) {
                    elems.push(<line onMouseDown={onMouseDown} key={i} x1={path[i].start.x} y1={path[i].start.y} x2={path[i].end.x} y2={path[i].end.y} stroke="transparent" strokeWidth="10" />)
                }
                return elems;
            })()

        } */}

    </g>

}


function DrawPath({ path }: { path: BLine[] }): JSX.Element {
    let elems = [];
    for (let i = 0; i < path.length; i++) {
        elems.push(<line className="curve" key={i} x1={path[i].start.x} y1={path[i].start.y} x2={path[i].end.x} y2={path[i].end.y} stroke={`#999`} strokeWidth={2} />)
    }
    return <>{elems}</>;
}
function DrawArcs({ arcs }: { arcs: BLine[] }): JSX.Element {
    let elems = [];
    for (let i = 0; i < arcs.length; i++) {
        elems.push(
            <path
                key={i}
                className="curve"
                d={`
                    M ${arcs[i].start.x} ${arcs[i].start.y}
                    A 10 10 0 0 0  ${arcs[i].end.x} ${arcs[i].end.y}`
                }
                fill="none"
                stroke="#999"
                strokeWidth="2"
            />)
    }
    return <>{elems}</>;
}
function Arrow({ wire, startLine, endLine }: { wire: Wire, startLine: BLine, endLine: BLine }) {
    if (!startLine || !endLine) return <></>;


    function drawArrowInDir(dir: PinDir, line: BLine, inverse: boolean) {

        if (dir == "Bottom" || dir == "Top") {
            let pos = !inverse ? line.end : line.start;
            let v1 = new Vector2(pos.x - headLen / 2, pos.y + (!inverse ? -1 : 1) * headLen);
            let v2 = new Vector2(pos.x + headLen / 2, pos.y + (!inverse ? -1 : 1) * headLen);
            let v3 = new Vector2(pos.x, pos.y);
            return <polygon points={`${v1.x},${v1.y} ${v2.x},${v2.y} ${v3.x},${v3.y}`} fill="#999" stroke="transparent" strokeWidth={0} />
        } else {
            let pos = !inverse ? line.start : line.end;
            let v1 = new Vector2(pos.x + (!inverse ? -1 : 1) * headLen, pos.y - headLen / 2);
            let v2 = new Vector2(pos.x + (!inverse ? -1 : 1) * headLen, pos.y + headLen / 2);
            let v3 = new Vector2(pos.x, pos.y);
            return <polygon points={`${v1.x},${v1.y} ${v2.x},${v2.y} ${v3.x},${v3.y}`} fill="#999" stroke="transparent" strokeWidth={0} />
        }
    }

    // arrow head logic
    switch (wire.arrowDir.val) {

        case "Left": {
            return drawArrowInDir(wire.endDir, startLine, wire.endDir == "Bottom" || wire.endDir == "Right");
            return <></>
        }
        case "Right": {
            return drawArrowInDir(wire.startDir, startLine, wire.startDir == "Top" || wire.startDir == "Left");
        }
        case "Both": {
            // right
            return <>
                {drawArrowInDir(wire.startDir, startLine, wire.startDir == "Top" || wire.startDir == "Left")}
                {drawArrowInDir(wire.endDir, endLine, wire.endDir == "Top" || wire.endDir == "Left")}
            </>

        }
        case "None":
            return <></>
    }
}

function dijkstra_alg(wire: Wire, src: Vertex, target: Vertex, vertices: Array<Vertex>): [Array<BLine>, Array<BLine>] {
    function traceBack(targetUUID: string): BLine[] {
        let out: Array<BLine> = [];
        // let dir: LineDir = (wire.startDir == "Top" || wire.startDir == "Bottom") ? "Vert" : "Horz";

        let cur = path[targetUUID];
        out.push({ start: cur.self.pos, end: cur.preVertex!.pos });


        let count = 0;
        while (cur.preVertex != null) {
            count++;
            if (count > 1000) {
                alert("WHILE LOOP!!");
                break;
            }

            // let cur_dir: LineDir = "Horz";
            // if (cur.preVertex!.pos.x == cur.self.pos.x) {
            // cur_dir = "Vert";
            // }
            // if (cur_dir != dir) {
            // dir = cur_dir;
            out.push({ start: out[out.length - 1].end, end: Vector2.copy(cur.self.pos) });
            // }

            cur = path[cur.preVertex!.uuid];
        }

        out.push({ start: src.pos, end: out[out.length - 1].end });
        // out.splice(1, 1);

        return out;
    }
    type LineDir = "Vert" | "Horz";
    interface PathVertex { self: Vertex, dis: number, preVertex: Vertex | null };

    // set max distance
    let path: { [key: string]: PathVertex } = {};
    for (let vertex of vertices) {
        path[vertex.uuid] = { self: vertex, preVertex: null, dis: Number.MAX_SAFE_INTEGER };
    }
    // set distance of the srcVtx to zero
    path[src.uuid] = { self: src, preVertex: null, dis: 0 };

    let visited = [];
    let unvisted = Object.keys(path);
    let dir: LineDir | null = null;
    let vertex: Vertex | null;
    while (unvisted.length != 0) {
        let unvistedVtx = [];
        for (let key of unvisted) { unvistedVtx.push(path[key]); }
        const closestVtx = unvistedVtx.sort((a: PathVertex, b: PathVertex) => { return a.dis - b.dis; })[0];
        if (dir == null) {
            dir = (wire.startDir == "Top" || wire.startDir == "Bottom") ? "Vert" : "Horz";
        } else {
            dir = vertex!.pos.x == closestVtx.self.pos.x ? "Vert" : "Horz";
        }

        vertex = closestVtx.self;
        visited.push(vertex.uuid);
        unvisted.splice(unvisted.indexOf(vertex.uuid), 1);

        if (vertex.left) {
            let dis = path[vertex.uuid].dis + Math.sqrt(Math.pow(vertex.left.pos.x - vertex.pos.x, 2) + Math.pow(vertex.left.pos.y - vertex.pos.y, 2));
            if (dir != "Horz") {
                dis += 5000;
            }

            if (vertex.left.uuid == target.uuid) {
                if (path[vertex.left.uuid].dis > dis) {
                    path[vertex.left.uuid].dis = dis;
                    path[vertex.left.uuid].preVertex = vertex;
                }
            } else {
                if (path[vertex.left.uuid].dis > dis &&
                    (false || !rectCollidePoint!(vertex.left!.pos.x!, vertex.left!.pos.y, wire.node1Ptr.val.pos.x, wire.node1Ptr.val.pos.y, wire.node1Ptr.val.size.w, wire.node1Ptr.val.size.h)) &&
                    (false || !rectCollidePoint(vertex.left!.pos.x, vertex.left!.pos.y, wire.node2Ptr.val.pos.x, wire.node2Ptr.val.pos.y, wire.node2Ptr.val.size.w, wire.node2Ptr.val.size.h))
                ) {
                    path[vertex.left.uuid].dis = dis;
                    path[vertex.left.uuid].preVertex = vertex;
                }
            }
        }
        if (vertex.right) {
            if (vertex.right) {
                let dis = path[vertex.uuid].dis + Math.sqrt(Math.pow(vertex.right.pos.x - vertex.pos.x, 2) + Math.pow(vertex.right.pos.y - vertex.pos.y, 2));
                if (dir != "Horz") {
                    dis += 5000;
                }

                if (vertex.right.uuid == target.uuid) {
                    if (path[vertex.right.uuid].dis > dis) {
                        path[vertex.right.uuid].dis = dis;
                        path[vertex.right.uuid].preVertex = vertex;
                    }
                } else {
                    if (path[vertex.right.uuid].dis > dis &&
                        (false || !rectCollidePoint!(vertex.right!.pos.x!, vertex.right!.pos.y, wire.node1Ptr.val.pos.x, wire.node1Ptr.val.pos.y, wire.node1Ptr.val.size.w, wire.node1Ptr.val.size.h)) &&
                        (false || !rectCollidePoint(vertex.right!.pos.x, vertex.right!.pos.y, wire.node2Ptr.val.pos.x, wire.node2Ptr.val.pos.y, wire.node2Ptr.val.size.w, wire.node2Ptr.val.size.h))
                    ) {
                        path[vertex.right.uuid].dis = dis;
                        path[vertex.right.uuid].preVertex = vertex;
                    }
                }
            }
        }
        if (vertex.top) {
            let dis = path[vertex.uuid].dis + Math.sqrt(Math.pow(vertex.top.pos.x - vertex.pos.x, 2) + Math.pow(vertex.top.pos.y - vertex.pos.y, 2));
            if (dir != "Vert") {
                dis += 5000;
            }


            if (vertex.top.uuid == target.uuid) {
                if (path[vertex.top.uuid].dis > dis) {
                    path[vertex.top.uuid].dis = dis;
                    path[vertex.top.uuid].preVertex = vertex;
                }
            } else {
                if (path[vertex.top.uuid].dis > dis &&
                    (false || !rectCollidePoint(vertex.top!.pos.x, vertex.top!.pos.y, wire.node1Ptr.val.pos.x, wire.node1Ptr.val.pos.y, wire.node1Ptr.val.size.w, wire.node1Ptr.val.size.h)) &&
                    (false || !rectCollidePoint(vertex.top!.pos.x, vertex.top!.pos.y, wire.node2Ptr.val.pos.x, wire.node2Ptr.val.pos.y, wire.node2Ptr.val.size.w, wire.node2Ptr.val.size.h))
                ) {
                    path[vertex.top.uuid].dis = dis;
                    path[vertex.top.uuid].preVertex = vertex;
                }
            }
        }
        if (vertex.bottom) {
            let dis = path[vertex.uuid].dis + Math.sqrt(Math.pow(vertex.bottom.pos.x - vertex.pos.x, 2) + Math.pow(vertex.bottom.pos.y - vertex.pos.y, 2));
            if (dir != "Vert") {
                dis += 5000;
            }
            if (vertex.bottom.uuid == target.uuid) {
                if (path[vertex.bottom.uuid].dis > dis) {
                    path[vertex.bottom.uuid].dis = dis;
                    path[vertex.bottom.uuid].preVertex = vertex;
                }
            } else {
                if (path[vertex.bottom.uuid].dis > dis &&
                    (false || !rectCollidePoint(vertex.bottom!.pos.x, vertex.bottom!.pos.y, wire.node1Ptr.val.pos.x, wire.node1Ptr.val.pos.y, wire.node1Ptr.val.size.w, wire.node1Ptr.val.size.h)) &&
                    (false || !rectCollidePoint(vertex.bottom!.pos.x, vertex.bottom!.pos.y, wire.node2Ptr.val.pos.x, wire.node2Ptr.val.pos.y, wire.node2Ptr.val.size.w, wire.node2Ptr.val.size.h))
                ) {
                    path[vertex.bottom.uuid].dis = dis;
                    path[vertex.bottom.uuid].preVertex = vertex;
                }
            }


        }
    }



    let lines = traceBack(target.uuid);
    if (lines.length == 0) return [[], []]
    let out: Array<BLine> = [];
    let arcPoints: Array<BLine> = [];

    if (lines.length > 1) {
        lines[0].end = Vector2.copy(lines[1].start);
    }


    for (let line of lines) {
        let horz = line.start.y == line.end.y;
        if (horz) {
            if (line.start.x < line.end.x) {
                out.push({ start: Vector2.new(line.end.x, line.end.y), end: Vector2.new(line.start.x, line.start.y) })
            } else {
                out.push({ start: Vector2.new(line.start.x, line.start.y), end: Vector2.new(line.end.x, line.end.y) })
            }
        } else {
            if (line.start.y < line.end.y) {
                out.push({ start: Vector2.new(line.start.x, line.start.y), end: Vector2.new(line.end.x, line.end.y) })

            } else {
                out.push({ start: Vector2.new(line.end.x, line.end.y), end: Vector2.new(line.start.x, line.start.y) })
            }
        }
    }

    // NOTE: sorry for future me, use 1 or 0 in i drawing to inverse directions
    // for (let i = 0; i < out.length - 1; i++) {
    //     if (out[i].start.x == out[i].end.x) {
    //         if (out[i].end.x > out[i + 1].start.x) {
    //             if (out[i].end.y > out[i + 1].start.y) {
    //                 arcPoints.push({ start: out[i].start, end: out[i + 1].start });
    //             } else {
    //                 arcPoints.push({ start: out[i + 1].start, end: out[i].end });
    //             }
    //         } else {
    //             if (out[i].end.y > out[i + 1].start.y) {
    //                 arcPoints.push({ start: out[i + 1].end, end: out[i].start });
    //             } else {
    //                 arcPoints.push({ start: out[i].end, end: out[i + 1].end });
    //             }
    //         }
    //     } else {
    //         if (out[i].end.x > out[i + 1].start.x) {
    //             if (out[i].end.y > out[i + 1].start.y) {
    //                 arcPoints.push({ start: out[i + 1].end, end: out[i].end });
    //             } else {
    //                 arcPoints.push({ start: out[i].end, end: out[i + 1].start });
    //             }
    //         } else {
    //             if (out[i].end.y > out[i + 1].start.y) {
    //                 arcPoints.push({ start: out[i].start, end: out[i + 1].end });
    //             } else {
    //                 arcPoints.push({ start: out[i + 1].start, end: out[i].start });
    //             }
    //         }
    //     }
    // }
    return [out, []];
}




// NOTE: debug drawing 
function DebugGrid({ wire, lines, grid_edjes, srcPos, targetPos }: { wire: Wire, lines: Line[], grid_edjes: Vertex[], srcPos: Vector2, targetPos: Vector2 }) {
    function getBounds(): { pos: Vector2, size: Vector2 } {
        let bounds = {
            topLeft: new Vector2(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER),
            bottomRight: new Vector2(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER),
        }

        for (let node of [wire.node1Ptr.val, wire.node2Ptr.val]) {
            if (bounds.topLeft.x > node.pos.x) bounds.topLeft.x = node.pos.x
            if (bounds.topLeft.y > node.pos.y) bounds.topLeft.y = node.pos.y
            if (bounds.topLeft.x > node.pos.x + node.size.w) bounds.topLeft.x = node.pos.x + node.size.w
            if (bounds.topLeft.y > node.pos.y + node.size.h) bounds.topLeft.y = node.pos.y + node.size.h

            if (bounds.bottomRight.x < node.pos.x) bounds.bottomRight.x = node.pos.x
            if (bounds.bottomRight.y < node.pos.y) bounds.bottomRight.y = node.pos.y
            if (bounds.bottomRight.x < node.pos.x + node.size.w) bounds.bottomRight.x = node.pos.x + node.size.w
            if (bounds.bottomRight.y < node.pos.y + node.size.h) bounds.bottomRight.y = node.pos.y + node.size.h

        }

        return { pos: bounds.topLeft, size: bounds.bottomRight.sub(bounds.topLeft) };
    }
    const boundRect = getBounds();

    const drawLines: Line[] = [];
    function drawHalfLineVert(node: Node): { x: number, y0: number, y1: number } {
        let x: number = 0;
        let y0: number = 0;
        let y1: number = 0;
        if (node.pos.x == boundRect.pos.x) { x = node.pos.x + node.size.w + (boundRect.size.w - node.size.w) / 2; }
        else { x = node.pos.x - (boundRect.size.w - node.size.w) / 2; }
        if (node.pos.y == boundRect.pos.y) { y0 = boundRect.pos.y; y1 = y0 + boundRect.size.h / 2; }
        else { y0 = boundRect.pos.y + boundRect.size.h / 2; y1 = boundRect.pos.y + boundRect.size.h; }
        return { x, y0, y1 };
    }

    function drawHalfLineHorz(node: Node): { y: number, x0: number, x1: number } {
        let y: number = 0;
        let x0: number = 0;
        let x1: number = 0;
        if (node.pos.y == boundRect.pos.y) { y = node.pos.y + node.size.h + (boundRect.size.h - node.size.h) / 2; }
        else { y = node.pos.y - (boundRect.size.h - node.size.h) / 2; }
        if (node.pos.x == boundRect.pos.x) { x0 = boundRect.pos.x; x1 = x0 + boundRect.size.w / 2; }
        else { x0 = boundRect.pos.x + boundRect.size.w / 2; x1 = boundRect.pos.x + boundRect.size.w; }
        return { y, x0, x1 };
    }
    // vert
    if (Math.max(wire.node1Ptr.val.size.w, wire.node2Ptr.val.size.w) > boundRect.size.w / 2) {
        let vert1 = drawHalfLineVert(wire.node1Ptr.val);
        drawLines.push(Line_new(vert1.x, vert1.y0, vert1.x, vert1.y1));
        let vert2 = drawHalfLineVert(wire.node2Ptr.val);
        drawLines.push(Line_new(vert2.x, vert2.y0, vert2.x, vert2.y1));
    } else {
        function drawNodeLines(node:  Node) {
            let y0 = boundRect.pos.y + boundRect.size.h / 2 ;
            let y1 = boundRect.pos.y + boundRect.size.h;
            let x = node.pos.x;            
            // return {x : node. }
        }

        drawLines.push(Line_new(boundRect.pos.x + boundRect.size.w / 2, boundRect.pos.y, boundRect.pos.x + boundRect.size.w / 2, boundRect.pos.y + boundRect.size.h));

        let y0 = boundRect.pos.y + boundRect.size.h / 2 ;
        let y1 = boundRect.pos.y + boundRect.size.h;
        let x = wire.node1Ptr.val.pos.x;
        let w = wire.node1Ptr.val.size.w;
        if(wire.node1Ptr.val.pos.y != boundRect.pos.y) {
            y0 = boundRect.pos.y;
            y1 = boundRect.pos.y + boundRect.size.h / 2;
        }
        drawLines.push(Line_new(x,y0,x,y1));
        drawLines.push(Line_new(x + w,y0,x + w,y1 )); 


        y0 = boundRect.pos.y + boundRect.size.h / 2 ;
        y1 = boundRect.pos.y + boundRect.size.h;
        x = wire.node2Ptr.val.pos.x;
        w = wire.node2Ptr.val.size.w;
        if(wire.node2Ptr.val.pos.y != boundRect.pos.y) {
            y0 = boundRect.pos.y;
            y1 = boundRect.pos.y + boundRect.size.h / 2;        
        }
        drawLines.push(Line_new(x,y0,x,y1));
        drawLines.push(Line_new(x + w,y0,x + w,y1 )); 

    }

    if (Math.max(wire.node1Ptr.val.size.h, wire.node2Ptr.val.size.h) > boundRect.size.h / 2) {
        let horz1 = drawHalfLineHorz(wire.node1Ptr.val);
        drawLines.push(Line_new(horz1.x0, horz1.y, horz1.x1, horz1.y));
        let horz2 = drawHalfLineHorz(wire.node2Ptr.val);
        drawLines.push(Line_new(horz2.x0, horz2.y, horz2.x1, horz2.y));
    } else {
        drawLines.push(Line_new(boundRect.pos.x, boundRect.pos.y + boundRect.size.h / 2, boundRect.pos.x + boundRect.size.w, boundRect.pos.y + boundRect.size.h / 2));
    }


    return <>
        {/* {
            lines.map((line, idx) => {
                return <line key={idx} x1={line.start.pos.x} y1={line.start.pos.y} x2={line.end.pos.x} y2={line.end.pos.y} stroke="#555" strokeWidth={2} />
            })
        } */}

        {
            drawLines.map((line, idx) => {
                return <line key={idx} x1={line.start.pos.x} y1={line.start.pos.y} x2={line.end.pos.x} y2={line.end.pos.y} stroke="#555" strokeWidth={2} />
            })
        }



        {/* {
            grid_edjes.map((edje, idx) => {
                return <circle key={idx} cx={edje.pos.x} cy={edje.pos.y} fill="blue" opacity={1} r={4} />
            })
        } */}

        <rect fill="#000" opacity="0.2" x={boundRect.pos.x} y={boundRect.pos.y} width={boundRect.size.w} height={boundRect.size.h} />
        {/* <circle cx={srcPos.x} cy={srcPos.y} fill="yellow" opacity={1} r={4} /> */}
        {/* <circle cx={targetPos.x} cy={targetPos.y} fill="yellow" opacity={1} r={4} /> */}
    </>
}
