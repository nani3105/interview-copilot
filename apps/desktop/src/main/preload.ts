import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  setOpacity: (opacity: number) => ipcRenderer.invoke('window:set-opacity', opacity),
  setAlwaysOnTop: (value: boolean) => ipcRenderer.invoke('window:set-always-on-top', value),
  captureScreenshot: () => ipcRenderer.invoke('screenshot:capture'),
  setIgnoreMouseEvents: (ignore: boolean) => ipcRenderer.invoke('window:set-ignore-mouse-events', ignore),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  setWindowSize: (w: number, h: number) => ipcRenderer.invoke('window:set-size', w, h),
  fitToBar: () => ipcRenderer.invoke('window:fit-to-bar'),
  expandForPanel: () => ipcRenderer.invoke('window:expand-for-panel'),
  collapseToBar: () => ipcRenderer.invoke('window:collapse-to-bar'),
  restoreFull: () => ipcRenderer.invoke('window:restore-full'),
  setWindowPosition: (x: number, y: number) => ipcRenderer.invoke('window:set-position', x, y),
})
