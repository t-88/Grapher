
import "./Canvas.css";
import { Fragment } from "react/jsx-runtime";
import { engine } from "./lib/core/engine";
import { useSnapshot } from "valtio";
import { useEffect, useRef } from "react";
import { Canvas_Size } from "./lib/core/consts";




function Canvas() {
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        engine.onLoad(ref.current!);
    },[]);

    return <div id='sketch-canvas'>
        <div
            id='canvas'
            ref={ref}
            onLoad={() => console.log("UR MOM")}
            onMouseDown={() => engine.onMouseDown()}
            onMouseUp={() => engine.onMouseUp()}
            onDrag={() => engine.onMouseDrag()}
        >

            {engine.nodes.map((node) => {
                return node.renderElem();
            })}

            <svg width={Canvas_Size.w} height={Canvas_Size.h}>
                <WiresRenderer />
                {engine.curWire.renderElem()}
            </svg>

        </div>
    </div>
}


function WiresRenderer() {
    const wireElemsSnap = useSnapshot(engine.wiresElems);
    return wireElemsSnap.map((wire) => {
        return <Fragment key={JSON.stringify(wire)}> {wire.renderElem()} </Fragment>;
    });
}


export default Canvas;