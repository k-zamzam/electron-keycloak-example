import { ElectronAPI } from '@electron-toolkit/preload'
import KeycloakAPI from "./KeycloakAPI";

declare global {
  interface Window {
    keycloak: KeycloakAPI
    api: unknown
  }
}
