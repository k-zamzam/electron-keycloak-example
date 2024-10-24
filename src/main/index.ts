import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { createAuthWindow } from './auth-process'
import { autoUpdater, UpdateInfo } from 'electron-updater';

let mainWindow: BrowserWindow

function handleCheckSso() {
  const {
    session: { webRequest }
  } = mainWindow.webContents
  const filter = {
    urls: ['http://localhost/keycloak-redirect*']
  }

  webRequest.onBeforeRequest(filter, ({ url }) => {
    const params = url.slice(url.indexOf('?'))

    const baseUrl =
      is.dev && process.env['ELECTRON_RENDERER_URL']
        ? process.env['ELECTRON_RENDERER_URL']
        : `file://${join(__dirname, '../renderer/index.html')}`

    // Handle logout request
    if(!params.includes('state')) {
     return mainWindow.reload();
    }

    mainWindow.loadURL(`${baseUrl}${params}`);
  })
}

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false
    }
  });

  handleCheckSso();

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Auto update flags
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'));

  ipcMain.handle('app:version', () => {
    return app.getVersion();
  });

  ipcMain.handle('keycloak:login', (_, url: string) => {
    createAuthWindow(url, () => {
      handleCheckSso();
      mainWindow.reload()
    })
  });

  createWindow()

  app.setAsDefaultProtocolClient('app')

  app.on('open-url', (event, url) => {
    event.preventDefault()
    // Handle the URL received from Keycloak's redirect
    console.log('Redirected URL:', url)
    mainWindow.loadURL('http://localhost:5173')
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update');
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Available',
    message: 'Checking for updates',
  });
});

autoUpdater.on('update-not-available', (_info: UpdateInfo) => {
  dialog.showMessageBox({
    type: 'info',
    title: 'No Update Available',
    message: `No new update. Version ${_info.version}, Files: ${_info.files.toString()}, Release name ${_info.releaseName}`
  });
});


autoUpdater.on('update-available', (_info: UpdateInfo) => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Available',
    message: `NEW UPDATE DETECTED. Version ${_info.version}, Files: ${_info.files.toString()}, Release name ${_info.releaseName}`
  }).then((returnValue) => {
    if(returnValue.response === 0) autoUpdater.downloadUpdate();

  });

});

autoUpdater.on("update-downloaded", (_info) => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Update downloaded',
    message: `Update downloaded`
  }).then((returnValue) => {
    if(returnValue.response === 0)   autoUpdater.quitAndInstall();
  });;  
});

autoUpdater.on("error", (info) => {
  dialog.showMessageBox({
    type: 'error',
    title: 'Update Error',
    message: `Error: ${info}`,
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
