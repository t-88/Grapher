import "./index.css"
import ReactDOM from 'react-dom/client';
import  { init_engine } from "./lib/core/engine";
import App from "./App";

init_engine();

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render( <App/> );

