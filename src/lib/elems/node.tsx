import "./node.css";

import { engine } from "../core/engine";

import EdgeInsets from "../types/EdgeInsets";
import mouse from "../core/mouse";
import type { Pin, PinDir } from "./pin";
import { Vector2, type Pointer } from "../libs/math";
import { proxy, subscribe, useSnapshot } from "valtio";
import { useEffect, useRef } from "react";



type NodeSelectAction = "Drop" | "Select";
interface PinsMap { Left: boolean, Right: boolean, Top: boolean, Bottom: boolean };
interface PinsPosesMap { Left: Vector2, Right: Vector2, Top: Vector2, Bottom: Vector2 };
class Node {
    // proxies
    pos: Vector2;
    size: Vector2;
    padding: EdgeInsets;
    text: Pointer<string>;
    max_width: Pointer<number>;
    pins: PinsMap;
    pinsPoses: PinsPosesMap;

    // uninited 

    // inited
    uuid: string = crypto.randomUUID();
    draging: boolean = false;



   
    constructor(x: number, y: number, w: number, h: number) {
        this.pos = proxy(new Vector2(x, y));
        this.size = proxy(new Vector2(w, h));
        this.padding = proxy(new EdgeInsets(8, 8, 8, 8));
        this.text = proxy({ val: "A" });
        this.max_width = proxy({ val: 100 });
        this.pins = proxy({ Bottom: true, Top: true, Left: true, Right: true });
        this.pinsPoses = proxy({ Bottom: new Vector2(0,0), Top: new Vector2(0,0), Left: new Vector2(0,0), Right: new Vector2(0,0) });
    }

    jsonDump() {
        return JSON.parse(JSON.stringify({
            uuid : this.uuid,
            text : this.text.val,
            pos : this.pos,
            size : this.size,
            max_width : this.max_width.val,
        padding : this.padding,
            pins:  JSON.parse(JSON.stringify(this.pins)),
            pinsPoses: {
                "Left": this.pinsPoses.Left.jsonDump(),
                "Right": this.pinsPoses.Right.jsonDump(),
                "Top": this.pinsPoses.Top.jsonDump(),
                "Bottom": this.pinsPoses.Bottom.jsonDump(),
            },
        }));
    }

    static jsonLoad(node : {[key : string] : any}) : Node {
        let out = new Node(0,0,0,0);
        out.uuid = node["uuid"];
        out.text.val = node["text"];
        out.pos.setVec(Vector2.jsonLoad(node["pos"]));
        out.size.setVec(Vector2.jsonLoad(node["size"]));
        out.max_width.val = node["max_width"];

        out.padding.bottom = node["padding"]["bottom"];
        out.padding.top = node["padding"]["top"];
        out.padding.left = node["padding"]["left"];
        out.padding.right = node["padding"]["right"];


        out.pinsPoses.Top.setVec(Vector2.jsonLoad(node["pinsPoses"]["Top"]));
        out.pinsPoses.Bottom.setVec(Vector2.jsonLoad(node["pinsPoses"]["Bottom"]));
        out.pinsPoses.Right.setVec(Vector2.jsonLoad(node["pinsPoses"]["Right"]));
        out.pinsPoses.Left.setVec(Vector2.jsonLoad(node["pinsPoses"]["Left"]));

        out.pins.Bottom = node["pins"]["Bottom"];
        out.pins.Top = node["pins"]["Top"];
        out.pins.Left = node["pins"]["Left"];
        out.pins.Right = node["pins"]["Right"];

        return out;
    }


    onNodeSelected(action : NodeSelectAction,dir : PinDir) {
        engine.onNodeSelected({ val: this }, action, dir);
    }
    onDrop() {
    }

    onMouseDown() {
        this.draging = true;
        mouse.offset = new Vector2(mouse.pos.x, mouse.pos.y).sub(this.pos);
        engine.onSelectNode(this);
    }

    renderElem(): JSX.Element {
        return <NodeElem node={this} />;
    }
}




function NodePins({ node }: { node: Node }) {
    function onMouseDown(evt: MouseEvent, dir: PinDir) {
        evt.stopPropagation();
        node.onNodeSelected("Select",dir);
    }
    function onMouseUp(evt: MouseEvent, dir: PinDir) {
        evt.stopPropagation();
        node.onNodeSelected("Drop",dir);
    }


    const refs_Left = useRef<HTMLSpanElement | null>(null);
    const refs_Right = useRef<HTMLSpanElement | null>(null);
    const refs_Top = useRef<HTMLSpanElement | null>(null);
    const refs_Bottom = useRef<HTMLSpanElement | null>(null);

    // TODO: improve
    useEffect(() => {
        if(engine.elem) {
            let offset  = engine.elem.getBoundingClientRect();
            node.pinsPoses.Left.set( refs_Left.current!.getBoundingClientRect().x - offset.x,refs_Left.current!.getBoundingClientRect().y - offset.y);
            node.pinsPoses.Right.set(refs_Right.current!.getBoundingClientRect().x - offset.x,refs_Right.current!.getBoundingClientRect().y - offset.y);
            node.pinsPoses.Top.set(  refs_Top.current!.getBoundingClientRect().x - offset.x,refs_Top.current!.getBoundingClientRect().y - offset.y);
            node.pinsPoses.Bottom.set(refs_Bottom.current!.getBoundingClientRect().x - offset.x,refs_Bottom.current!.getBoundingClientRect().y - offset.y);
        }
    },[refs_Left.current?.getBoundingClientRect(),refs_Right.current?.getBoundingClientRect(),refs_Top.current?.getBoundingClientRect(),refs_Bottom.current?.getBoundingClientRect()]);

    
    const pinsSnap = useSnapshot(node.pins);
    return <>
        <span
            ref={refs_Top}
            className={`pin-elem top-pin ${!pinsSnap.Top ? "disabled-pin-elem" : ""}`}
            onClick={() => engine.selectedNode.val!.pins.Top = !engine.selectedNode.val!.pins.Top}
            onMouseDown={(evt) => onMouseDown(evt.nativeEvent, "Top")}
            onMouseUp={(evt) => onMouseUp(evt.nativeEvent, "Top")}
/>
        <span
            ref={refs_Bottom}
            className={`pin-elem bottom-pin ${!pinsSnap.Bottom ? "disabled-pin-elem" : ""}`}
            onClick={() => engine.selectedNode.val!.pins.Bottom = !engine.selectedNode.val!.pins.Bottom}
            onMouseDown={(evt) => onMouseDown(evt.nativeEvent, "Bottom")}
            onMouseUp={(evt) => onMouseUp(evt.nativeEvent, "Bottom")}
/>
        <span
            ref={refs_Left}
            className={`pin-elem left-pin ${!pinsSnap.Left ? "disabled-pin-elem" : ""}`}
            onClick={() => engine.selectedNode.val!.pins.Left = !engine.selectedNode.val!.pins.Left}
            onMouseDown={(evt) => onMouseDown(evt.nativeEvent, "Left")}
            onMouseUp={(evt) => onMouseUp(evt.nativeEvent, "Left")}
/>
        <span
            ref={refs_Right}
            className={`pin-elem right-pin ${!pinsSnap.Right ? "disabled-pin-elem" : ""}`}
            onClick={() => engine.selectedNode.val!.pins.Right = !engine.selectedNode.val!.pins.Right}
            onMouseDown={(evt) => onMouseDown(evt.nativeEvent, "Right")}
            onMouseUp={(evt) => onMouseUp(evt.nativeEvent, "Right")}
/>
    </>
}

function NodeElem({ node }: { node: Node }): JSX.Element {
    const ref = useRef<HTMLDivElement>(null);
    const posSnap = useSnapshot(node.pos);
    const textSnap = useSnapshot(node.text);
    const maxWidthSnap = useSnapshot(node.max_width);
    useSnapshot(engine.selectedNode);

    useEffect(() => {
        if(!ref.current) return;
        node.size.y = ref.current.getBoundingClientRect().height;
    },[textSnap]);


    const node_style: React.CSSProperties = {
        left: `${posSnap.x}px`, top: `${posSnap.y}px`,
        width: `${maxWidthSnap.val}px`

    };
    const content_style: React.CSSProperties = {
        padding: `${node.padding.top}px ${node.padding.left}px ${node.padding.bottom}px ${node.padding.right}px`,
    }

    return <div className={`node-elem ${engine.selectedNode.val?.uuid == node.uuid ? "node-elem-selected" : ""}`} style={node_style}
                ref={ref}
    >
        <div className="content-elem" style={content_style}
            onMouseDown={(evt) => { node.onMouseDown(); }}
        >
            <div>
            {
                textSnap.val.split("\n").map((text, idx) => {
                    if (text.length == 0) {
                        return <br key={idx} />
                    }
                    return <p key={idx}> {text}</p>
                })
            }

            </div>
        </div>

        <NodePins node={node} />
    </div>
}


export { Node, type NodeSelectAction };
