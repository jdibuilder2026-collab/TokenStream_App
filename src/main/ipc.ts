import { ipcMain, dialog, BrowserWindow } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { loadConfig, saveConfig, setupClaudeBypass } from './config'
import { getCredits, getUsage, checkStatus } from './platform'
import { setupPtyHandlers } from './pty'

interface DirEntry {
  name: string
  isDir: boolean
  path: string
}

export function setupIpcHandlers(win: BrowserWindow): void {
  setupPtyHandlers(win)

  // Config
  ipcMain.handle('config:get', () => loadConfig())

  ipcMain.handle('config:save', (_, config: { serverUrl: string; apiKey: string }) => {
    saveConfig(config)
    setupClaudeBypass(config.apiKey)
    return { ok: true }
  })

  ipcMain.handle('config:validate', async (_, { serverUrl, apiKey }: { serverUrl: string; apiKey: string }) => {
    return checkStatus(serverUrl, apiKey)
  })

  // Platform
  ipcMain.handle('platform:credits', async () => {
    try {
      return { ok: true, data: await getCredits() }
    } catch (err: unknown) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  ipcMain.handle('platform:usage', async () => {
    try {
      return { ok: true, data: await getUsage() }
    } catch (err: unknown) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  ipcMain.handle('platform:status', async () => {
    return checkStatus()
  })

  // File system
  ipcMain.handle('dialog:openFolder', async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
      title: '프로젝트 폴더 선택',
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  ipcMain.handle('fs:readDir', (_, dirPath: string): DirEntry[] => {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true })
      return entries
        .filter((e) => !e.name.startsWith('.') || e.name === '.gitignore')
        .map((e) => ({
          name: e.name,
          isDir: e.isDirectory(),
          path: path.join(dirPath, e.name),
        }))
        .sort((a, b) => {
          if (a.isDir !== b.isDir) return a.isDir ? -1 : 1
          return a.name.localeCompare(b.name)
        })
    } catch {
      return []
    }
  })
}
