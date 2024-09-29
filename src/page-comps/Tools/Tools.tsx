import { engine } from "../../lib/core/engine";
import "./Tools.css";

function Tools() {

    function onLoadJson() {
        let lastGraph = localStorage.getItem("lastGraph");
        engine.loadFromJson(lastGraph ? JSON.parse(lastGraph) : DATA);
    }
    return <div id='tools'>
        <center id='logo'><h3>Grapher</h3></center>
        <button onClick={() => engine.addNode()}>Add Node</button>
        <button onClick={() => engine.saveToJson()}>Save To Json</button>
        <textarea name="" id=""></textarea>
    </div>
}

export default Tools;


let DATA = {
    "nodes": {
        "b3afb35a-7a3a-40da-ab54-410b7a9302c2": {
            "uuid": "b3afb35a-7a3a-40da-ab54-410b7a9302c2",
            "text": "A",
            "pos": {
                "x": 182,
                "y": 638
            },
            "size": {
                "x": 100,
                "y": 33.75
            },
            "max_width": 100,
            "padding": {
                "left": 8,
                "right": 8,
                "top": 8,
                "bottom": 8
            },
            "pins": {
                "Bottom": true,
                "Top": true,
                "Left": true,
                "Right": true
            },
            "pinsPoses": {
                "Left": {
                    "x": 176.99652099609375,
                    "y": 649.8611602783203
                },
                "Right": {
                    "x": 276.99658203125,
                    "y": 649.8611602783203
                },
                "Top": {
                    "x": 226.99652099609375,
                    "y": 632.9861602783203
                },
                "Bottom": {
                    "x": 226.99652099609375,
                    "y": 666.7361602783203
                }
            }
        },
        "66150cb2-9387-4a4a-bc30-5d2a3c299365": {
            "uuid": "66150cb2-9387-4a4a-bc30-5d2a3c299365",
            "text": "A",
            "pos": {
                "x": 743,
                "y": 602
            },
            "size": {
                "x": 100,
                "y": 33.75
            },
            "max_width": 100,
            "padding": {
                "left": 8,
                "right": 8,
                "top": 8,
                "bottom": 8
            },
            "pins": {
                "Bottom": true,
                "Top": true,
                "Left": true,
                "Right": true
            },
            "pinsPoses": {
                "Left": {
                    "x": 737.9862060546875,
                    "y": 613.8715362548828
                },
                "Right": {
                    "x": 837.9862060546875,
                    "y": 613.8715362548828
                },
                "Top": {
                    "x": 787.9862060546875,
                    "y": 596.9965362548828
                },
                "Bottom": {
                    "x": 787.9862060546875,
                    "y": 630.7465362548828
                }
            }
        },
        "a76bcb86-8716-46bf-8d0d-89018a8d308b": {
            "uuid": "a76bcb86-8716-46bf-8d0d-89018a8d308b",
            "text": "A",
            "pos": {
                "x": 516,
                "y": 61
            },
            "size": {
                "x": 100,
                "y": 33.75
            },
            "max_width": 100,
            "padding": {
                "left": 8,
                "right": 8,
                "top": 8,
                "bottom": 8
            },
            "pins": {
                "Bottom": true,
                "Top": true,
                "Left": true,
                "Right": true
            },
            "pinsPoses": {
                "Left": {
                    "x": 510.9896240234375,
                    "y": 72.86459350585938
                },
                "Right": {
                    "x": 610.9896240234375,
                    "y": 72.86459350585938
                },
                "Top": {
                    "x": 560.9896240234375,
                    "y": 55.989593505859375
                },
                "Bottom": {
                    "x": 560.9896240234375,
                    "y": 89.73959350585938
                }
            }
        }
    },
    "wires": [
        {
            "uuid": "8ceca8fe-de31-4994-b8e6-9e711fcfd43f",
            "arrowDir": "Left",
            "curvature": 25,
            "curveType": "Bezier",
            "srcUUID": "a76bcb86-8716-46bf-8d0d-89018a8d308b",
            "targetUUID": "66150cb2-9387-4a4a-bc30-5d2a3c299365",
            "srcDir": "Bottom",
            "targetDir": "Top"
        },
        {
            "uuid": "1306903d-de38-4d97-a7fb-a40f3fa01293",
            "arrowDir": "Left",
            "curvature": 25,
            "curveType": "Orthognal",
            "srcUUID": "b3afb35a-7a3a-40da-ab54-410b7a9302c2",
            "targetUUID": "a76bcb86-8716-46bf-8d0d-89018a8d308b",
            "srcDir": "Top",
            "targetDir": "Bottom"
        }
    ]
}