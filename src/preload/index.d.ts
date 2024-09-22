import { ElectronAPI } from '@electron-toolkit/preload'
import ContextAPI from "./ContextAPI";

declare global {
  interface Window {
    context: ContextAPI
    api: unknown
  }
}
