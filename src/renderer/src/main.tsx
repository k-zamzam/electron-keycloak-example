
import ReactDOM from 'react-dom/client'
import App from './App'
import { KeycloakService } from './services/KeycloakService'


const render = () => ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />
)

// KeycloakService.init();
KeycloakService.initKeycloak(() => {
  console.log('Enter')
  render();
});