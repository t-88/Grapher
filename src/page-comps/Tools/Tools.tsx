import { engine } from "../../lib/core/engine";
import "./Tools.css";

function Tools() {
    return <div id='tools'>
        <center id='logo'><h3>Grapher</h3></center>
        <button onClick={() => engine.addNode()}>Add Node</button>
    
    </div>
}

export default Tools;