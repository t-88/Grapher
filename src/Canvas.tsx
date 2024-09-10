
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
    }, []);

    return <div id='sketch-canvas'>
        <div
            id='canvas'
            ref={ref}
            onMouseDown={(evt) => engine.onMouseDown(evt.nativeEvent)}
            onMouseUp={(evt) => engine.onMouseUp(evt.nativeEvent)}
        >

            <NodesRenderer />

            <svg width={Canvas_Size.w} height={Canvas_Size.h}>
                <WiresRenderer />
                {engine.curWire.renderElem()}
            </svg>

        </div>
    </div>
}

function NodesRenderer() {
    const nodesSnap = useSnapshot(engine.nodes);
    return engine.nodes.map((node) => {
        return <Fragment key={node.uuid}> {node.renderElem()} </Fragment>
    });
}

function WiresRenderer() {
    const wireElemsSnap = useSnapshot(engine.wiresElems);
    /* @ts-ignore */
    return wireElemsSnap.map((wire) => {
        return <Fragment key={wire.uuid}> {wire.renderElem()} </Fragment>;
    });
}


export default Canvas;