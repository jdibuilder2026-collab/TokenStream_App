import * as https from 'https'
import * as http from 'http'
import { loadConfig } from './config'

async function apiFetch(
  endpoint: string,
  overrideUrl?: string,
  overrideKey?: string
): Promise<unknown> {
  const config = loadConfig()
  const serverUrl = overrideUrl ?? config?.serverUrl
  const apiKey = overrideKey ?? config?.apiKey

  if (!serverUrl || !apiKey) throw new Error('Not configured')

  const url = new URL(endpoint, serverUrl)
  const mod = url.protocol === 'https:' ? https : http

  return new Promise((resolve, reject) => {
    const req = mod.get(
      url.toString(),
      { headers: { 'x-api-key': apiKey } },
      (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          try {
            resolve(JSON.parse(data))
          } catch {
            resolve({ raw: data, statusCode: res.statusCode })
          }
        })
      }
    )
    req.on('error', reject)
    req.setTimeout(8000, () => {
      req.destroy()
      reject(new Error('Request timed out'))
    })
  })
}

export async function getCredits() {
  return apiFetch('/api/credits')
}

export async function getUsage() {
  return apiFetch('/api/usage')
}

export async function checkStatus(serverUrl?: string, apiKey?: string) {
  try {
    const data = await apiFetch('/api/status', serverUrl, apiKey)
    return { ok: true, data }
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}
