import { Vector2, type Pointer } from "../libs/math";
import { bazierCurve, bezierCubic } from "../libs/utils";
import { Node } from "./node";
import { engine } from "../core/engine";
import { proxy, useSnapshot } from "valtio";
import type { PinDir } from "./pin";
import "./wire.css";



function Line({ wire }: { wire: Wire }) {
    useSnapshot(engine.selectedWire);

    let startPos = wire.node1Ptr.val.pinsPoses[wire.startDir];
    let endPos = wire.node2Ptr.val.pinsPoses[wire.endDir];
    startPos = new Vector2(startPos.x + 5, startPos.y);
    endPos = new Vector2(endPos.x + 5, endPos.y);

    let { path, c0, c1 } = bazierCurve(startPos, endPos, wire.startDir, wire.endDir,{curvature : wire.curvature.val / 100});



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

            <path
                className="bezier-curve"
                d={path}
                stroke="#999"
                strokeWidth={2}
            />

            <path d={path}
                stroke="transparent"
                strokeWidth={8}
                onMouseDown={onMouseDown}
            />
            {
                // debug lines
                // lines.map((line) => {
                //     return <line key={line.start.x} x1={line.start.x} y1={line.start.y} x2={line.end.x} y2={line.end.y} stroke="black" strokeWidth={4} fill="transparent" />
                // })
            }

            <Arrow />


        </g></>
}
type ArrowDir = "Left" | "Right" | "Both" | "None";
class Wire {
    // proxies
    arrowDir: Pointer<ArrowDir>;
    curvature : Pointer<number>;


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