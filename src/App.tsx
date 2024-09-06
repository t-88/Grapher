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
    engine.setSelectedNode = (nodePtr: Pointer<Node>) => setSelectedNode(nodePtr);
    engine.setup(p5, elem);
  }
  return (
    <>
      <div id='tools'>
        <button onClick={() => engine.addINode()}>Input Node</button>
        <button onClick={() => engine.addONode()}>Output Node</button>
      </div>
      <div id='sketch-canvas'>
        <Sketch setup={(p5: p5Types, elem: Element) => setup(p5, elem)}
          draw={() => engine.draw()}
          mouseMoved={() => engine.onMouseMove()}
          mousePressed={() => engine.onMouseDown()}
          mouseReleased={() => engine.onMouseUp()}
          mouseDragged={() => engine.onMouseDrag()}
          keyPressed={() => engine.onKeyDown()}
        />
      </div>

      <div id='editor'>
        {
          selectedNode ?
            <>
              <input type="text" placeholder='text' defaultValue={selectedNode.val.orig_text}
                onChange={(evt) => {
                  if (selectedNode) {
                    selectedNode.val.orig_text = evt.target.value ?? "";
                  }
                }} />

              <input type="number" 
                     placeholder='padding-left' 
                     defaultValue={selectedNode.val.papddingProx.left}
                     onChange={(evt) => {
                      selectedNode.val.papddingProx.left =  Number.parseInt(evt.target.value) ?? selectedNode.val.padding.left;
                    }}
                     />

<input type="number" 
                     placeholder='padding-right' 
                     defaultValue={selectedNode.val.papddingProx.right}
                     onChange={(evt) => {
                      selectedNode.val.papddingProx.right =  Number.parseInt(evt.target.value) ?? selectedNode.val.padding.right;
                    }}
                     />   

<input type="number" 
                     placeholder='padding-top' 
                     defaultValue={selectedNode.val.papddingProx.top}
                     onChange={(evt) => {
                      selectedNode.val.papddingProx.top =  Number.parseInt(evt.target.value) ?? selectedNode.val.padding.top;
                    }}
                     />   
                                                            
                                                            <input type="number" 
                     placeholder='padding-bottom' 
                     defaultValue={selectedNode.val.papddingProx.bottom}
                     onChange={(evt) => {
                      selectedNode.val.papddingProx.bottom =  Number.parseInt(evt.target.value) ?? selectedNode.val.padding.bottom;
                    }}
                     />   
            </>
            :
            <div></div>
        }


      </div>

    </>
  );
}

export default App;
