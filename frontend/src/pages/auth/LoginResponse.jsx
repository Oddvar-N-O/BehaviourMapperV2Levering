import React from "react"
import {observer, inject} from "mobx-react";

inject("authStore")
observer(class LoginResponse extends ReactComponent {

    componentWillMount() {
       this.props.authStore.completeLogin();
    }

    render() {
       return(
          <span>You are now logged in </span>
       );
    }
});

