import { proxy } from "valtio";
import { Vector2, type Pointer } from "../libs/math";
import { Canvas_Size } from "./consts";

class Camera {
    static #instance : Camera;

    offset : Vector2;
    zoom :  Pointer<number>; 

    constructor() {
        this.offset = proxy(new Vector2(0,0));
        this.zoom = proxy({val : 1}); 

    }

    
    public static get instance() : Camera {
        if(!Camera.#instance) {
            Camera.#instance = new Camera();
        }
        return Camera.#instance;
    }
    

    draw() {
    }


    setZoom(z : number) {
        if(z > 1.7) {
            z = 1.7;
        } else if(z < 0.8) {
            z = 0.8;
        }
        this.zoom.val = z;
    }
    setOffsetX(x : number) {
        if(x < -Canvas_Size.x / 2+ 90) return;
        if(x > Canvas_Size.x / 2 - 90) return;
        this.offset.x = x;
    }
    setOffsetY(y : number) {
        if(y < -Canvas_Size.y / 2) return;
        if(y > Canvas_Size.y / 2 ) return;

        this.offset.y = y;
      }
  
    
    begin() {
    }

    end() {
    }


    toWorldSpace(vec : Vector2) : Vector2 {
        return   new Vector2((vec.x + this.offset.x) * this.zoom.val, (vec.y + this.offset.y) * this.zoom.val);

    }
    toScreenSpace(vec : Vector2) : Vector2 {
        return  new Vector2(vec.x / this.zoom.val - this.offset.x , vec.y / this.zoom.val - this.offset.y);
    }
    toScreenSpaceEE(vec : Vector2) : Vector2 {
        return  new Vector2(vec.x  - this.offset.x , vec.y  - this.offset.y);
    }

}


const camera = Camera.instance;

export default camera;


