import './App.css';

import Sketch from "react-p5";
import p5Types from "p5";
import { engine, init_engine } from './lib/engine';


function App() {
  function setup(p5: p5Types, elem: Element) {
    init_engine();
    engine.setup(p5, elem);
  }
  return (
    <>
      <div id='tools'>

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

    </>
  );
}

export default App;
