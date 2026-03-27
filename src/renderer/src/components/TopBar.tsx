import React from 'react'
import { useApp } from '../context/AppContext'

type Tab = 'agent' | 'credits' | 'account'

const tabs: { id: Tab; label: string }[] = [
  { id: 'agent', label: '에이전트' },
  { id: 'credits', label: '크레딧' },
  { id: 'account', label: '계정' },
]

export function TopBar() {
  const { activeTab, setActiveTab, credits } = useApp()

  const formatCredits = () => {
    if (credits?.balance == null) return '—'
    const n = Number(credits.balance)
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
    return String(n)
  }

  return (
    <header
      className="flex items-center justify-between px-4 border-b border-slate-700 bg-surface-900"
      style={{ height: 48, WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left — macOS traffic light space + logo */}
      <div className="flex items-center gap-3" style={{ paddingLeft: 72 }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">T</span>
          </div>
          <span className="text-slate-100 font-semibold text-sm tracking-wide">TokenStream</span>
        </div>
      </div>

      {/* Center — Tabs */}
      <nav
        className="flex items-center gap-1"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Right — Credits */}
      <div
        className="flex items-center gap-2"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
          <span className="text-yellow-400 text-xs">💰</span>
          <span className="text-slate-200 text-xs font-mono font-medium">
            {formatCredits()} T
          </span>
        </div>
      </div>
    </header>
  )
}
