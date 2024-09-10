class Vector2 {
    x : number;
    y : number;
    
    public get w() : number {
        return this.x;
    }
    public get h() : number {
        return this.y;
    }



    constructor(x : number, y : number) {
        this.x = x;
        this.y = y;
    } 
    add(other: Vector2) : Vector2 {
        return new Vector2(this.x + other.x,this.y + other.y); 
    }
    sub(other: Vector2) : Vector2 {
        return new Vector2(this.x - other.x,this.y - other.y); 
    }

    length() : number {
        return Math.sqrt(this.x * this.x + this.y * this.y); 
    }

    set(x :number , y : number) {
        this.x = x;
        this.y = y;
    } 
}


function circleCollidePoint(x0: number, y0: number, r : number,x1 : number, y1 : number) : boolean {
    return r * r >= (x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0);
}
function rectCollidePoint(x0: number, y0: number, x1 : number, y1 : number, w1 : number, h1: number) : boolean {
        return x0 + 1 > x1 && y0 + 1 > y1 && x1 + w1 > x0 && y1 + h1 > y0;
}


type Pointer<Type> = {val : Type};


export { Vector2, circleCollidePoint , rectCollidePoint };
export type { Pointer };
