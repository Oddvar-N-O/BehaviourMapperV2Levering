import {createAuthContext} from "react-pkce"

const clientId = process.env.REACT_APP_CLIENT_ID 
const clientSecret = process.env.REACT_APP_CLIENT_SECRET 
const provider = process.env.REACT_APP_PROVIDER 
 
const {AuthContext, Authenticated, useToken} = createAuthContext({
  clientId,
  clientSecret, // optional, only specify if provider requires it
  provider,
  scopes: [ 'openid', 'email' ]
})



export { AuthContext, Authenticated, useToken };