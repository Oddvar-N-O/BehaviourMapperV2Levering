import React from 'react';
import './login.css'

class Login extends React.Component {
    constructor(props) {
        super(props);
         this.login = this.login.bind(this);
    }

    login() {
        window.location.href = 'http://localhost:5000/behaviourmapper/login'
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