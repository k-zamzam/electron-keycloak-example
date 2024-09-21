import { KeycloakService } from "./services/KeycloakService"

function App(): JSX.Element {

  const login = () => {
    const loginUrl : string = KeycloakService.getLoginUrl();
    console.log(loginUrl);
    window.keycloak.login(loginUrl);
  }

  if(!KeycloakService.isLoggedIn()) {
    return <>
      <h1>Login</h1>
      <button onClick={login}>Login</button>
    </>
  }

  return (
    <div>
    <div>Hello {KeycloakService.getName()}</div>
    <button onClick={KeycloakService.logout}>Logout</button>
    </div>
  )
}

export default App
