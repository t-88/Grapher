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

export {mkProxy};