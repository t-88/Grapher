import { Vector2, type Pointer } from "../libs/math";
import { bazierCurve, bezierCubic } from "../libs/utils";
import { Node } from "./node";
import { engine } from "../core/engine";
import { proxy, useSnapshot } from "valtio";
import type { PinDir } from "./pin";
import "./wire.css";
import type EdgeInsets from "../types/EdgeInsets";
import { Canvas_Size } from "../core/consts";



interface Vertex {
    uuid: string,
    pos: Vector2,
    left?: Vertex | null,
    right?: Vertex | null,
    top?: Vertex | null,
    bottom?: Vertex | null,
}
interface Line {
    start: Vertex;
    end: Vertex;
};

function dijkstra_alg(src: Vertex, target: Vertex, vertices: Array<Vertex>) : Array<Vertex> {
    interface PathEntry { self: Vertex, dis: number, preVertex: Vertex | null };
    let path: { [key: string]: PathEntry } = {};


    // : Map<string, > = new Map();

    for (let vertex of vertices) {
        path[vertex.uuid] = { self: vertex, preVertex: null, dis: Number.MAX_SAFE_INTEGER };
    }
    path[src.uuid] = { self: src, preVertex: null, dis: 0 };

    let visited = [];
    let unvisted = Object.keys(path);
    let count = 0;
    let prev_dir = "vert";
    let vertex = null;
    while (unvisted.length != 0) {
        count++;
        if (count > 10000) {
            break;
        }

        let un_edjes = [];
        for (let key of unvisted) {
            un_edjes.push(path[key]);
        }


        let edje = un_edjes.sort((a: PathEntry, b: PathEntry) => { return a.dis - b.dis; })[0];
        if(vertex) {
            if(edje.self.pos.x == vertex.pos.x) {
                prev_dir = "vert";
            } else {
                prev_dir = "horz";
            }
        }
        vertex = edje.self;
        if (vertex.left) {
            let dis = path[vertex.uuid].dis + Math.abs(vertex.left.pos.x - vertex.pos.x);
            if(prev_dir != "horz") {
                dis += 1000;
            }
 
            if (path[vertex.left.uuid].dis > dis) {
                path[vertex.left.uuid].dis = dis;
                path[vertex.left.uuid].preVertex = vertex;
            }
        }
        if (vertex.right) {
            let dis = path[vertex.uuid].dis + Math.abs(vertex.right.pos.x - vertex.pos.x);
            if(prev_dir != "horz") {
                dis += 1000;
            }

            if (path[vertex.right.uuid].dis > dis) {
                path[vertex.right.uuid].dis = dis;
                path[vertex.right.uuid].preVertex = vertex;
            }
        }
        if (vertex.top) {
            let dis = path[vertex.uuid].dis + Math.abs(vertex.top.pos.y - vertex.pos.y);
            if(prev_dir != "vert") {
                dis += 1000;
            }

            if (path[vertex.top.uuid].dis > dis) {
                path[vertex.top.uuid].dis = dis;
                path[vertex.top.uuid].preVertex = vertex;
            }
        }
        if (vertex.bottom) {
            let dis = path[vertex.uuid].dis + Math.abs(vertex.bottom.pos.y - vertex.pos.y);
            if(prev_dir != "vert") {
                dis += 1000;
            }
         
            if (path[vertex.bottom.uuid].dis > dis) {
                path[vertex.bottom.uuid].dis = dis;
                path[vertex.bottom.uuid].preVertex = vertex;
            }
        }


        visited.push(vertex.uuid);
        unvisted.splice(unvisted.indexOf(vertex.uuid), 1);
    }


    function traceBack(targetUUID: string): Array<Vertex> {
        let out: Array<Vertex> = [];
        let count = 0;
        let cur = path[targetUUID];
        while (true) {
            count++;
            if (count > 1000) {
                alert("WHILE LOOP!!");
                break;
            }

            if (cur.preVertex == null) break;
            out.push(cur.self);
            cur = path[cur.preVertex.uuid];
        }

        return out;
    }


    return traceBack(target.uuid);
}

function OrthognalPathRenderer({ node1, node2 }: { node1: Node, node2: Node }) {
    let margin: EdgeInsets = { top: 10, bottom: 10, left: 10, right: 10 };
    let lines: Array<Line> = [];


    let srcEdje: Vertex = {
        pos: new Vector2(node1.pinsPoses.Top.x + 5, node1.pinsPoses.Top.y),
        uuid: crypto.randomUUID(),
    };

    let targetEdje: Vertex = {
        pos: new Vector2(node2.pinsPoses.Top.x + 5, node2.pinsPoses.Top.y),
        uuid: crypto.randomUUID(),
    };

    let targetPos: Vector2 = new Vector2(0, 0);
    let srcPos: Vector2 = new Vector2(0, 0);

    let nodes = [node1, node2];
    for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];

        // horizontal
        lines.push({
            start: { uuid: crypto.randomUUID(), pos: new Vector2(0, node.pos.y - margin.top) },
            end: { uuid: crypto.randomUUID(), pos: new Vector2(Canvas_Size.w, node.pos.y - margin.top) }
        });
        lines.push({
            start: { uuid: crypto.randomUUID(), pos: new Vector2(0, node.pos.y + node.size.h + margin.bottom) },
            end: { uuid: crypto.randomUUID(), pos: new Vector2(Canvas_Size.w, node.pos.y + node.size.h + margin.bottom) }
        });

        // vertical
        lines.push({
            start: { uuid: crypto.randomUUID(), pos: new Vector2(node.pos.x - margin.left, 0) },
            end: { uuid: crypto.randomUUID(), pos: new Vector2(node.pos.x - margin.left, Canvas_Size.h) },
        });
        lines.push({
            start: { uuid: crypto.randomUUID(), pos: new Vector2(node.pos.x + margin.right + node.size.w, 0) },
            end: { uuid: crypto.randomUUID(), pos: new Vector2(node.pos.x + margin.right + node.size.w, Canvas_Size.h) },
        });


        if (node.pins.Bottom || node.pins.Top) {
            let x = node.pins.Top ? node.pinsPoses.Top.x : node.pinsPoses.Bottom.x;
            lines.push({
                start: { uuid: crypto.randomUUID(), pos: new Vector2(x + 5, 0) },
                end: { uuid: crypto.randomUUID(), pos: new Vector2(x + 5, Canvas_Size.h) },
            });

            if (node.pins.Top) {
                if (i == 0) {
                    srcPos.set(x + 5, node.pos.y - margin.top);
                } else {
                    targetPos.set(x + 5, node.pos.y - margin.top);
                }
            }
        }
        if (node.pins.Left || node.pins.Right) {
            let y = node.pins.Left ? node.pinsPoses.Left.y : node.pinsPoses.Right.y;
            lines.push({
                start: { uuid: crypto.randomUUID(), pos: new Vector2(0, y + 5) },
                end: { uuid: crypto.randomUUID(), pos: new Vector2(Canvas_Size.w, y + 5) },
            });
        }
    }


    let edjes: Array<Vertex> = [];
    let grid_border = {
        top_left: new Vector2(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER),
        bottom_right: new Vector2(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER),

    }
    for (let line of lines) {
        // horizontal
        if (line.start.pos.x == line.end.pos.x) {
            for (let pline of lines) {
                if (pline.start.pos.y == pline.end.pos.y) {
                    edjes.push({ pos: new Vector2(line.start.pos.x, pline.start.pos.y), uuid: crypto.randomUUID() });

                    if (edjes[edjes.length - 1].pos.equal(srcPos)) {
                        srcEdje.top = edjes[edjes.length - 1];
                    }

                    if (edjes[edjes.length - 1].pos.equal(targetPos)) {
                        targetEdje.top = edjes[edjes.length - 1];
                    }


                    if (grid_border.top_left.x > line.start.pos.x) grid_border.top_left.x = line.start.pos.x;
                    if (grid_border.top_left.y > pline.start.pos.y) grid_border.top_left.y = pline.start.pos.y;
                    if (grid_border.bottom_right.x < line.start.pos.x) grid_border.bottom_right.x = line.start.pos.x;
                    if (grid_border.bottom_right.y < pline.start.pos.y) grid_border.bottom_right.y = pline.start.pos.y;
                }
            }
        }
    }


    edjes = edjes.sort((a: Vertex, b: Vertex) => a.pos.y - b.pos.y);
    let grid_edjes: Array<Vertex> = [];
    for (let j = 0; j < 4; j++) {
        let arr = [];
        for (let i = 0; i < 6; i++) {
            arr.push(edjes[j * 6 + i]);
        }
        grid_edjes = [...grid_edjes, ...arr.sort((a: Vertex, b: Vertex) => a.pos.x - b.pos.x)]
    }

    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 6; x++) {
            let edje = grid_edjes[y * 6 + x];
            if (y != 0) edje.top = grid_edjes[(y - 1) * 6 + (x - 0)];
            if (y != 5 && edje.uuid != srcEdje.top?.uuid && edje.uuid != targetEdje.top?.uuid) edje.bottom = grid_edjes[(y + 1) * 6 + (x + 0)];
            if (x != 0) edje.left = grid_edjes[(y - 0) * 6 + (x - 1)];
            if (x != 5) edje.right = grid_edjes[(y - 0) * 6 + (x + 1)];

            if (edje.uuid == srcEdje.top?.uuid) {
                edje.bottom = srcEdje;
            }
            if (edje.uuid == targetEdje.top?.uuid) {
                edje.bottom = targetEdje;

            }
        }
    }


    let path = dijkstra_alg(srcEdje, targetEdje, [srcEdje, targetEdje, ...grid_edjes]);



    return <g>
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

        <rect fill="#00000050" x={grid_border.top_left.x} y={grid_border.top_left.y} width={grid_border.bottom_right.x - grid_border.top_left.x} height={grid_border.bottom_right.y - grid_border.top_left.y} />
        <circle cx={srcPos.x} cy={srcPos.y} fill="yellow" opacity={1} r={4} />
        <circle cx={targetPos.x} cy={targetPos.y} fill="yellow" opacity={1} r={4} />

        {
                (() => {
                    let elems = [];
                    for(let i = 0; i < path.length - 1; i++) {
                        elems.push(<line key={i} x1={path[i].pos.x} y1={path[i].pos.y} x2={path[i + 1].pos.x} y2={path[i + 1].pos.y} stroke="red" strokeWidth={4} />)
                    }
                    return elems;
                })()

                // path.map((vertex,idx) => {
                // return <line key={idx} x1={line.start.pos.x} y1={line.start.pos.y} x2={line.end.pos.x} y2={line.end.pos.y} stroke="#555" strokeWidth={2} />
            // })
        }
    </g>
}




function Line({ wire }: { wire: Wire }) {
    useSnapshot(engine.selectedWire);

    let startPos = wire.node1Ptr.val.pinsPoses[wire.startDir];
    let endPos = wire.node2Ptr.val.pinsPoses[wire.endDir];
    startPos = new Vector2(startPos.x + 5, startPos.y);
    endPos = new Vector2(endPos.x + 5, endPos.y);

    let { path, c0, c1 } = bazierCurve(startPos, endPos, wire.startDir, wire.endDir, { curvature: wire.curvature.val / 100 });



    // split curve into lines
    // 8 chunks
    let lines: Array<{ start: Vector2, end: Vector2 }> = [];
    let lPrevPoint = new Vector2(startPos.x, startPos.y);
    for (let i = 0; i < 8; i++) {
        let point = bezierCubic(startPos, endPos, c0, c1, i * 1 / 8)
        lines.push({ start: lPrevPoint, end: point })
        lPrevPoint = point;
    }
    lines.push({ start: lPrevPoint, end: endPos });

    function onMouseDown(evt: React.MouseEvent<SVGGElement, MouseEvent>) {
        // i use pointer-events painted to get the click
        engine.onSelectWire(wire);
    }


    function Arrow() {
        // arrow head logic
        const headLen = 16;
        switch (wire.arrowDir.val) {
            case "Left": {
                const prevPoint = bezierCubic(startPos, endPos, c0, c1, 0.95);
                const angle = Math.atan2(endPos.y - prevPoint.y, endPos.x - prevPoint.x);
                let v1 = new Vector2(endPos.x - headLen * Math.cos(angle - Math.PI / 6), endPos.y - headLen * Math.sin(angle - Math.PI / 6));
                let v2 = new Vector2(endPos.x - headLen * Math.cos(angle + Math.PI / 6), endPos.y - headLen * Math.sin(angle + Math.PI / 6));
                let v3 = new Vector2(endPos.x, endPos.y);
                return <polygon points={`${v1.x},${v1.y} ${v2.x},${v2.y} ${v3.x},${v3.y}`} fill="#999" stroke="transparent" strokeWidth={0} />
            }

            case "Right": {
                const prevPoint = bezierCubic(startPos, endPos, c0, c1, 0.05);
                const angle = Math.atan2(startPos.y - prevPoint.y, startPos.x - prevPoint.x);
                let v1 = new Vector2(startPos.x - headLen * Math.cos(angle - Math.PI / 6), startPos.y - headLen * Math.sin(angle - Math.PI / 6));
                let v2 = new Vector2(startPos.x - headLen * Math.cos(angle + Math.PI / 6), startPos.y - headLen * Math.sin(angle + Math.PI / 6));
                let v3 = new Vector2(startPos.x, startPos.y);
                return <polygon points={`${v1.x},${v1.y} ${v2.x},${v2.y} ${v3.x},${v3.y}`} fill="#999" stroke="transparent" strokeWidth={0} />
            }

            case "Both": {
                // right
                const prevPoint1 = bezierCubic(startPos, endPos, c0, c1, 0.05);
                const angle1 = Math.atan2(startPos.y - prevPoint1.y, startPos.x - prevPoint1.x);
                let v11 = new Vector2(startPos.x - headLen * Math.cos(angle1 - Math.PI / 6), startPos.y - headLen * Math.sin(angle1 - Math.PI / 6));
                let v12 = new Vector2(startPos.x - headLen * Math.cos(angle1 + Math.PI / 6), startPos.y - headLen * Math.sin(angle1 + Math.PI / 6));
                let v13 = new Vector2(startPos.x, startPos.y);

                // left
                const prevPoint2 = bezierCubic(startPos, endPos, c0, c1, 0.95);
                const angle2 = Math.atan2(endPos.y - prevPoint2.y, endPos.x - prevPoint2.x);
                let v21 = new Vector2(endPos.x - headLen * Math.cos(angle2 - Math.PI / 6), endPos.y - headLen * Math.sin(angle2 - Math.PI / 6));
                let v22 = new Vector2(endPos.x - headLen * Math.cos(angle2 + Math.PI / 6), endPos.y - headLen * Math.sin(angle2 + Math.PI / 6));
                let v23 = new Vector2(endPos.x, endPos.y);

                return <>
                    <polygon points={`${v21.x},${v21.y} ${v22.x},${v22.y} ${v23.x},${v23.y}`} fill="#999" stroke="transparent" strokeWidth={0} />
                    <polygon points={`${v11.x},${v11.y} ${v12.x},${v12.y} ${v13.x},${v13.y}`} fill="#999" stroke="transparent" strokeWidth={0} />
                </>
            }
            case "None":
                return <></>
        }
    }

    return <>


        <p>{JSON.stringify(engine.selectedWire.val)}</p>
        <p>{wire.uuid}</p>
        <g
            className={engine.selectedWire.val?.uuid == wire.uuid ? "wire-selected" : ""}
        >

            <OrthognalPathRenderer node1={wire.node1Ptr.val} node2={wire.node2Ptr.val} />

            <path
                className="bezier-curve"
                d={path}
                // stroke="#999"
                stroke="transparent"

                strokeWidth={2}
            />
            {/* <Arrow /> */}

            <path d={path}
                stroke="transparent"
                strokeWidth={8}
                onMouseDown={onMouseDown}
            />
            {
                // debug lines
                // lines.map((line) => {
                //     return <line key={line.start.pos.x} x1={line.start.pos.x} y1={line.start.pos.y} x2={line.end.pos.x} y2={line.end.pos.y} stroke="black" strokeWidth={4} fill="transparent" />
                // })
            }





        </g></>
}
type ArrowDir = "Left" | "Right" | "Both" | "None";
class Wire {
    // proxies
    arrowDir: Pointer<ArrowDir>;
    curvature: Pointer<number>;


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
    }

    renderElem(): JSX.Element {
        return <Line wire={this} />
    }
}




export type { ArrowDir };
export default Wire;