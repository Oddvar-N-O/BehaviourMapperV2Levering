import React from "react"
import {observer, inject} from "mobx-react";

inject("authStore")
observer(class Login extends React.Component {

   componentWillMount() {
      this.props.authStore.login();
   }

   render() {
      return (
         <span> Login in process – please wait...</span>
      );
   }
})
// export default Login;
