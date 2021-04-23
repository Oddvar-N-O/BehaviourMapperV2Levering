import React from 'react';
import {useTranslation} from "react-i18next";
import './languageSelector.css'
import britishFlag from './images/britain.png'
import norwegianFlag from './images/norway.png'

function LanguageSelector() {
    const [, i18n] = useTranslation('common');
    return <div className="language-selector">
        <img className="NO-flag" src={norwegianFlag} alt="no" onClick={() => i18n.changeLanguage('no')}/>
        <img className="british-flag" src={britishFlag} alt="en"onClick={() => i18n.changeLanguage('en')}/>
    </div>
}

export default LanguageSelector