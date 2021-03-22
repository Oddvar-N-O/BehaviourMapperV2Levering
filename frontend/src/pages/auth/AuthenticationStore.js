import {extendObservable, action, computed} from "mobx";
import {UserManager} from 'oidc-client';

class AuthenticationStore {
    constructor() {
       extendObservable(this,{
           user: null,
           manager: new UserManager(config),
           get isLoggedIn() {
            return this.user != null && this.user.access_token && !this.user.expired;
           },
           loadUser: action.bound(function() {
            this.manager.getUser()
               .then( (user) => this.user = user);
            }),
            login: action.bound(function() {
               this.manager.signinRedirect()
                  .catch((error) => this.handleError(error));
            }),
            completeLogin: action.bound(function () {
                this.manager.signinRedirectCallback()
                   .then(user => this.user = user)
                   .catch((error) => this.handleError(error));
            }),
            logout: action.bound(function() {
               this.manager.signoutRedirect()
                  .catch((error) => this.handleError(error));
            }),
            completeLogout: action.bound(function() {
                this.manager.signoutRedirectCallback()
                   .then(() => {this.manager.removeUser()})
                   .then(() => {this.user = null;})
                   .catch((error) => this.handleError(error));
            }),
            handleError: action.bound(function(error) {
                console.error("Problem with authentication endpoint: ", error);
            }),
       });
       // TODO: Flyttes til fil
       let config =  {
          authority: "https://auth.dataporten.no/openid/userinfo",
          client_id: "your_client_configuration_id",
          redirect_uri: "http://localhost:3000/behaviourmapper/startpage",
          post_logout_redirect_uri: "http://localhost:3000/behaviourmapper",
          response_type: "code",
          scope: "openid profile ",
          acr_values: "Level3",
          ui_locales: "nb",
          loadUserInfo: false,
          revokeAccessTokenOnSignout: true
       };
    }
 
 }
 