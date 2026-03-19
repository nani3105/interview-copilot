import { app, BrowserWindow, ipcMain, screen } from 'electron'
import path from 'path'

const isDev = process.env.NODE_ENV === 'development'

const BAR_W = 524
const BAR_H = 72
const PANEL_H = 360 // bar + floating panel combined

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 380,
    height: 620,
    minWidth: 320,
    minHeight: 480,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
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

// IPC: resize window to fit screen content (Onboarding, JobContext, Splash)
ipcMain.handle('window:set-size', (_event, width: number, height: number) => {
  if (!mainWindow) return
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize
  const w = Math.min(Math.max(width, 360), sw - 40)
  const h = Math.min(Math.max(height, 300), sh - 40)
  mainWindow.setMinimumSize(w, h)
  mainWindow.setSize(w, h)
})

// IPC: resize + reposition window to fit only the floating bar
ipcMain.handle('window:fit-to-bar', () => {
  if (!mainWindow) return
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize
  const x = Math.round(sw - BAR_W - 20)   // 20 px from right edge
  const y = Math.round(sh - BAR_H - 16)   // just above the dock
  mainWindow.setMinimumSize(BAR_W, BAR_H)
  mainWindow.setSize(BAR_W, BAR_H)
  mainWindow.setPosition(x, y)
})

// IPC: expand window upward to show the floating panel above the bar
ipcMain.handle('window:expand-for-panel', () => {
  if (!mainWindow) return
  const [x, y] = mainWindow.getPosition()
  mainWindow.setMinimumSize(BAR_W, PANEL_H)
  mainWindow.setSize(BAR_W, PANEL_H)
  mainWindow.setPosition(x, y - (PANEL_H - BAR_H))
})

// IPC: collapse back to bar-only height
ipcMain.handle('window:collapse-to-bar', () => {
  if (!mainWindow) return
  const [x, y] = mainWindow.getPosition()
  mainWindow.setMinimumSize(BAR_W, BAR_H)
  mainWindow.setSize(BAR_W, BAR_H)
  mainWindow.setPosition(x, y + (PANEL_H - BAR_H))
})

// IPC: restore full app window (when leaving session)
ipcMain.handle('window:restore-full', () => {
  if (!mainWindow) return
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize
  const x = Math.round((sw - 380) / 2)
  const y = Math.round((sh - 620) / 2)
  mainWindow.setMinimumSize(320, 480)
  mainWindow.setSize(380, 620)
  mainWindow.setPosition(x, y)
})

// IPC: update window position (called while dragging the bar)
ipcMain.handle('window:set-position', (_event, x: number, y: number) => {
  mainWindow?.setPosition(Math.round(x), Math.round(y))
})

// IPC: close the window (end session)
ipcMain.handle('window:close', () => {
  mainWindow?.close()
})

// IPC: click-through for transparent areas (session floating bar)
ipcMain.handle('window:set-ignore-mouse-events', (_event, ignore: boolean) => {
  mainWindow?.setIgnoreMouseEvents(ignore, { forward: true })
})

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
