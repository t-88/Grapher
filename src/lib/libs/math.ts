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

    equal(other : Vector2) {
        return this.x == other.x && this.y == other.y;
    }

    static copy( vec : Vector2) : Vector2 {
        return new Vector2(vec.x,vec.y);
    }
    static new( x : number, y : number) : Vector2 {
        return new Vector2(x,y);
    }    
}


function circleCollidePoint(x0: number, y0: number, r: number, x1: number, y1: number): boolean {
    return r * r >= (x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0);
}
function rectCollidePoint(x0: number, y0: number, x1: number, y1: number, w1: number, h1: number): boolean {
    return x0 + 1 > x1 && y0 + 1 > y1 && x1 + w1 > x0 && y1 + h1 > y0;
}

function lineCollidePoint(x0: number, y0: number, x1: number, y1: number, x: number, y: number): boolean {
    const EPSILONE = 4;
    return Math.abs((new Vector2(x0,y0)).sub(new Vector2(x,y)).length() + 
                    (new Vector2(x1,y1)).sub(new Vector2(x,y)).length() - 
                    (new Vector2(x1,y1)).sub(new Vector2(x0,y0)).length()) <= EPSILONE;
}


type Pointer<Type> = { val: Type };


interface Vertex {
    uuid: string,
    pos: Vector2,
    left?: Vertex | null,
    right?: Vertex | null,
    top?: Vertex | null,
    bottom?: Vertex | null,
}


interface BLine {
    start: Vector2;
    end: Vector2;
};

function dijkstra_alg(src: Vertex, target: Vertex, vertices: Array<Vertex>): [Array<BLine>, Array<BLine>] {
    interface PathEntry { self: Vertex, dis: number, preVertex: Vertex | null };
    let path: { [key: string]: PathEntry } = {};


    // : Map<string, > = new Map();

    for (let vertex of vertices) {
        path[vertex.uuid] = { self: vertex, preVertex: null, dis: Number.MAX_SAFE_INTEGER };
    }
    path[src.uuid] = { self: src, preVertex: null, dis: 0 };

    let visited = [];
    let unvisted = Object.keys(path);
    let count = 0;
    let prev_dir = "vert";
    let vertex = null;
    while (unvisted.length != 0) {
        count++;
        if (count > 10000) {
            alert("WHILE LOOP!!");
            break;
        }

        let un_edjes = [];
        for (let key of unvisted) {
            un_edjes.push(path[key]);
        }


        let edje = un_edjes.sort((a: PathEntry, b: PathEntry) => { return a.dis - b.dis; })[0];
        if (vertex) {
            if (edje.self.pos.x == vertex.pos.x) {
                prev_dir = "vert";
            } else {
                prev_dir = "horz";
            }
        }
        vertex = edje.self;
        if (vertex.left) {
            let dis = path[vertex.uuid].dis + Math.abs(vertex.left.pos.x - vertex.pos.x);
            if (prev_dir != "horz") {
                dis += 20000;
            }

            if (path[vertex.left.uuid].dis > dis) {
                path[vertex.left.uuid].dis = dis;
                path[vertex.left.uuid].preVertex = vertex;
            }
        }
        if (vertex.right) {
            let dis = path[vertex.uuid].dis + Math.abs(vertex.right.pos.x - vertex.pos.x);
            if (prev_dir != "horz") {
                dis += 20000;
            }

            if (path[vertex.right.uuid].dis > dis) {
                path[vertex.right.uuid].dis = dis;
                path[vertex.right.uuid].preVertex = vertex;
            }
        }
        if (vertex.top) {
            let dis = path[vertex.uuid].dis + Math.abs(vertex.top.pos.y - vertex.pos.y);
            if (prev_dir != "vert") {
                dis += 20000;
            }

            if (path[vertex.top.uuid].dis > dis) {
                path[vertex.top.uuid].dis = dis;
                path[vertex.top.uuid].preVertex = vertex;
            }
        }
        if (vertex.bottom) {
            let dis = path[vertex.uuid].dis + Math.abs(vertex.bottom.pos.y - vertex.pos.y);
            if (prev_dir != "vert") {
                dis += 20000;
            }

            if (path[vertex.bottom.uuid].dis > dis) {
                path[vertex.bottom.uuid].dis = dis;
                path[vertex.bottom.uuid].preVertex = vertex;
            }
        }


        visited.push(vertex.uuid);
        unvisted.splice(unvisted.indexOf(vertex.uuid), 1);
    }


    function traceBack(targetUUID: string): Array<BLine> {
        let out: Array<BLine> = [];
        let count = 0;


        type LineDir = "Vert" | "Horz";
        let dir: LineDir = "Vert";
        let cur = path[targetUUID];
        out.push({ start: cur.self.pos, end: cur.preVertex!.pos });
        let last: Vector2;
        while (true) {
            count++;
            if (count > 1000) {
                alert("WHILE LOOP!!");
                break;
            }

            cur = path[cur.preVertex!.uuid];
            if (cur.preVertex == null) break;


            let cur_dir: LineDir = "Horz";
            if (cur.preVertex!.pos.x == cur.self.pos.x) {
                cur_dir = "Vert";
            }

            if (cur_dir != dir) {
                dir = cur_dir;
                out.push({ start: out[out.length - 1].end, end: Vector2.copy(cur.self.pos) });
            }
        }

        out.push({ start: src.pos, end: out[out.length - 1].end });
        out.splice(1, 1);

        return out;
    }



    let lines = traceBack(target.uuid);
    let out: Array<BLine> = [];
    let arcPoints: Array<BLine> = [];

    if (lines.length > 1) {

        lines[0].end = Vector2.copy(lines[1].start);
    }


    let DIST = 4;
    for (let line of lines) {
        let horz = line.start.y == line.end.y;
        if (horz) {
            if (line.start.x < line.end.x) {
                out.push({ start: Vector2.new(line.end.x - DIST, line.end.y), end: Vector2.new(line.start.x + DIST, line.start.y) })
            } else {
                out.push({ start: Vector2.new(line.start.x - DIST, line.start.y), end: Vector2.new(line.end.x + DIST, line.end.y) })
            }
        } else {

            if (line.start.y < line.end.y) {
                out.push({ start: Vector2.new(line.start.x, line.start.y + DIST), end: Vector2.new(line.end.x, line.end.y - DIST) })

            } else {
                out.push({ start: Vector2.new(line.end.x, line.end.y + DIST), end: Vector2.new(line.start.x, line.start.y - DIST) })
            }
        }
    }
    // NOTE: sorry for future me, use 1 or 0 in i drawing to inverse directions
    for (let i = 0; i < out.length - 1; i++) {
        if (out[i].start.x == out[i].end.x) {
            if (out[i].end.x > out[i + 1].start.x) {
                if (out[i].end.y > out[i + 1].start.y) {
                    arcPoints.push({ start: out[i].start, end: out[i + 1].start });
                } else {
                    arcPoints.push({ start: out[i + 1].start, end: out[i].end });
                }
            } else {
                if (out[i].end.y > out[i + 1].start.y) {
                    arcPoints.push({ start: out[i + 1].end, end: out[i].start });
                } else {
                    arcPoints.push({ start: out[i].end, end: out[i + 1].end });
                }
            }
        } else {
            if (out[i].end.x > out[i + 1].start.x) {
                if (out[i].end.y > out[i + 1].start.y) {
                    arcPoints.push({ start: out[i + 1].end, end: out[i].end });
                } else {
                    arcPoints.push({ start: out[i].end, end: out[i + 1].start });
                }
            } else {
                if (out[i].end.y > out[i + 1].start.y) {
                    arcPoints.push({ start:  out[i].start , end: out[i + 1].end});
                } else {
                    arcPoints.push({ start: out[i + 1].start, end: out[i].start });
                }
            }
        }
    }
    return [out, arcPoints];
}



export { Vector2, circleCollidePoint, rectCollidePoint, lineCollidePoint , dijkstra_alg };
export type { Pointer , Vertex, BLine};
