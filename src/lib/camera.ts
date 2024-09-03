import p5Types from "p5";
import { Vector2 } from "./math";

class Camera {
    static #instance : Camera;

    p5! : p5Types;
    offset : Vector2 = new Vector2(0, 0);
    zoom : number = 1; 

    constructor() {
    }

    
    public static get instance() : Camera {
        if(!Camera.#instance) {
            Camera.#instance = new Camera();
        }
        return Camera.#instance;
    }
    

    draw() {
    }


    setP5(p5: p5Types) {
        this.p5 = p5;
      }

    setZoom(z : number) {
        if(z > 1.7) {
            z = 1.7;
        } else if(z < 0.8) {
            z = 0.8;
        }
        this.zoom = z;
    }
    setOffsetX(x : number) {
      this.offset.x = x;
    }
    setOffsetY(y : number) {
        this.offset.y = y;
      }
  
    
    begin() {
        this.p5.push();
        this.p5.scale(this.zoom,this.zoom);
        this.p5.translate(this.offset.x,this.offset.y);
    }

    end() {
        this.p5.pop();
    }


    toWorldSpace(vec : Vector2) : Vector2 {
        return   new Vector2((vec.x + this.offset.x) * this.zoom, (vec.y + this.offset.y) * this.zoom);

    }
    toScreenSpace(vec : Vector2) : Vector2 {
        return  new Vector2(vec.x / this.zoom - this.offset.x , vec.y / this.zoom - this.offset.y);
    }


}


const camera = Camera.instance;

export default camera;


