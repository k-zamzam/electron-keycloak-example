import { contextBridge, ipcRenderer } from 'electron'
import KeycloakAPI from "./KeycloakAPI";

if(!process.contextIsolated) {
  throw new Error('contextIsolation must be enabled!');
}

const keycloakAPI : KeycloakAPI = {
  login: (url: string) => ipcRenderer.invoke('keycloak:login', url)
}

try {
  contextBridge.exposeInMainWorld('keycloak', keycloakAPI)
} catch(error) {
  console.log(error);
}

