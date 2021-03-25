import {createAuthContext} from "react-pkce"

// const clientId = "997c91cc-7866-4a6e-af06-3cd2da4374ce"
// const clientSecret = "5c475d41-6465-4357-b0e0-4141652aaebc"
// const provider = "https://auth.dataporten.no/oauth/authorization"

const clientId = process.env.REACT_APP_CLIENT_ID 
const clientSecret = process.env.REACT_APP_CLIENT_SECRET 
const provider = process.env.REACT_APP_PROVIDER 
 
const {AuthContext, Authenticated, useToken} = createAuthContext({
  clientId,
  clientSecret, // optional, only specify if provider requires it
  provider,
  scopes: [ 'oidc', 'email' ]
})



export { AuthContext, Authenticated, useToken };