import type { PinDir } from "../elems/pin";
import { Vector2 } from "./math";

function mkProxy<type>(target : type,props? : {onGet? : Function, onSet? : Function}) : type {
    return new Proxy<object>(
        target as object,
        {
            get: function(target,prop,recv) {
                if(props?.onGet) props.onGet();
                return  Reflect.get(target,prop,recv);
            },
            set: function(target,prop,value) : boolean {
                let ret = Reflect.set(target,prop,value);
                if(props?.onSet) props.onSet();
                return ret;
                 
            }
        }
    ) as type;
}

function bazierCurve(startPos : Vector2, endPos: Vector2, curvature : number, startDir : PinDir,endDir : PinDir) : string {
    // https://github.com/xyflow/xyflow/blob/8dda0eb1446916fdf30aacbc029b01d66a359287/packages/system/src/utils/edges/bezier-edge.ts#L4
    function calculateControlOffset(distance: number, curvature: number): number {
        if (distance >= 0) {
            return 0.5 * distance;
        }
        return curvature * 25 * Math.sqrt(-distance);
    }

    function controlPointFromDir(vec1 : Vector2, vec2: Vector2,dir : PinDir) {
        switch (dir) {
            case "Top": return  new Vector2(vec1.x, vec1.y - calculateControlOffset(vec1.y - vec2.y, curvature));
            case "Bottom": return  new Vector2(vec1.x, vec1.y + calculateControlOffset(vec2.y - vec1.y, curvature));
            case "Left": return  new Vector2(vec1.x - calculateControlOffset(vec1.x - vec2.x, curvature), vec1.y); 
            case "Right": return  new Vector2(vec1.x + calculateControlOffset(vec2.x - vec1.x, curvature), vec1.y); 
        }
    }

    const controlPoint1 = controlPointFromDir(startPos,endPos,startDir);
    const controlPoint2 = controlPointFromDir(endPos,startPos,endDir); 
    return `M${startPos.x},${startPos.y} 
                          C${controlPoint1.x},${controlPoint1.y} 
                           ${controlPoint2.x},${controlPoint2.y} 
                          ${endPos.x},${endPos.y}`;
}

export {mkProxy,bazierCurve};