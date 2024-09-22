import { contextBridge, ipcRenderer } from 'electron'
import ContextAPI from "./ContextAPI";

if(!process.contextIsolated) {
  throw new Error('contextIsolation must be enabled!');
}

const keycloakAPI : ContextAPI = {
  login: (url: string) => ipcRenderer.invoke('keycloak:login', url),
  getAppVersion: () => ipcRenderer.invoke('app:version')
}

try {
  contextBridge.exposeInMainWorld('context', keycloakAPI)
} catch(error) {
  console.log(error);
}

