import "./DropDownMenu.css";
import { useEffect, useState, type ReactNode } from "react";


function DropDownMenu({ children, onSelect, defaultIdx, watch, watchValue, values }: { children: Array<ReactNode>, values: Array<any>, onSelect: (val: any) => void, defaultIdx?: number, watch: any, watchValue: () => any }) {
    const [shown, setShown] = useState(false);
    const [selectedChild, setSelectedChild] = useState(defaultIdx ?? 0);

    useEffect(() => {
        setSelectedChild(watchValue() as number);
    }, [watch]);

    function onToggle() {
        setShown(!shown);
    }
    function onFocusOut() {
        setSelectedChild(0);
    }

    function _onSelect(idx: number) {
        onSelect(values[idx]);
        setShown(false);
        setSelectedChild(idx);
    }

    return <div className="dropdown-menu"  >
        <button className="btn" onBlur={onFocusOut} onClick={onToggle}>
            <div>
                {
                    children[selectedChild]
                }
            </div>
        </button>
        {
            shown ?
                <div className="dropdown-menu-container">
                    {
                        children.map((child, idx) => {
                            return <div key={idx} onClick={() => _onSelect(idx)} >{child}</div>;
                        })
                    }

                </div> : <></>
        }
    </div>
}


export default DropDownMenu;