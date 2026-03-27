import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

export interface Config {
  serverUrl: string
  apiKey: string
}

const CONFIG_PATH = path.join(os.homedir(), '.tokenstream', 'config.json')
const CLAUDE_CONFIG_PATH = path.join(os.homedir(), '.claude', '.config.json')

export function loadConfig(): Config | null {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8')
    return JSON.parse(raw) as Config
  } catch {
    return null
  }
}

export function saveConfig(config: Config): void {
  const dir = path.dirname(CONFIG_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2))
}

export function setupClaudeBypass(apiKey: string): void {
  const claudeDir = path.dirname(CLAUDE_CONFIG_PATH)
  if (!fs.existsSync(claudeDir)) fs.mkdirSync(claudeDir, { recursive: true })

  const existing = (() => {
    try {
      return JSON.parse(fs.readFileSync(CLAUDE_CONFIG_PATH, 'utf-8'))
    } catch {
      return {}
    }
  })()

  const updated = {
    ...existing,
    hasCompletedOnboarding: true,
    primaryApiKeyHash: 'bypass-hash',
    hasAcknowledgedCostThreshold: true,
    oauthAccount: null,
    claudeApiKeyApprovedAt: new Date().toISOString(),
  }

  fs.writeFileSync(CLAUDE_CONFIG_PATH, JSON.stringify(updated, null, 2))
}

export function getEnv(config: Config): Record<string, string> {
  return {
    ANTHROPIC_BASE_URL: `${config.serverUrl}/proxy`,
    ANTHROPIC_API_KEY: config.apiKey,
  }
}
