interface DirEntry {
  name: string
  isDir: boolean
  path: string
}

interface ElectronAPI {
  pty: {
    create: (sessionId: string, cwd?: string, args?: string[]) => Promise<{ ok: boolean; error?: string }>
    write: (sessionId: string, data: string) => Promise<void>
    resize: (sessionId: string, cols: number, rows: number) => Promise<void>
    kill: (sessionId: string) => Promise<void>
    onData: (sessionId: string, cb: (data: string) => void) => () => void
    onExit: (sessionId: string, cb: (code: number) => void) => () => void
  }
  config: {
    get: () => Promise<{ serverUrl: string; apiKey: string } | null>
    save: (config: { serverUrl: string; apiKey: string }) => Promise<{ ok: boolean }>
    validate: (serverUrl: string, apiKey: string) => Promise<{ ok: boolean; data?: unknown; error?: string }>
  }
  platform: {
    credits: () => Promise<{ ok: boolean; data?: unknown; error?: string }>
    usage: () => Promise<{ ok: boolean; data?: unknown; error?: string }>
    status: () => Promise<{ ok: boolean; data?: unknown; error?: string }>
  }
  dialog: {
    openFolder: () => Promise<string | null>
  }
  fs: {
    readDir: (dirPath: string) => Promise<DirEntry[]>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
  }
}

export {}
