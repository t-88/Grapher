import "./index.css"
import ReactDOM from 'react-dom/client';
import App from './App';
import  { init_engine } from "./lib/core/engine";

init_engine();

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render( <App/> );

