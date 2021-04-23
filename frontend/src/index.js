import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import 'leaflet/dist/leaflet.css';
import './i18n';
import {I18nextProvider} from "react-i18next";
import i18next from "i18next";
import common_no from "./translations/no/common.json";
import common_en from "./translations/en/common.json";

window.backend_url = "http://localhost:5000/behaviourmapper/"
// window.backend_url = "https://behaviourmapper.ux.uis.no/"

i18next.init({
  interpolation: { escapeValue: false },  // React already does escaping
  lng: 'en',                              // language to use
  resources: {
      en: {
          common: common_en               // 'common' is our custom namespace
      },
      no: {
          common: common_no
      },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18next}>
      <App />
    </I18nextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
