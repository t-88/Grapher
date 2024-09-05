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


  clearScreen(color: string) {
    this.p5.background(color);
  }


  textWidth(str : string, size : number) : number {
    let tmp = this.p5.textSize();
    this.p5.textSize(size);
    let width = this.p5.textWidth(str);
    this.p5.textSize(tmp);
    return width;
  }

  

  drawText(text : string,size : number,x : number,y : number, color : string, props? : {width? : number, height? : number}) {
    this.p5.fill(color);
    let tmp = this.p5.textSize()
    this.p5.textSize(size);
    this.p5.text(text,x,y,props?.width,props?.height);
    this.p5.textSize(tmp);
  }

  drawRect(x: number, y: number, w: number, h: number, color: string,params? : {stoke? : number, radius? :number}) {
    this.p5.fill(color);
    this.p5.noStroke();
    this.p5.rect(x,y,w,h,params?.radius ?? 0)
  }
  drawRectOutline(x: number, y: number, w: number, h: number, color: string,params? : {stoke? : number, radius? : number}) {
    this.p5.stroke(color);
    
    this.p5.strokeWeight(params?.stoke ?? 2);
    this.p5.noFill();
    this.p5.rect(x,y,w,h,params?.radius)
  }

  drawCircle(x: number, y: number, r: number, color: string) {
    this.p5.fill(color);
    this.p5.noStroke();
    this.p5.circle(x,y,r);
  }

  drawCircleOutline(x: number, y: number, r: number, color: string,params? : {stoke? : number}) {
    this.p5.strokeWeight(params?.stoke ?? 1);
    this.p5.stroke(color);
    this.p5.noFill();
    this.p5.circle(x,y,r);
  }


  drawLine(x0: number, y0: number, x1: number, y1: number, color: string,params? : {stoke? : number}) {
    this.p5.stroke(color);
    this.p5.strokeWeight(params?.stoke ?? 1);
    this.p5.line(x0,y0,x1,y1);
  }

  drawVector(x0: number, y0: number, x1: number, y1: number, color: string ,params? : {stoke? : number}) {
    const headlen = 20;
    const angle = Math.atan2(y1 - y0, x1 - x0);

    this.drawLine(x0,y0,x1 - (headlen - 2) * Math.cos(angle),y1 - (headlen - 2) * Math.sin(angle),color,params);
    this.drawLine(x1,y1,x1 - headlen * Math.cos(angle - Math.PI / 7), y1 - headlen * Math.sin(angle - Math.PI / 7),color,params);
    this.drawLine(x1,y1,x1 - headlen * Math.cos(angle + Math.PI / 7), y1 - headlen * Math.sin(angle + Math.PI / 7),color,params);
    this.drawLine(x1 - headlen * Math.cos(angle + Math.PI / 7), y1 - headlen * Math.sin(angle + Math.PI / 7),x1 - headlen * Math.cos(angle - Math.PI / 7), y1 - headlen * Math.sin(angle - Math.PI / 7),color,params);
  }

}


const renderer = Renderer.instance;
export default renderer;