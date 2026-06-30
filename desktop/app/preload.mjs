import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('openCalcDesktop', {
  getRuntimeInfo:          () => ipcRenderer.invoke('desktop:get-runtime-info'),
  checkForUpdates:         () => ipcRenderer.invoke('desktop:check-for-updates'),
  downloadPortableUpdate:  (assetUrl) => ipcRenderer.invoke('desktop:download-portable-update', assetUrl),
  openExternal:            (url) => ipcRenderer.invoke('desktop:open-external', url),

  // Contributor mode
  getContributorStatus:    () => ipcRenderer.invoke('desktop:contributor-status'),
  cloneRepo:               () => ipcRenderer.invoke('desktop:clone-repo'),
  setGitHubToken:          (token) => ipcRenderer.invoke('desktop:set-github-token', token),
  getGitHubToken:          () => ipcRenderer.invoke('desktop:get-github-token'),
  onCloneProgress:         (cb) => {
    const handler = (_event, data) => cb(data)
    ipcRenderer.on('desktop:clone-progress', handler)
    return () => ipcRenderer.off('desktop:clone-progress', handler)
  },
})
