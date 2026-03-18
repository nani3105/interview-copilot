import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  setOpacity: (opacity: number) => ipcRenderer.invoke('window:set-opacity', opacity),
  setAlwaysOnTop: (value: boolean) => ipcRenderer.invoke('window:set-always-on-top', value),
  captureScreenshot: () => ipcRenderer.invoke('screenshot:capture'),
})
