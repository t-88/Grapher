import { useSnapshot } from "valtio";
import { engine } from "../../core/engine";
import { Vector2 } from "../../libs/math";
import { bazierCurve, bezierCubic } from "../../libs/utils";
import type { Node } from "../node";
import type Wire from "./Wire";



export default function BezierPathRenderer({ node1, node2, wire, onMouseDown }: { node1: Node, node2: Node, wire: Wire, onMouseDown: () => void }) {
    useSnapshot(engine.selectedWire);

    let startPos = node1.pinsPoses[wire.startDir];
    let endPos = node2.pinsPoses[wire.endDir];
    startPos = new Vector2(startPos.x + 5, startPos.y);
    endPos = new Vector2(endPos.x + 5, endPos.y);
    let { path, c0, c1 } = bazierCurve(startPos, endPos, wire.startDir, wire.endDir, { curvature: wire.curvature.val / 100 });

    return <>

        <p>{JSON.stringify(engine.selectedWire.val)}</p>
        <p>{wire.uuid}</p>
        <g className={engine.selectedWire.val?.uuid == wire.uuid ? "wire-selected" : ""}>
            <Arrow wire={wire} c0={c0} c1={c1} startPos={startPos} endPos={endPos} />
            <path
                className="curve"
                d={path}
                stroke="#999"
                fill="none"

                strokeWidth={2}
            />

            <path d={path}
            className="hidden-path"
                stroke="transparent"
                strokeWidth={8}
                onMouseDown={onMouseDown}
            />
        </g></>
}



function Arrow({ wire, c0, c1, startPos, endPos }: { wire: Wire, c0: Vector2, c1: Vector2, startPos: Vector2, endPos: Vector2 }) {
    // arrow head logic
    const headLen = 14;
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