import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

type Tab = 'agent' | 'credits' | 'account'

interface Config {
  serverUrl: string
  apiKey: string
}

interface Credits {
  balance?: number
  unit?: string
  raw?: unknown
}

interface AppContextValue {
  config: Config | null
  setConfig: (c: Config | null) => void
  currentFolder: string | null
  setCurrentFolder: (f: string | null) => void
  activeTab: Tab
  setActiveTab: (t: Tab) => void
  credits: Credits | null
  refreshCredits: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<Config | null>(null)
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('agent')
  const [credits, setCredits] = useState<Credits | null>(null)

  const setConfig = (c: Config | null) => {
    setConfigState(c)
  }

  const refreshCredits = useCallback(async () => {
    if (!config) return
    try {
      const res = await window.electron.platform.credits()
      if (res.ok && res.data) {
        const data = res.data as Record<string, unknown>
        setCredits({
          balance: (data.balance ?? data.tokens ?? data.credits) as number,
          unit: (data.unit ?? 'T') as string,
          raw: data,
        })
      }
    } catch {
      // ignore
    }
  }, [config])

  // Load config on mount
  useEffect(() => {
    window.electron.config.get().then((c) => setConfigState(c))
  }, [])

  // Poll credits every 30s
  useEffect(() => {
    if (!config) return
    refreshCredits()
    const id = setInterval(refreshCredits, 30000)
    return () => clearInterval(id)
  }, [config, refreshCredits])

  return (
    <AppContext.Provider
      value={{ config, setConfig, currentFolder, setCurrentFolder, activeTab, setActiveTab, credits, refreshCredits }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
