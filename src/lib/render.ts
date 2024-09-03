import p5Types from "p5";

class Renderer {
  static #instance: Renderer;
  p5! : p5Types;

  constructor() {

  }


  public static get instance(): Renderer {
    if (!Renderer.#instance) {
      Renderer.#instance = new Renderer();
    }
    return Renderer.#instance;
  }


  setP5(p5: p5Types) {
    this.p5 = p5;
  }

  drawLine(x0: number, y0: number, x1: number, y1: number, color: string) {
    this.p5.stroke(color);
    this.p5.strokeWeight(2);
    this.p5.line(x0,y0,x1,y1);
  }
  clearScreen(color: string) {
    this.p5.background(color);
  }
  drawRect(x: number, y: number, w: number, h: number, color: string) {
    this.p5.fill(color);
    this.p5.noStroke();
    this.p5.rect(x,y,w,h)
  }
  drawRectOutline(x: number, y: number, w: number, h: number, color: string) {
    this.p5.stroke(color);
    this.p5.strokeWeight(2);
    this.p5.noFill();
    this.p5.rect(x,y,w,h)
  }

  drawCircle(x: number, y: number, r: number, color: string) {
    this.p5.fill(color);
    this.p5.noStroke();
    this.p5.circle(x,y,r);
  }

  drawCircleOutline(x: number, y: number, r: number, color: string) {
    this.p5.strokeWeight(4);
    this.p5.stroke(color);
    this.p5.noFill();
    this.p5.circle(x,y,r);
  }


  drawVector(x0: number, y0: number, x1: number, y1: number, color: string) {
    const headlen = 20;
    const angle = Math.atan2(y1 - y0, x1 - x0);

    this.drawLine(x0,y0,x1 - (headlen - 2) * Math.cos(angle),y1 - (headlen - 2) * Math.sin(angle),color);

    this.drawLine(x1,y1,x1 - headlen * Math.cos(angle - Math.PI / 7), y1 - headlen * Math.sin(angle - Math.PI / 7),color);
    this.drawLine(x1,y1,x1 - headlen * Math.cos(angle + Math.PI / 7), y1 - headlen * Math.sin(angle + Math.PI / 7),color);
    this.drawLine(x1 - headlen * Math.cos(angle + Math.PI / 7), y1 - headlen * Math.sin(angle + Math.PI / 7),x1 - headlen * Math.cos(angle - Math.PI / 7), y1 - headlen * Math.sin(angle - Math.PI / 7),color);


  }

}


const renderer = Renderer.instance;
export default renderer;