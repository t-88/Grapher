import { useEffect, useRef } from "react";

function NumberInput({ watch, watchValue, lable, onChange }: { watch: object, watchValue: () => string, lable: string, onChange: Function }) {
    const ref = useRef<HTMLInputElement | null>(null);
    useEffect(() => {
        if (ref.current) {
            ref.current.value = watchValue();
        }
    }, [watch, ref]);
    return <div className='custom-input'>
        <div className='lable-container'>
            <label>{lable}</label>
        </div>
        <input ref={ref} type="number" placeholder='' onChange={(evt) => {

            if (evt.target.value.length == 0) {
                evt.target.value = "0";
            }
            if (parseInt(evt.target.value) < 0) {
                evt.target.value = "0";
            } else {
                evt.target.value = parseInt(evt.target.value).toString();
            }
            onChange(evt);
        }} />
    </div>
}

export default NumberInput;
