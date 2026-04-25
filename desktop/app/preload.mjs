import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('openCalcDesktop', {
  getRuntimeInfo: () => ipcRenderer.invoke('desktop:get-runtime-info'),
  checkForUpdates: () => ipcRenderer.invoke('desktop:check-for-updates'),
  downloadPortableUpdate: (assetUrl) => ipcRenderer.invoke('desktop:download-portable-update', assetUrl),
  openExternal: (url) => ipcRenderer.invoke('desktop:open-external', url),
})
