import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'

const isDev = process.env.NODE_ENV === 'development'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 380,
    height: 620,
    minWidth: 320,
    minHeight: 480,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    vibrancy: 'under-window',
    visualEffectState: 'active',
  })

  // Stealth mode: invisible to screen capture and screen share
  mainWindow.setContentProtection(true)

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

// IPC: window opacity control
ipcMain.handle('window:set-opacity', (_event, opacity: number) => {
  const clamped = Math.max(0.1, Math.min(1.0, opacity))
  mainWindow?.setOpacity(clamped)
})

// IPC: always-on-top toggle
ipcMain.handle('window:set-always-on-top', (_event, value: boolean) => {
  mainWindow?.setAlwaysOnTop(value, 'screen-saver')
})

// IPC: screenshot (briefly disables content protection)
ipcMain.handle('screenshot:capture', async () => {
  mainWindow?.setContentProtection(false)
  // Capture happens in renderer via desktopCapturer
  // Re-enable after 200ms
  setTimeout(() => {
    mainWindow?.setContentProtection(true)
  }, 200)
  return true
})

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
