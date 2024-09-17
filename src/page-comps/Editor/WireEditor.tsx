import { useSnapshot } from "valtio";
import type { ArrowDir } from "../../lib/elems/wire";
import { engine } from "../../lib/core/engine";
import DropDownMenu from "../../comps/DropDownMenu/DropDownMenu";
import NumberInput from "../../comps/NumberInput";

function WireEditor() {
  const snap = useSnapshot(engine.selectedWire);
  if (engine.selectedWire.val == null) { return <></>; }

  function onSelect(dir: ArrowDir) {
    engine.selectedWire.val!.arrowDir.val = dir;
  }


  return <>
    <div className='edit-area'>
      <h4>Arrow</h4>
      <DropDownMenu onSelect={(val: ArrowDir) => onSelect(val)} watch={snap.val?.arrowDir} watchValue={() => { return ["Left", "Right", "Both", "None"].indexOf(snap.val?.arrowDir.val ?? "Left") }} defaultIdx={["Left", "Right", "Both", "None"].indexOf(snap.val?.arrowDir.val ?? "Left")} values={["Left", "Right", "Both", "None"]}>
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
      <NumberInput
        min={0}
        max={100}
        watch={snap.val!.uuid}
        watchValue={() => engine.selectedWire.val!.curvature.val.toString()}
        lable='value'
        onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
          engine.selectedWire.val!.curvature.val = Number.parseInt(evt.target.value) ?? engine.selectedWire.val!.curvature.val;
        }}
      />

    </div>
    {/* <div className='edit-area'> */}
    {/* <h4>Wire Type</h4> */}
    {/* </div> */}
  </>
}



export default WireEditor;