import camera from "./camera";
import { engine } from "./engine";
import {  type Pointer } from "./math";
import mouse from "./mouse";
import { Pin, PIN_radius } from "./node";
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
        if(mouse.draging) return;
        let len1 = mouse.pos.sub(camera.toWorldSpace(this.startPin.val.pos)).length();
        let len2 = mouse.pos.sub(camera.toWorldSpace(this.endPin.val.pos)).length();
        let len =  camera.toWorldSpace(this.startPin.val.pos.sub(this.endPin.val.pos)).length();
        if(Math.abs(len - (len1 + len2)) < 1) {
            this.hoverd = true;
        } else {
            this.hoverd = false;
        }
    }

    draw()  {
        if(this.hoverd) {
            renderer.drawVector(this.startPin.val.pos.x + PIN_radius/2, this.startPin.val.pos.y+ PIN_radius/2, this.endPin.val.pos.x+ PIN_radius/2 , this.endPin.val.pos.y - this.endPin.val.render_wire_offset.y , "blue",{stoke: 2});
        } else {
            renderer.drawVector(this.startPin.val.pos.x+ PIN_radius/2, this.startPin.val.pos.y+ PIN_radius/2, this.endPin.val.pos.x+ PIN_radius/2, this.endPin.val.pos.y- this.endPin.val.render_wire_offset.y, "yellow",{stoke: 2});
        }

        
    }
}


export default Wire;