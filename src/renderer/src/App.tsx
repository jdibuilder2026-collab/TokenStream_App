import React from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { TopBar } from './components/TopBar'
import { LoginPage } from './pages/LoginPage'
import { AgentPage } from './pages/AgentPage'
import { CreditsPage } from './pages/CreditsPage'
import { AccountPage } from './pages/AccountPage'

function AppInner() {
  const { config, activeTab } = useApp()

  if (!config || (!config.serverUrl && !config.apiKey)) {
    return <LoginPage />
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar />
      <main className="flex flex-1 overflow-hidden">
        {activeTab === 'agent' && <AgentPage />}
        {activeTab === 'credits' && <CreditsPage />}
        {activeTab === 'account' && <AccountPage />}
      </main>
    </div>
  )
}

export function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
