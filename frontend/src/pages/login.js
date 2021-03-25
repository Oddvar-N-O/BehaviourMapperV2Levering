import React from 'react';
import { Link } from 'react-router-dom';
import './login.css'

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            u_id: "",
         }
         this.login = this.login.bind(this);
    }

    login() {
        console.log(this.state.u_id)
    }


    render() { 
        return ( 
            <div className="login">
                <button>
                    <Link to={{
                            pathname: "/startpage",
                            
                            state: {
                              u_id: this.state.u_id,
                            },
                            }}>Login
                        </Link>
                </button>
              </div>
         );
    }
}
 
export default Login;