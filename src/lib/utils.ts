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

function bazierCurve(startPos : Vector2, endPos: Vector2, curvature : number) : string {
    // https://github.com/xyflow/xyflow/blob/8dda0eb1446916fdf30aacbc029b01d66a359287/packages/system/src/utils/edges/bezier-edge.ts#L4
    function calculateControlOffset(distance: number, curvature: number): number {
        if (distance >= 0) {
            return 0.5 * distance;
        }
        return curvature * 25 * Math.sqrt(-distance);
    }
    const controlPoint1 = new Vector2(startPos.x, startPos.y - calculateControlOffset(startPos.y - endPos.y, curvature));
    const controlPoint2 = new Vector2(endPos.x, endPos.y + calculateControlOffset(startPos.y - endPos.y, curvature));    
    return `M${startPos.x},${startPos.y} 
                          C${controlPoint1.x},${controlPoint1.y} 
                           ${controlPoint2.x},${controlPoint2.y} 
                          ${endPos.x},${endPos.y}`;
}

export {mkProxy,bazierCurve};