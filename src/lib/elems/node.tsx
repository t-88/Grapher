import "./node.css";

import { proxy, useSnapshot } from "valtio";
import camera from "../core/camera";
import { engine } from "../core/engine";

import { useEffect, useRef } from "react";
import EdgeInsets from "../types/EdgeInsets";
import { Vector2 } from "../libs/math";
import mouse from "../core/mouse";
import type { Pin, PinDir } from "./pin";



type NodeSelectAction = "Drop" | "Select";

class Node {
    // proxies
    pos: Vector2;
    size: Vector2;
    padding: EdgeInsets;
    

    // inited
    uuid: string = crypto.randomUUID();
    draging: boolean = false;
    pins : Map<PinDir,Pin> = new Map();


    constructor(x: number, y: number, w: number, h: number) {
        this.pos = proxy(new Vector2(x, y));
        this.size = proxy(new Vector2(w, h));
        this.padding = proxy(new EdgeInsets(16, 16, 16, 16));
    }

    onSelect() {
        engine.onNodeSelected({ val: this }, "Select",this.pins.get("Bottom")!);
    }
    onDrop() {
        engine.onNodeSelected({ val: this }, "Drop",this.pins.get("Top")!);
    }

    onMouseDown() {
        this.draging = true;
        mouse.offset = new Vector2(mouse.pos.x, mouse.pos.y).sub(camera.toWorldSpace(this.pos))
        engine.selectedNode.val = this;
    }

    renderElem(): JSX.Element {
        return <></>;
        // return <NodeElem key={this.pin.uuid} node={this} />
    }
}





function NodeElem({ node }: { node: Node }) : JSX.Element {
    const posSnap = useSnapshot(node.pos);
    const container_style: React.CSSProperties = {
        position: "absolute",
        left: `${posSnap.x}px`, top: `${posSnap.y}px`,
    };
    const node_style: React.CSSProperties = {
        position: "absolute",
        padding: `${node.padding.top}px ${node.padding.left}px ${node.padding.bottom}px ${node.padding.right}px`,
        background: "white",
        outline: "solid 1px #CCCCCC",
        borderRadius: "4px",
    };
    const pin_style: React.CSSProperties = {
        position: "absolute",
        left: `0px`, bottom: `0px`,
        width: `${15}px`, height: `${15}px`,
        background: "#333333",
        borderRadius: "100%",
    };


    const ref = useRef(null);
    useEffect(() => {

    }, [ref]);

    return <div style={container_style} ref={ref}>
        <div className="pin-elem" style={pin_style}
            onMouseDown={() => node.onSelect()}
            onMouseUp={() => node.onDrop()}
        >

        </div>
        <div className="rect-elem" style={node_style} onMouseDown={() => node.onMouseDown()}>
            <p>asdasd</p>
        </div>
    </div>
}


export { Node ,type NodeSelectAction};
