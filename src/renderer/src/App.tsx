import { useEffect, useState } from "react";
import { KeycloakService } from "./services/KeycloakService"

function App(): JSX.Element {
  const [appVersion, setAppVersion] = useState('');


  const login = () => {
    const loginUrl : string = KeycloakService.getLoginUrl();
    console.log(loginUrl);
    window.context.login(loginUrl);
  }

  const getAppVersion = async () => {
    const version = await window.context.getAppVersion();
    setAppVersion(version);
  }

  useEffect(() => {
    getAppVersion();
  })

  if(!KeycloakService.isLoggedIn()) {
    return <>
      <h1>Sign in</h1>
      <button onClick={login}>Login</button>
      <p>Version {appVersion}</p>
    </>
  }

  return (
    <div>
    <h1>Home</h1>
    <div>Hello {KeycloakService.getName()}</div>
    <button onClick={KeycloakService.logout}>Logout</button>
    <p>Version {appVersion}</p>
    </div>
  )
}

export default App
