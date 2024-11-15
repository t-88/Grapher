import { useSnapshot } from "valtio";
import type { ArrowDir, CurveType } from "../../lib/elems/wire/Wire";
import { engine } from "../../lib/core/engine";
import DropDownMenu from "../../comps/DropDownMenu/DropDownMenu";
import NumberInput from "../../comps/NumberInput";
import type { Pointer } from "../../lib/libs/math";
import type Wire from "../../lib/elems/wire/Wire";

function WireEditor() {
  const snap = useSnapshot(engine.selectedWire);
  if (engine.selectedWire.val == null) { return <></>; }

  function onSelect(dir: ArrowDir) {
    engine.selectedWire.val!.arrowDir.val = dir;
  }

  function onSelectCurve(type: CurveType) {
    engine.selectedWire.val!.curveType.val = type;
  }


  function PerTypeOptions() {
    switch (snap.val?.curveType.val) {
      case "Bezier": return <BezierOptions snap={snap} />;
      default: return <OrthogonalOptions snap={snap} />;
    }
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
      <h4>Curve Type</h4>
      <DropDownMenu onSelect={(val: CurveType) => onSelectCurve(val)} watch={snap.val?.curveType} 
                    watchValue={() => { return ["Bezier", "Orthognal", "Line"].indexOf(snap.val?.curveType.val ?? "Bezier") }} 
                    defaultIdx={["Bezier", "Orthognal", "Line"].indexOf(snap.val?.curveType.val ?? "Bezier")} 
                    values={["Bezier", "Orthognal", "Line"]}>
        <div className="dropdown-menu-item">
          <p style={{padding: "5px"}}>Bezier</p>
        </div>
        <div className="dropdown-menu-item">
          <p style={{padding: "5px"}}>Orthognal</p>
        </div>
        <div className="dropdown-menu-item">
          <p style={{padding: "5px"}}>Line</p>
        </div>
      </DropDownMenu>
    </div>
    
    <PerTypeOptions />

  </>
}

function BezierOptions({snap} : { snap : Pointer<Wire | null>}) {
  return <>
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
  </>
}



function OrthogonalOptions({snap} : { snap : Pointer<Wire | null>}) {
  return <>
   <div className='edit-area'>
      <b>(add option...)</b>
    </div>
  </>
}




export default WireEditor;