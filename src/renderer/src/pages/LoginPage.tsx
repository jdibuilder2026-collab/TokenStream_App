import React, { useState } from 'react'
import { useApp } from '../context/AppContext'

export function LoginPage() {
  const { setConfig } = useApp()
  const [serverUrl, setServerUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!serverUrl.trim() || !apiKey.trim()) return

    setLoading(true)
    setError('')

    try {
      const res = await window.electron.config.validate(serverUrl.trim(), apiKey.trim())
      if (!res.ok) {
        setError(res.error ?? '서버 연결에 실패했습니다. URL과 API Key를 확인해주세요.')
        setLoading(false)
        return
      }

      await window.electron.config.save({ serverUrl: serverUrl.trim(), apiKey: apiKey.trim() })
      setConfig({ serverUrl: serverUrl.trim(), apiKey: apiKey.trim() })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-full bg-surface-900">
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-900/40">
            <span className="text-white text-2xl font-bold">T</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">TokenStream</h1>
          <p className="text-slate-400 text-sm mt-1">AI 코딩 에이전트 데스크탑</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">
              서버 URL
            </label>
            <input
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="http://your-server:9090"
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3.5 py-2.5 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="cpk_..."
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3.5 py-2.5 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg px-3.5 py-2.5 text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !serverUrl.trim() || !apiKey.trim()}
            className="mt-2 w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            {loading ? '연결 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}
