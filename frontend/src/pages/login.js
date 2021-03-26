import React from 'react';
import './login.css'
import { Authenticated } from './auth/AuthContext'

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            u_id: "",
         }
         this.login = this.login.bind(this);
    }

    login() {
        <Authenticated>
            {window.location.href = 'http://localhost:5000/behaviourmapper/login'}
        </Authenticated>
    }


    render() { 
        return ( 
            <div className="login">
                <h1>Behaviour Mapper</h1>
                <button onClick={this.login}>Login</button>     
            </div>
         );
    }
}
 
export default Login;