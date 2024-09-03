import camera from "./camera";
import { engine } from "./engine";
import { Vector2, type Pointer } from "./math";
import mouse from "./mouse";
import { Pin } from "./node";
import renderer from "./render";

class Wire {
    uuid : string; 
    startPin: Pointer<Pin>;
    endPin: Pointer<Pin>;
    hoverd : boolean = false;
    constructor() {
        this.startPin = { val: new Pin()};
        this.endPin = { val: new Pin()};
        this.uuid = crypto.randomUUID();
    }

    onMouseDown() {
        if(this.hoverd) engine.selectedWire = this;  
    }

    update() {
        let len1 = mouse.pos.sub(this.startPin.val.pos).length();
        let len2 = mouse.pos.sub(this.endPin.val.pos).length();
        let len = this.startPin.val.pos.sub(this.endPin.val.pos).length();
        if(Math.abs(len - (len1 + len2)) < 1) {
            this.hoverd = true;
        } else {
            this.hoverd = false;
        }
    }

    draw()  {
        let startVec = camera.toWorldSpace(new Vector2(this.startPin.val.pos.x,this.startPin.val.pos.y));
        let endVec =  camera.toWorldSpace(new Vector2(this.endPin.val.pos.x,this.endPin.val.pos.y));
        if(this.hoverd || engine.selectedWire == this) {
            renderer.drawVector(startVec.x, startVec.y, endVec.x, endVec.y, "blue");
        } else {
            renderer.drawVector(startVec.x, startVec.y, endVec.x, endVec.y, "yellow");
        }

        
    }
}


export default Wire;