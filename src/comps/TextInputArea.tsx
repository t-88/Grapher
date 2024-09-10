import { useEffect, useRef } from "react";


function TextAreaInput({ watch, watchValue, onChange }: { watch: object, watchValue: () => string, onChange: Function }) {
    const ref = useRef<HTMLTextAreaElement | null>(null);
    useEffect(() => {
        if (ref.current) {
            ref.current.value = watchValue();
        }
    }, [watch, ref]);

    return <textarea ref={ref} onChange={(evt) => onChange(evt)} ></textarea>
}

export default TextAreaInput;