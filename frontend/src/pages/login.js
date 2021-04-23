import React from 'react';
import './login.css'
import { withTranslation } from 'react-i18next';

class Login extends React.Component {
    constructor(props) {
        super(props);
         this.login = this.login.bind(this);
    }

    login() {
        window.location.href = 'http://localhost:5000/behaviourmapper/login'
        // window.location.href = 'http://behaviourmapper.ux.uis.no/login'
    }

    render() { 
        const { t } = this.props;
        return ( 
            <div className="login">
                <h1>Behaviour Mapper</h1>
                <button onClick={this.login}>{t('login.login')}</button>     
            </div>
         );
    }
}
 
export default withTranslation('common')(Login);