import camera from "./camera";
import { Vector2, type Pointer } from "./math";
import Mouse from "./mouse";
import { INode, ONode, Node, type PinMouseAction } from "./node";
import renderer from "./render";
import p5Types from "p5";



class Wire {
    startPin: Pointer<Vector2>;
    endPin: Pointer<Vector2>;
    constructor() {
        this.startPin = { val: new Vector2(0, 0) };
        this.endPin = { val: new Vector2(0, 0) };
    }

    draw() {
        let startVec = camera.toWorldSpace(new Vector2(this.startPin.val.x,this.startPin.val.y));
        let endVec = camera.toWorldSpace(new Vector2(this.endPin.val.x,this.endPin.val.y));
        renderer.drawVector(startVec.x, startVec.y, endVec.x, endVec.y, "yellow")
    }
}

class Engine {
    static #instance: Engine;

    ctx: CanvasRenderingContext2D | undefined = undefined;
    mouse: Mouse = new Mouse();
    node!: Node;
    nodes: Array<Node> = new Array();
    curWire: Wire = new Wire();
    curWireDraging: boolean = false;
    p5? : p5Types; 

    constructor() {


    }

    setup(p5: p5Types, canvasParentRef: Element) {
        this.p5 = p5;
        this.p5.createCanvas(1500, 1000).parent(canvasParentRef);
        renderer.setP5(p5);
        camera.setP5(p5)

        this.nodes = new Array();
        this.nodes.push(new INode(200, 200, 200, 60));
        this.nodes.push(new ONode(200, 400, 200, 60));
        this.node = this.nodes[0];

        this.curWireDraging = false;
       
    }

    public static get instance(): Engine {
        if (!Engine.#instance) {
            Engine.#instance = new Engine();
        }
        return Engine.#instance;
    }



    onMouseMove() {
        if(!this.p5) return;


        if (!this.mouse.draging) {
            this.curWireDraging = false;
        }
       
        this.update();

        for (let node of this.nodes) {
            node.onMouseMove(this.mouse);
        }
    }

    onMouseDrag() {
        if(!this.p5) return;

        if(this.node.draging) {
            let pos: Vector2 = camera.toScreenSpace(this.mouse.pos.sub(this.mouse.offset));
            pos.x = Math.ceil(pos.x / 20) * 20;
            pos.y = Math.ceil(pos.y / 20) * 20;
            this.node.pos = pos;
        }
    }

    onMouseUp() {
        if(!this.p5) return;

        this.mouse.offset.x = 0;
        this.mouse.offset.y = 0;
        this.mouse.draging = false;
        this.node.draging = false;

        for (let node of this.nodes) {
            node.onMouseUp(this.mouse);
        }
    }
    onMouseDown() {
        if(!this.p5) return;

        this.mouse.draging = true;

        for (let node of this.nodes) {
            node.onMouseDown(this.mouse);
        }

        for (let node of this.nodes) {
            if (node.collidePoint(camera.toScreenSpace(this.mouse.pos))) {
                this.node = node;
                if(this.node.pinHover) {
                    this.node.draging = false;
                } else {
                    this.node.draging = true;
                }
                this.mouse.offset = new Vector2(this.p5.mouseX, this.p5.mouseY).sub(camera.toWorldSpace(this.node.pos))
                break;
            }
        }
    }

    onPinSelected(pinPosPointer: Pointer<Vector2>, action: PinMouseAction) {
        if (action == "Select") {
            this.curWireDraging = true;
            this.curWire.startPin = pinPosPointer;
        }

        if (action == "Drop") {
            this.curWireDraging = false;
            this.curWire.endPin = pinPosPointer;
        }

    }

    onKeyDown() {
        if(!this.p5) return


        if(this.p5.keyIsDown(this.p5.LEFT_ARROW)) {
            camera.setOffsetX(camera.offset.x + 10);

        } else if(this.p5.keyIsDown(this.p5.RIGHT_ARROW)) {
            camera.setOffsetX(camera.offset.x - 10);
        }
        if (this.p5.keyIsDown(this.p5.UP_ARROW)) {
            camera.setOffsetY(camera.offset.y - 10);
        } else if (this.p5.keyIsDown(this.p5.DOWN_ARROW)) {
            camera.setOffsetY(camera.offset.y + 10);
        }

        if (this.p5.keyIsDown(109)) {
            camera.setZoom(camera.zoom - 0.1);
        } else if (this.p5.keyIsDown(107)) {
            camera.setZoom(camera.zoom + 0.1);
        }

    }

    update() {
        if(!this.p5) return

        this.mouse.pos.x = this.p5.mouseX;
        this.mouse.pos.y = this.p5.mouseY;


        if (this.curWireDraging) {
            this.curWire.endPin = { val: camera.toScreenSpace(new Vector2(this.mouse.pos.x, this.mouse.pos.y)) };
        }

        for (let node of this.nodes) {
            node.update(this.mouse);
        }
    }

    draw() {
        this.update()

        renderer.clearScreen("black");
        for (let y = 0; y < 50 / camera.zoom; y += 1) {
            for (let x = 0; x < 80 / camera.zoom; x += 1) {
                renderer.drawCircle(x * 20 * camera.zoom, y * 20 * camera.zoom, camera.zoom,"yellow");
            }
        }

        this.curWire.draw();

        camera.begin();

            for (let node of this.nodes) {
                node.draw();
            }

        camera.end();
    }

}


let engine : Engine;
function init_engine() {
    engine = Engine.instance;
}

export {Engine , engine , init_engine};