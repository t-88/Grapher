import './App.css';

import { engine } from './lib/engine';
import { Fragment, useEffect, useRef, useState } from 'react';
import type { Pointer } from './lib/math';
import type { Node } from './lib/node';
import { useSnapshot } from 'valtio';


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

  const ref = useRef<HTMLDivElement | null>(null);

  const wireElemsSnap = useSnapshot(engine.wiresElems);


  return (
    <>
      <div id='tools'>
        <center id='logo'><h3>Grapher</h3></center>
        <button onClick={() => engine.addINode()}>Input Node</button>
        <button onClick={() => engine.addONode()}>Output Node</button>
      </div>
      <div id='sketch-canvas'>
        <div
          ref={ref}
          id='canvas'
          onMouseMove={(evt: React.MouseEvent) => engine.onMouseMove(evt, ref.current!)}
          onMouseDown={() => engine.onMouseDown()}
          onMouseUp={() => engine.onMouseUp()}
          onDrag={() => engine.onMouseDrag()}
        >
          {
            engine.nodes.map((node) => {
              return node.renderElem();
            })
          }

          <svg width="1200" height="1200">
            {
              wireElemsSnap.map((wire) => {
                return <Fragment key={JSON.stringify(wire)}> {wire.renderElem()} </Fragment>;
              })
              
            }

            {
              engine.curWire.renderElem()
            }

          </svg>
          
        </div>
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
