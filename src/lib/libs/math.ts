class Vector2 {
    x: number;
    y: number;

    public get w(): number {
        return this.x;
    }
    public get h(): number {
        return this.y;
    }



    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    add(other: Vector2): Vector2 {
        return new Vector2(this.x + other.x, this.y + other.y);
    }
    sub(other: Vector2): Vector2 {
        return new Vector2(this.x - other.x, this.y - other.y);
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    set(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    setVec(vec : Vector2) {
        this.x = vec.x;
        this.y = vec.y;
    }


    equal(other : Vector2) {
        return this.x == other.x && this.y == other.y;
    }
    equalEpsilon(other : Vector2) {
        const EPSILON = 1.5;
        return Math.abs(this.x - other.x) <= EPSILON  && Math.abs(this.y - other.y) <= EPSILON;
    }
    

    static copy( vec : Vector2) : Vector2 {
        return new Vector2(vec.x,vec.y);
    }
    static new( x : number, y : number) : Vector2 {
        return new Vector2(x,y);
    }    

    jsonDump() {
        return {
            x : this.x,
            y : this.y,
        };
    }
    static jsonLoad(vec : {[key : string] : number}) {
        return new Vector2(vec["x"],vec["y"]); 
    }


    toString() {
        return `${this.x} ${this.y}`;
    }
}


function circleCollidePoint(x0: number, y0: number, r: number, x1: number, y1: number): boolean {
    return r * r >= (x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0);
}
function rectCollidePoint(x0: number, y0: number, x1: number, y1: number, w1: number, h1: number,options? :  {rect : number}): boolean {
    options = options ?? {rect : 1};
    return x0 +(options.rect)> x1 && y0 +(options.rect)> y1 && x1 + w1 > x0 && y1 + h1 > y0;
}

function lineCollidePoint(x0: number, y0: number, x1: number, y1: number, x: number, y: number): boolean {
    const EPSILONE = 4;
    return Math.abs((new Vector2(x0,y0)).sub(new Vector2(x,y)).length() + 
                    (new Vector2(x1,y1)).sub(new Vector2(x,y)).length() - 
                    (new Vector2(x1,y1)).sub(new Vector2(x0,y0)).length()) <= EPSILONE;
}


type Pointer<Type> = { val: Type };



interface BLine {
    start: Vector2;
    end: Vector2;
};



export { Vector2, circleCollidePoint, rectCollidePoint, lineCollidePoint };
export type { Pointer , BLine};
