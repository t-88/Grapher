import './App.css';

import Sketch from "react-p5";
import p5Types from "p5";
import { engine, init_engine } from './lib/engine';
import { useState } from 'react';
import type { Pointer } from './lib/math';
import type { Node } from './lib/node';


function App() {
  const [selectedNode, setSelectedNode] = useState<Pointer<Node> | null>(null);
  function setup(p5: p5Types, elem: Element) {
    init_engine();
    engine.setSelectedNode = (nodePtr : Pointer<Node>) => setSelectedNode(nodePtr);
    engine.setup(p5, elem);
  }
  return (
    <>
      <div id='tools'>
        <button onClick={() => engine.addINode()}>Input Node</button>
        <button onClick={() => engine.addONode()}>Output Node</button>
      </div>
      <div id='sketch-canvas'>
      <Sketch setup = {(p5: p5Types, elem: Element) => setup(p5, elem)} 
              draw = {() => engine.draw()} 
              mouseMoved={() => engine.onMouseMove()}
              mousePressed={() => engine.onMouseDown()}
              mouseReleased={() => engine.onMouseUp()}
              mouseDragged={() => engine.onMouseDrag()}
              keyPressed={() => engine.onKeyDown()}
              />
      </div>
      <div id='editor'>
        {
          selectedNode ? <input type="text" placeholder='text' id="" defaultValue={selectedNode.val.orig_text} 
          onChange={(evt) => {
            if(selectedNode) {
              selectedNode.val.orig_text = evt.target.value ?? "";
            }
          }}/> 
          : 
          <div></div>
        }
      </div>

    </>
  );
}

export default App;
