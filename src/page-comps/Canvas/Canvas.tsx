
import "./Canvas.css";
import { Fragment } from "react/jsx-runtime";
import { engine } from "../../lib/core/engine";
import { useSnapshot } from "valtio";
import { useEffect, useRef } from "react";
import { Canvas_Size } from "../../lib/core/consts";
import { Vector2 } from "../../lib/libs/math";
import type EdgeInsets from "../../lib/types/EdgeInsets";
import camera from "../../lib/core/camera";




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
           <MiniMapElemsRenderer />
            <NodesRenderer />

            <svg width={Canvas_Size.w} height={Canvas_Size.h}>
                <WiresRenderer />
                {engine.curWire.renderElem()}
            </svg>

        </div>
    </div>
}

function MiniMapElemsRenderer() {
    useSnapshot(engine.nodes);
    useSnapshot(camera.offset);
    return  <div id="minimap">
        <div id="minimap-visible" style={{left : 45 - camera.offset.x / Canvas_Size.w * 110, top: 40 - camera.offset.y / Canvas_Size.h * 80}}>
       
        </div>
        {
        engine.nodes.map((node) => {
            return <div className="minimap-node" style={{left: 45 + (node.pos.x )  / Canvas_Size.w * 110,top: 40 + (node.pos.y ) / Canvas_Size.h * 80 }}></div>;
        })
    }     
</div>
}

function NodesRenderer() {
    const nodesSnap = useSnapshot(engine.nodes);
    return engine.nodes.map((node) => {
        return <Fragment key={node.uuid}> {node.renderElem()} </Fragment>
    });
}

function WiresRenderer() {
    useSnapshot(engine.wiresElems);
    return engine.wiresElems.map((wire) => {
        return <Fragment key={wire.uuid}> {wire.renderElem()} </Fragment>;
    });
}


export default Canvas;