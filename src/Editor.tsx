
import { useSnapshot } from "valtio";
import "./Editor.css";
import { engine } from "./lib/core/engine";
import TextAreaInput from "./comps/TextInputArea";
import NumberInput from "./comps/NumberInput";
import { Fragment, useEffect, useState, type ReactNode } from "react";
import type { ArrowDir } from "./lib/elems/wire";

function Editor() {
  useSnapshot(engine.seletedElem);
  return <div id='editor'>
    {
      engine.seletedElem.val == "Node" ? <NodeEditor /> : <WireEditor />
    }
  </div>
}

function WireEditor() {
  const snap = useSnapshot(engine.selectedWire);
  if (engine.selectedWire.val == null) { return <></>; }

  function onSelect(dir : ArrowDir) {
    engine.selectedWire.val!.arrowDir.val = dir; 
  }
  return <>
    <div className='edit-area'>
      <h4>Arrow</h4>
      <DropDownMenu onSelect={(val : ArrowDir) => onSelect(val)} watch={snap.val?.arrowDir} watchValue={() => {return ["Left","Right","Both","None"].indexOf(snap.val?.arrowDir.val ?? "Left")}} defaultIdx={["Left","Right","Both","None"].indexOf(snap.val?.arrowDir.val ?? "Left")} values={["Left","Right","Both","None"]}>
        <div className="dropdown-menu-item">
          <svg width={80} height={20}>
            <line x1={10} y1={10} x2={40} y2={10} stroke="#333" strokeWidth={1} fill="none" />
            <polygon points={`30,16 30,4 42,10`} fill="#444" />
          </svg>
          <p>left</p>
        </div>

        <div className="dropdown-menu-item">
          <svg width={80} height={20}>
            <line x1={10} y1={10} x2={40} y2={10} stroke="#333" strokeWidth={1} fill="none" />
            <polygon points={`20,16 20,4 8,10`} fill="#444" />
          </svg>
          <p>right</p>
        </div>

        <div className="dropdown-menu-item">
          <svg width={80} height={20}>
            <line x1={10} y1={10} x2={40} y2={10} stroke="#333" strokeWidth={1} fill="none" />
            <polygon points={`30,16 30,4 42,10`} fill="#444" />
            <polygon points={`20,16 20,4 8,10`} fill="#444" />
          </svg>
          <p>both</p>
        </div>

        <div className="dropdown-menu-item">
          <svg width={80} height={20}>
            <line x1={10} y1={10} x2={40} y2={10} stroke="#333" strokeWidth={1} fill="none" />
          </svg>
          <p>none</p>

        </div>

      </DropDownMenu>
    </div>
    <div className='edit-area'>
      <h4>Curvature</h4>
      {/* <NumberInput
        lable='curve'
        watch={0}
        watchValue={() => engine.selectedNode.val!.padding.right.toString()}
        onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
          engine.selectedNode.val!.padding.right = Number.parseInt(evt.target.value) ?? engine.selectedNode.val!.padding.right;
        }}
      /> */}
    </div>
    <div className='edit-area'>
      <h4>Wire Type</h4>


    </div>
  </>
}



function DropDownMenu({ children, onSelect,defaultIdx, watch,watchValue , values }: { children: Array<ReactNode>, values:  Array<any> , onSelect: (val : any) => void,defaultIdx? : number,watch : any,watchValue : () => any }) {
  const [shown, setShown] = useState(false);
  const [selectedChild, setSelectedChild] = useState(defaultIdx ?? 0);

  useEffect(() => {
    setSelectedChild(watchValue() as number);
  },[watch]); 

  function onToggle() {
    setShown(!shown);
  }
  function onFocusOut() {
    setSelectedChild(0);
  }

  function _onSelect(idx: number) {
    onSelect(values[idx]);
    setShown(false);
    setSelectedChild(idx);
  }

  return <div className="dropdown-menu"  >
    <button className="btn" onBlur={onFocusOut} onClick={onToggle}>
      <div>
      {
        children[selectedChild]
      }
      </div>
    </button>
    {
      shown ?
        <div className="dropdown-menu-container">
          {
            children.map((child, idx) => {
              return <div key={idx} onClick={() => _onSelect(idx)} >{child}</div>;
            })
          }

        </div> : <></>
    }
  </div>
}


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

export default Editor;