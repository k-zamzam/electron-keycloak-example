import { BrowserWindow } from "electron";

let authWindow: BrowserWindow | null = null;

export function createAuthWindow(authUrl: string, callback: () => void) : void {
    destroyAuthWin();

    authWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        webPreferences: {
          nodeIntegration: false,
        }
    });

    authWindow.loadURL(authUrl);
    authWindow.show();

    const {
        session: { webRequest } 
      } = authWindow.webContents;
      const filter = {
        urls: ['http://localhost/keycloak-redirect*']
    }

    webRequest.onBeforeRequest(filter, async ({}) => {
        callback();
        return destroyAuthWin();
      });

      authWindow.on('closed', () => {
        authWindow = null;
      });
}


function destroyAuthWin() {
    if (!authWindow) return;
    authWindow.close();
    authWindow = null;
}