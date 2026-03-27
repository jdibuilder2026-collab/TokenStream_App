import React, { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'

interface UsageItem {
  date?: string
  tokens?: number
  amount?: number
  [key: string]: unknown
}

export function CreditsPage() {
  const { credits, refreshCredits } = useApp()
  const [usage, setUsage] = useState<UsageItem[] | null>(null)
  const [loadingUsage, setLoadingUsage] = useState(false)
  const [status, setStatus] = useState<{ ok: boolean; latency?: number } | null>(null)

  useEffect(() => {
    refreshCredits()
    loadUsage()
    checkStatus()
  }, [])

  const loadUsage = async () => {
    setLoadingUsage(true)
    try {
      const res = await window.electron.platform.usage()
      if (res.ok && res.data) {
        const data = res.data as Record<string, unknown>
        const list = (data.usage ?? data.items ?? data.history ?? []) as UsageItem[]
        setUsage(Array.isArray(list) ? list : [])
      }
    } catch {
      // ignore
    } finally {
      setLoadingUsage(false)
    }
  }

  const checkStatus = async () => {
    const start = Date.now()
    const res = await window.electron.platform.status()
    setStatus({ ok: res.ok, latency: Date.now() - start })
  }

  const formatBalance = (n: number | undefined) => {
    if (n == null) return '—'
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
    return String(n)
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="text-slate-100 text-xl font-semibold mb-6">크레딧 & 사용량</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* Balance */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <p className="text-slate-400 text-xs font-medium mb-2">현재 잔액</p>
          <p className="text-3xl font-bold text-slate-100">
            {formatBalance(credits?.balance)}
            <span className="text-slate-400 text-base font-normal ml-1">T</span>
          </p>
          <button
            onClick={refreshCredits}
            className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            새로고침
          </button>
        </div>

        {/* Server Status */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <p className="text-slate-400 text-xs font-medium mb-2">서버 상태</p>
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                status == null ? 'bg-slate-500' : status.ok ? 'bg-green-400' : 'bg-red-400'
              }`}
            />
            <span className="text-slate-100 font-semibold text-sm">
              {status == null ? '확인 중...' : status.ok ? '정상' : '오류'}
            </span>
          </div>
          {status?.latency != null && (
            <p className="text-slate-400 text-xs mt-1">{status.latency}ms</p>
          )}
          <button
            onClick={checkStatus}
            className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            재확인
          </button>
        </div>

        {/* Usage period */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <p className="text-slate-400 text-xs font-medium mb-2">최근 사용량</p>
          <p className="text-slate-100 font-semibold text-sm">
            {loadingUsage ? '로딩 중...' : usage ? `${usage.length}건` : '—'}
          </p>
          <p className="text-slate-500 text-xs mt-1">최근 30일</p>
        </div>
      </div>

      {/* Usage history */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl">
        <div className="px-5 py-4 border-b border-slate-700">
          <h2 className="text-slate-100 text-sm font-semibold">사용 내역</h2>
        </div>

        {loadingUsage ? (
          <div className="px-5 py-8 text-center text-slate-400 text-sm">로딩 중...</div>
        ) : !usage || usage.length === 0 ? (
          <div className="px-5 py-8 text-center text-slate-500 text-sm">사용 내역이 없습니다.</div>
        ) : (
          <div className="divide-y divide-slate-700">
            {usage.slice(0, 30).map((item, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between">
                <span className="text-slate-300 text-sm">
                  {String(item.date ?? item.created_at ?? `항목 ${i + 1}`)}
                </span>
                <span className="text-slate-100 text-sm font-mono">
                  {item.tokens != null
                    ? `${Number(item.tokens).toLocaleString()} T`
                    : item.amount != null
                    ? `${Number(item.amount).toLocaleString()}`
                    : '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
