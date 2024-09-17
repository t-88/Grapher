import { useSnapshot } from "valtio";
import NumberInput from "../../comps/NumberInput";
import TextAreaInput from "../../comps/TextInputArea";
import { engine } from "../../lib/core/engine";

function NodeEditor() {
    if (engine.selectedNode.val == null) return <></>;
    return <>
        <div className='node-text-container edit-area'>
            <h4>Text</h4>
            <TextAreaInput
                watch={engine.selectedNode.val}
                watchValue={() => engine.selectedNode.val!.text.val}
                onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                    engine.selectedNode.val!.text.val = evt.target.value;
                }} />
        </div>
        <div className='node-padding-container edit-area'>
            <h4>Padding</h4>
            <div className='input-boxes'>
                <NumberInput
                    watch={engine.selectedNode.val.padding}
                    watchValue={() => engine.selectedNode.val!.padding.left.toString()}
                    lable='left'
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                        engine.selectedNode.val!.padding.left = Number.parseInt(evt.target.value) ?? engine.selectedNode.val!.padding.left;
                    }}
                />
                <NumberInput
                    lable='right'
                    watch={engine.selectedNode.val.padding}
                    watchValue={() => engine.selectedNode.val!.padding.right.toString()}
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                        engine.selectedNode.val!.padding.right = Number.parseInt(evt.target.value) ?? engine.selectedNode.val!.padding.right;
                    }}
                />
                <NumberInput lable='top'
                    watch={engine.selectedNode.val.padding}
                    watchValue={() => engine.selectedNode.val!.padding.top.toString()}
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                        engine.selectedNode.val!.padding.top = Number.parseInt(evt.target.value) ?? engine.selectedNode.val!.padding.top;
                    }}
                />
                <NumberInput lable='bottom'

                    watch={engine.selectedNode.val.padding}
                    watchValue={() => engine.selectedNode.val!.padding.bottom.toString()}
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                        engine.selectedNode.val!.padding.bottom = Number.parseInt(evt.target.value) ?? engine.selectedNode.val!.padding.bottom;
                    }}
                />
            </div>
        </div>

        <div className="node-size edit-area">
            <h4>Size</h4>
            <NumberInput
                watch={engine.selectedNode.val.max_width}
                watchValue={() => engine.selectedNode.val!.max_width.val.toString()}
                lable='width'
                onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                    engine.selectedNode.val!.max_width.val = Number.parseInt(evt.target.value) ?? engine.selectedNode.val!.max_width.val;
                }}
            />
        </div>

        <NodePinEditor />
    </>
}
function NodePinEditor() {
    const pinsSnap = useSnapshot(engine.selectedNode);



    return <div className="node-pins-container edit-area">
        <h4>Pins</h4>
        <div className="node-pins">
            <span className={`pin top-pin ${engine.selectedNode.val?.pins.Top ? "pin-selected" : ""}`}
                onClick={() => engine.selectedNode.val!.pins.Top = !engine.selectedNode.val!.pins.Top}
            />
            <span className={`pin bottom-pin ${engine.selectedNode.val?.pins.Bottom ? "pin-selected" : ""}`}
                onClick={() => engine.selectedNode.val!.pins.Bottom = !engine.selectedNode.val!.pins.Bottom}
            />
            <span className={`pin left-pin ${engine.selectedNode.val?.pins.Left ? "pin-selected" : ""}`}
                onClick={() => engine.selectedNode.val!.pins.Left = !engine.selectedNode.val!.pins.Left}
            />
            <span className={`pin right-pin ${engine.selectedNode.val?.pins.Right ? "pin-selected" : ""}`}
                onClick={() => engine.selectedNode.val!.pins.Right = !engine.selectedNode.val!.pins.Right}
            />
        </div>
    </div>;
}

export default NodeEditor;