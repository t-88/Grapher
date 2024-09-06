import './App.css';

import Sketch from "react-p5";
import p5Types from "p5";
import { engine, init_engine } from './lib/engine';
import { useEffect, useRef, useState } from 'react';
import type { Pointer } from './lib/math';
import type { Node } from './lib/node';


function InlineNumberInput({ watch, watchValue, lable, onChange }: { watch: object, watchValue: () => string, lable: string, onChange: Function }) {
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.value = watchValue();
    
    }
  
  }, [watch, ref]);
  return <div className='custom-input'>
    <div className='lable-container'>
      <label>{lable}</label>
    </div>
    <input ref={ref} type="number" placeholder='' onChange={(evt) => {

      if (evt.target.value.length == 0) {
        evt.target.value = "0";
      }
      if (parseInt(evt.target.value) < 0) {
        evt.target.value = "0";
      } else {
        evt.target.value = parseInt(evt.target.value).toString();
      }
      onChange(evt);
    }} />
  </div>
}

function TextAreaInput({ watch, watchValue, onChange }: { watch: object, watchValue: () => string, onChange: Function }) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.value = watchValue();
    }
  }, [watch, ref]);

  return <textarea ref={ref} onChange={(evt) => onChange(evt)} ></textarea>
}

function App() {
  const [selectedNode, setSelectedNode] = useState<Pointer<Node> | null>(null);
  function onSelectNode(ptr: Pointer<Node>) {
    setSelectedNode(ptr);
  }

  function setup(p5: p5Types, elem: Element) {
    init_engine();
    engine.setSelectedNode = (ptr: Pointer<Node>) => onSelectNode(ptr);
    engine.setup(p5, elem);
  }
  return (
    <>
      <div id='tools'>
        <center id='logo'><h3>Grapher</h3></center>
        <button onClick={() => engine.addINode()}>Input Node</button>
        <button onClick={() => engine.addONode()}>Output Node</button>
      </div>
      <div id='sketch-canvas'>
        {/* <div 
            id='canvas'
            onMouseMove={(evt) => engine.onMouseMove()}
            onMouseDown={(evt) => engine.onMouseDown()}
            onMouseUp={(evt) => engine.onMouseUp()}
            onKeyDown={(evt) => engine.onMouseUp()}
        >
        </div> */}
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
              <div className='node-text-container'>
                <h4>Text</h4>
                <TextAreaInput
                  watch={selectedNode}
                  watchValue={() => selectedNode.val.orig_text}
                  onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                    if (selectedNode) {
                      selectedNode.val.orig_text = evt.target.value ?? "";
                    }
                  }} />
              </div>

              <div className='node-padding-container'>
                <h4>Padding</h4>
                <div className='input-boxes'>
                  <InlineNumberInput
                    watch={selectedNode}
                    watchValue={() => selectedNode.val.papddingProx.left.toString()}
                    lable='left'
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                      selectedNode.val.papddingProx.left = Number.parseInt(evt.target.value) ?? selectedNode.val.padding.left;
                    }}
                  />
                  <InlineNumberInput
                    lable='right'
                    watch={selectedNode}
                    watchValue={() => selectedNode.val.papddingProx.right.toString()}
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                      selectedNode.val.papddingProx.right = Number.parseInt(evt.target.value) ?? selectedNode.val.padding.right;
                    }}
                  />
                  <InlineNumberInput lable='top'
                    watch={selectedNode}
                    watchValue={() => selectedNode.val.papddingProx.top.toString()}
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                      selectedNode.val.papddingProx.top = Number.parseInt(evt.target.value) ?? selectedNode.val.padding.top;
                    }}
                  />
                  <InlineNumberInput lable='bottom'

                    watch={selectedNode}
                    watchValue={() => selectedNode.val.papddingProx.bottom.toString()}
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                      selectedNode.val.papddingProx.bottom = Number.parseInt(evt.target.value) ?? selectedNode.val.padding.bottom;
                    }}
                  />
                </div>
              </div>
            </>

            : <></>

        }

      </div>

    </>
  );
}

export default App;
