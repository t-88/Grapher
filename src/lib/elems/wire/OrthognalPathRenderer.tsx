import { useSnapshot } from "valtio";
import { Canvas_Size } from "../../core/consts";
import { engine } from "../../core/engine";
import { Vector2, type BLine } from "../../libs/math";
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

let MARGIN: EdgeInsets = { top: 30, bottom: 30, left: 30, right: 30 };
const PIN_SIZE = 5;
const headLen = 14;

export default function OrthognalPathRenderer({ wire, node1, node2, onMouseDown }: { wire: Wire, node1: Node, node2: Node, onMouseDown: () => void }) {
    function vertexFromDir(dir : PinDir,node : Node) : Vertex {
        switch (dir) {
            case "Top": return Vertex.new(new Vector2(node.pinsPoses.Top.x + PIN_SIZE, node.pos.y));
            case "Bottom": return Vertex.new(new Vector2(node.pinsPoses.Bottom.x + PIN_SIZE, node.pos.y + node.size.h));
            case "Left": return Vertex.new(new Vector2(node.pos.x , node.pinsPoses.Left.y + PIN_SIZE));
            case "Right": return Vertex.new(new Vector2(node.pos.x + node.size.w  , node.pinsPoses.Right.y + PIN_SIZE));
        }
    }
    function offsetFromMDir(dir : PinDir) : Vector2 {
        switch (dir) {
            case "Top": return Vector2.new(0,-MARGIN.top); 
            case "Bottom": return Vector2.new(0,MARGIN.bottom); 
            case "Left": return Vector2.new(-MARGIN.left,0); 
            case "Right": return Vector2.new(MARGIN.right,0); 
        }
    }
    function setVtxNeighborsFromDir(dir : PinDir, vtx : Vertex,neighnorVtx : Vertex) {
        switch (dir) {
            case "Left":  vtx.left =    neighnorVtx; break;
            case "Right":  vtx.right =  neighnorVtx; break;
            case "Top":    vtx.top =    neighnorVtx; break;
            case "Bottom": vtx.bottom = neighnorVtx; break;
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

    let srcVtx: Vertex = vertexFromDir(wire.startDir,node1);
    let targetVtx: Vertex = vertexFromDir(wire.endDir,node2);
    function getEdjes(lines: Line[]): Vertex[] {
        function overrideVtxConnectionFromDir(dir : PinDir, mainVtx : Vertex ,vtx : Vertex) {
            switch (dir) {
            case "Left":   if(vtx.uuid == mainVtx.left?.uuid ) vtx.right =    mainVtx; break;
            case "Right":  if(vtx.uuid == mainVtx.right?.uuid ) vtx.left =  mainVtx; break;
            case "Top":    if(vtx.uuid == mainVtx.top?.uuid ) vtx.bottom =    mainVtx; break;
            case "Bottom": if(vtx.uuid == mainVtx.bottom?.uuid ) vtx.top = mainVtx; break;
            }
        }

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
                            setVtxNeighborsFromDir(wire.startDir,srcVtx,edje);
                        }
                        if (edje.pos.equal(targetVtx.pos.add(targetOffset))) {
                            setVtxNeighborsFromDir(wire.endDir,targetVtx,edje);
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

                if (y != 0 && srcVtx.top?.uuid != edjes[(y - 1) * 6 + (x - 0)].uuid  && targetVtx.top?.uuid != edjes[(y - 1) * 6 + (x - 0)].uuid) 
                    edje.top = edjes[(y - 1) * 6 + (x - 0)];
                if (y != 5 && srcVtx.bottom?.uuid != edjes[(y + 1) * 6 + (x - 0)].uuid  && targetVtx.bottom?.uuid != edjes[(y + 1) * 6 + (x - 0)].uuid) 
                    edje.bottom = edjes[(y + 1) * 6 + (x + 0)];
                if (x != 0 && srcVtx.left?.uuid != edjes[(y - 0) * 6 + (x - 1)].uuid  && targetVtx.left?.uuid != edjes[(y - 0) * 6 + (x - 1)].uuid) 
                    edje.left = edjes[(y - 0) * 6 + (x - 1)];
                if (x != 5 && srcVtx.right?.uuid != edjes[(y - 0) * 6 + (x + 1)].uuid  && targetVtx.right?.uuid != edjes[(y - 0) * 6 + (x + 1)].uuid) 
                    edje.right = edjes[(y - 0) * 6 + (x + 1)];

                overrideVtxConnectionFromDir(wire.startDir,srcVtx,edje);
                overrideVtxConnectionFromDir(wire.endDir,targetVtx,edje);
            }
        }

        return edjes;
    }


    useSnapshot(engine.selectedWire);


    // mkGrid then generate edjes from grid
    let edjes: Vertex[] = getEdjes(mkGrid([node1, node2]));
    // generate the path and arcs
    let [path, arcs] = dijkstra_alg(wire,srcVtx, targetVtx, [srcVtx, targetVtx, ...edjes]);

    return <g className={engine.selectedWire.val?.uuid == wire.uuid ? "wire-selected" : ""}>
        {/* <DebugGrid lines={mkGrid([node1,node2])} grid_edjes={getEdjes(mkGrid([node1,node2]))} srcPos={srcVtx.pos.add(offsetFromMDir(wire.startDir))} targetPos={targetVtx.pos.add(offsetFromMDir(wire.endDir))}  /> */}
        <DrawPath path={path} />
        <DrawArcs arcs={arcs} />
        <Arrow wire={wire} startLine={path[0]} endLine={path[path.length - 1]} />

        {
            (() => {
                let elems = [];
                for (let i = 0; i < path.length; i++) {
                    elems.push(<line onMouseDown={onMouseDown} key={i} x1={path[i].start.x} y1={path[i].start.y} x2={path[i].end.x} y2={path[i].end.y} stroke="transparent" strokeWidth="10" />)
                }
                return elems;
            })()

        }

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


function isVert(line: BLine) {
    return line.start.x - line.end.x;
}


function Arrow({ wire, startLine, endLine }: { wire: Wire, startLine: BLine, endLine: BLine }) {
    if(!startLine || !endLine) return <></>;

    // arrow head logic
    switch (wire.arrowDir.val) {
        case "Left": {
            let v1 = new Vector2(startLine.end.x - headLen / 2, startLine.end.y - headLen);
            let v2 = new Vector2(startLine.end.x + headLen / 2, startLine.end.y - headLen);
            let v3 = new Vector2(startLine.end.x, startLine.end.y);
            return <polygon points={`${v1.x},${v1.y} ${v2.x},${v2.y} ${v3.x},${v3.y}`} fill="#999" stroke="transparent" strokeWidth={0} />


        }

        case "Right": {

            let v1 = new Vector2(endLine.end.x - headLen / 2, endLine.end.y - headLen);
            let v2 = new Vector2(endLine.end.x + headLen / 2, endLine.end.y - headLen);
            let v3 = new Vector2(endLine.end.x, endLine.end.y);
            return <polygon points={`${v1.x},${v1.y} ${v2.x},${v2.y} ${v3.x},${v3.y}`} fill="#999" stroke="transparent" strokeWidth={0} />
        }

        case "Both": {
            // right
            let v11 = new Vector2(startLine.end.x - headLen / 2, startLine.end.y - headLen);
            let v12 = new Vector2(startLine.end.x + headLen / 2, startLine.end.y - headLen);
            let v13 = new Vector2(startLine.end.x, startLine.end.y);


            let v21 = new Vector2(endLine.end.x - headLen / 2, endLine.end.y - headLen);
            let v22 = new Vector2(endLine.end.x + headLen / 2, endLine.end.y - headLen);
            let v23 = new Vector2(endLine.end.x, endLine.end.y);

            return <>
                <polygon points={`${v21.x},${v21.y} ${v22.x},${v22.y} ${v23.x},${v23.y}`} fill="#999" stroke="transparent" strokeWidth={0} />
                <polygon points={`${v11.x},${v11.y} ${v12.x},${v12.y} ${v13.x},${v13.y}`} fill="#999" stroke="transparent" strokeWidth={0} />
            </>
        }
        case "None":
            return <></>
    }
}







function dijkstra_alg(wire : Wire,src: Vertex, target: Vertex, vertices: Array<Vertex>): [Array<BLine>, Array<BLine>] {
    type LineDir = "Vert" | "Horz";
    interface PathEntry { self: Vertex, dis: number, preVertex: Vertex | null };

    function traceBack(targetUUID: string): BLine[] {
        let out: Array<BLine> = [];
        let dir: LineDir =  (wire.startDir == "Top" || wire.startDir == "Bottom") ? "Vert" : "Horz";

        // return [];
        let cur = path[targetUUID];
        out.push({ start: cur.self.pos, end: cur.preVertex!.pos });


        let count = 0;
        while (cur.preVertex != null) {
            count++;
            if (count > 1000) {
                alert("WHILE LOOP!!");
                break;
            }

            let cur_dir: LineDir = "Horz";
            if (cur.preVertex!.pos.x == cur.self.pos.x) {
                cur_dir = "Vert";
            }

            if (cur_dir != dir) {
                dir = cur_dir;
                out.push({ start: out[out.length - 1].end, end: Vector2.copy(cur.self.pos) });
            }

            cur = path[cur.preVertex!.uuid];
        }

        out.push({ start: src.pos, end: out[out.length - 1].end });
        out.splice(1, 1);

        return out;
    }




    let path: { [key: string]: PathEntry } = {};


    for (let vertex of vertices) {
        path[vertex.uuid] = { self: vertex, preVertex: null, dis: Number.MAX_SAFE_INTEGER };
    }
    path[src.uuid] = { self: src, preVertex: null, dis: 0 };

    let visited = [];
    let unvisted = Object.keys(path);
    let count = 0;
    let prev_dir : LineDir = (wire.startDir == "Top" || wire.startDir == "Bottom") ? "Vert" : "Horz";
    let vertex = null;
    while (unvisted.length != 0) {
        count++;
        if (count > 10000) {
            alert("WHILE LOOP!!");
            break;
        }

        let un_edjes = [];
        for (let key of unvisted) {
            un_edjes.push(path[key]);
        }


        let edje = un_edjes.sort((a: PathEntry, b: PathEntry) => { return a.dis - b.dis; })[0];
        if (vertex) {
            if (edje.self.pos.x == vertex.pos.x) {
                prev_dir = "Vert";
            } else {
                prev_dir = "Horz";
            }
        }
        vertex = edje.self;
        if (vertex.left) {
            let dis = path[vertex.uuid].dis + Math.abs(vertex.left.pos.x - vertex.pos.x);
            if (prev_dir != "Horz") {
                dis += 40000;
            }

            if (path[vertex.left.uuid].dis > dis) {
                path[vertex.left.uuid].dis = dis;
                path[vertex.left.uuid].preVertex = vertex;
            }
        }
        if (vertex.right) {
            let dis = path[vertex.uuid].dis + Math.abs(vertex.right.pos.x - vertex.pos.x);
            if (prev_dir != "Horz") {
                dis += 40000;
            }

            if (path[vertex.right.uuid].dis > dis) {
                path[vertex.right.uuid].dis = dis;
                path[vertex.right.uuid].preVertex = vertex;
            }
        }
        if (vertex.top) {
            let dis = path[vertex.uuid].dis + Math.abs(vertex.top.pos.y - vertex.pos.y);
            if (prev_dir != "Vert") {
                dis += 40000;
            }

            if (path[vertex.top.uuid].dis > dis) {
                path[vertex.top.uuid].dis = dis;
                path[vertex.top.uuid].preVertex = vertex;
            }
        }
        if (vertex.bottom) {
            let dis = path[vertex.uuid].dis + Math.abs(vertex.bottom.pos.y - vertex.pos.y);
            if (prev_dir != "Vert") {
                dis += 40000;
            }

            if (path[vertex.bottom.uuid].dis > dis) {
                path[vertex.bottom.uuid].dis = dis;
                path[vertex.bottom.uuid].preVertex = vertex;
            }
        }


        visited.push(vertex.uuid);
        unvisted.splice(unvisted.indexOf(vertex.uuid), 1);
    }



    let lines = traceBack(target.uuid);
    if(lines.length == 0) return [[],[]]
    let out: Array<BLine> = [];
    let arcPoints: Array<BLine> = [];

    if (lines.length > 1) {

        lines[0].end = Vector2.copy(lines[1].start);
    }


    let DIST = 4;
    for (let line of lines) {
        let horz = line.start.y == line.end.y;
        if (horz) {
            if (line.start.x < line.end.x) {
                out.push({ start: Vector2.new(line.end.x - DIST, line.end.y), end: Vector2.new(line.start.x + DIST, line.start.y) })
            } else {
                out.push({ start: Vector2.new(line.start.x - DIST, line.start.y), end: Vector2.new(line.end.x + DIST, line.end.y) })
            }
        } else {
            // override the offset in the target/src vertices
            if (line.start.equal(src.pos)) {
                line.start.y += DIST;
            }
            if (line.start.equal(target.pos)) {
                line.start.y += DIST;
            }


            if (line.start.y < line.end.y) {
                out.push({ start: Vector2.new(line.start.x, line.start.y + DIST), end: Vector2.new(line.end.x, line.end.y - DIST) })

            } else {
                out.push({ start: Vector2.new(line.end.x, line.end.y + DIST), end: Vector2.new(line.start.x, line.start.y - DIST) })
            }
        }
    }
    // NOTE: sorry for future me, use 1 or 0 in i drawing to inverse directions
    for (let i = 0; i < out.length - 1; i++) {
        if (out[i].start.x == out[i].end.x) {
            if (out[i].end.x > out[i + 1].start.x) {
                if (out[i].end.y > out[i + 1].start.y) {
                    arcPoints.push({ start: out[i].start, end: out[i + 1].start });
                } else {
                    arcPoints.push({ start: out[i + 1].start, end: out[i].end });
                }
            } else {
                if (out[i].end.y > out[i + 1].start.y) {
                    arcPoints.push({ start: out[i + 1].end, end: out[i].start });
                } else {
                    arcPoints.push({ start: out[i].end, end: out[i + 1].end });
                }
            }
        } else {
            if (out[i].end.x > out[i + 1].start.x) {
                if (out[i].end.y > out[i + 1].start.y) {
                    arcPoints.push({ start: out[i + 1].end, end: out[i].end });
                } else {
                    arcPoints.push({ start: out[i].end, end: out[i + 1].start });
                }
            } else {
                if (out[i].end.y > out[i + 1].start.y) {
                    arcPoints.push({ start: out[i].start, end: out[i + 1].end });
                } else {
                    arcPoints.push({ start: out[i + 1].start, end: out[i].start });
                }
            }
        }
    }
    return [out, arcPoints];
}




// NOTE: debug drawing 
function DebugGrid({lines, grid_edjes, srcPos, targetPos} : {lines: Line[], grid_edjes: Vertex[], srcPos: Vector2, targetPos: Vector2}) {

    let gridBounds = {
        top_left: new Vector2(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER),
        bottom_right: new Vector2(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER),
    }
    for (let line of lines) {
        if (line.start.pos.x == line.end.pos.x) {
            for (let pline of lines) {
                if (pline.start.pos.y == pline.end.pos.y) {
                    if (gridBounds.top_left.x > line.start.pos.x) gridBounds.top_left.x = line.start.pos.x;
                    if (gridBounds.top_left.y > pline.start.pos.y) gridBounds.top_left.y = pline.start.pos.y;
                    if (gridBounds.bottom_right.x < line.start.pos.x) gridBounds.bottom_right.x = line.start.pos.x;
                    if (gridBounds.bottom_right.y < pline.start.pos.y) gridBounds.bottom_right.y = pline.start.pos.y;
                }
            }
        }
    }

    return <>
        {
            lines.map((line, idx) => {
                return <line key={idx} x1={line.start.pos.x} y1={line.start.pos.y} x2={line.end.pos.x} y2={line.end.pos.y} stroke="#555" strokeWidth={2} />
            })
        }


        {
            grid_edjes.map((edje, idx) => {
                return <circle key={idx} cx={edje.pos.x} cy={edje.pos.y} fill="blue" opacity={1} r={4} />
            })
        }


        <rect fill="#99900050" x={gridBounds.top_left.x} y={gridBounds.top_left.y} width={gridBounds.bottom_right.x - gridBounds.top_left.x} height={gridBounds.bottom_right.y - gridBounds.top_left.y} />
        <circle cx={srcPos.x} cy={srcPos.y} fill="yellow" opacity={1} r={4} />
        <circle cx={targetPos.x} cy={targetPos.y} fill="yellow" opacity={1} r={4} />
    </>
}
