import { ipcMain, BrowserWindow } from 'electron'
import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path'
import { loadConfig, getEnv } from './config'

type IPty = import('node-pty').IPty

const sessions = new Map<string, IPty>()

function findClaudeBinary(): string {
  const candidates = [
    '/usr/local/bin/claude',
    '/opt/homebrew/bin/claude',
    path.join(os.homedir(), '.npm-global', 'bin', 'claude'),
    path.join(os.homedir(), '.nvm', 'versions', 'node', 'current', 'bin', 'claude'),
  ]

  // Also check PATH
  const pathDirs = (process.env.PATH || '').split(':')
  for (const dir of pathDirs) {
    candidates.push(path.join(dir, 'claude'))
  }

  for (const c of candidates) {
    if (fs.existsSync(c)) return c
  }

  return 'claude'
}

function buildEnv(config: ReturnType<typeof loadConfig>): NodeJS.ProcessEnv {
  const extra = config ? getEnv(config) : {}
  return {
    ...process.env,
    PATH: `/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:${process.env.PATH ?? ''}`,
    TERM: 'xterm-256color',
    COLORTERM: 'truecolor',
    ...extra,
  }
}

export function setupPtyHandlers(win: BrowserWindow): void {
  ipcMain.handle('pty:create', async (_, { sessionId, cwd, args }: { sessionId: string; cwd?: string; args?: string[] }) => {
    try {
      const { spawn } = await import('node-pty')
      const config = loadConfig()
      const env = buildEnv(config)
      const claudeBin = findClaudeBinary()
      const workDir = cwd || os.homedir()

      const pty = spawn(claudeBin, args ?? [], {
        name: 'xterm-256color',
        cols: 120,
        rows: 40,
        cwd: workDir,
        env: env as Record<string, string>,
      })

      pty.onData((data: string) => {
        win.webContents.send(`pty:data:${sessionId}`, data)
      })

      pty.onExit(({ exitCode }: { exitCode: number }) => {
        win.webContents.send(`pty:exit:${sessionId}`, exitCode)
        sessions.delete(sessionId)
      })

      sessions.set(sessionId, pty)
      return { ok: true }
    } catch (err: unknown) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  ipcMain.handle('pty:write', (_, { sessionId, data }: { sessionId: string; data: string }) => {
    sessions.get(sessionId)?.write(data)
  })

  ipcMain.handle('pty:resize', (_, { sessionId, cols, rows }: { sessionId: string; cols: number; rows: number }) => {
    sessions.get(sessionId)?.resize(cols, rows)
  })

  ipcMain.handle('pty:kill', (_, { sessionId }: { sessionId: string }) => {
    const pty = sessions.get(sessionId)
    if (pty) {
      try { pty.kill() } catch { /* ignore */ }
      sessions.delete(sessionId)
    }
  })
}

export function killAllSessions(): void {
  for (const pty of sessions.values()) {
    try { pty.kill() } catch { /* ignore */ }
  }
  sessions.clear()
}
