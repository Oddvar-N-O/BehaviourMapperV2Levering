import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import 'leaflet/dist/leaflet.css';

// window.backend_url = "http://127.0.0.1:5000/behaviourmapper/"
window.backend_url = "https://behaviourmapper.ux.uis.no/"

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
