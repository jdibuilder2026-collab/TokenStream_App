import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  pty: {
    create: (sessionId: string, cwd?: string, args?: string[]) =>
      ipcRenderer.invoke('pty:create', { sessionId, cwd, args }),

    write: (sessionId: string, data: string) =>
      ipcRenderer.invoke('pty:write', { sessionId, data }),

    resize: (sessionId: string, cols: number, rows: number) =>
      ipcRenderer.invoke('pty:resize', { sessionId, cols, rows }),

    kill: (sessionId: string) =>
      ipcRenderer.invoke('pty:kill', { sessionId }),

    onData: (sessionId: string, cb: (data: string) => void): (() => void) => {
      const channel = `pty:data:${sessionId}`
      const handler = (_: Electron.IpcRendererEvent, data: string) => cb(data)
      ipcRenderer.on(channel, handler)
      return () => ipcRenderer.removeListener(channel, handler)
    },

    onExit: (sessionId: string, cb: (code: number) => void): (() => void) => {
      const channel = `pty:exit:${sessionId}`
      const handler = (_: Electron.IpcRendererEvent, code: number) => cb(code)
      ipcRenderer.on(channel, handler)
      return () => ipcRenderer.removeListener(channel, handler)
    },
  },

  config: {
    get: () => ipcRenderer.invoke('config:get'),
    save: (config: { serverUrl: string; apiKey: string }) =>
      ipcRenderer.invoke('config:save', config),
    validate: (serverUrl: string, apiKey: string) =>
      ipcRenderer.invoke('config:validate', { serverUrl, apiKey }),
  },

  platform: {
    credits: () => ipcRenderer.invoke('platform:credits'),
    usage: () => ipcRenderer.invoke('platform:usage'),
    status: () => ipcRenderer.invoke('platform:status'),
  },

  dialog: {
    openFolder: (): Promise<string | null> => ipcRenderer.invoke('dialog:openFolder'),
  },

  fs: {
    readDir: (dirPath: string): Promise<{ name: string; isDir: boolean; path: string }[]> =>
      ipcRenderer.invoke('fs:readDir', dirPath),
  },
}

contextBridge.exposeInMainWorld('electron', electronAPI)
