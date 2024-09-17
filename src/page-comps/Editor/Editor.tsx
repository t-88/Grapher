
import "./Editor.css";
import { useSnapshot } from "valtio";
import { engine } from "../../lib/core/engine";
import WireEditor from "./WireEditor";
import NodeEditor from "./NodeEditor";

function Editor() {
  useSnapshot(engine.seletedElem);
  return <div id='editor'>
    {
      engine.seletedElem.val == "Node" ? <NodeEditor /> : <WireEditor />
    }
  </div>
}



export default Editor;