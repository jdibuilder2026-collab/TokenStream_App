import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

export function AccountPage() {
  const { config, setConfig } = useApp()
  const [serverUrl, setServerUrl] = useState(config?.serverUrl ?? '')
  const [apiKey, setApiKey] = useState(config?.apiKey ?? '')
  const [showKey, setShowKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null)

  useEffect(() => {
    setServerUrl(config?.serverUrl ?? '')
    setApiKey(config?.apiKey ?? '')
  }, [config])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!serverUrl.trim() || !apiKey.trim()) return
    setSaving(true)
    setSaveMsg('')
    try {
      await window.electron.config.save({ serverUrl: serverUrl.trim(), apiKey: apiKey.trim() })
      setConfig({ serverUrl: serverUrl.trim(), apiKey: apiKey.trim() })
      setSaveMsg('저장되었습니다.')
    } catch {
      setSaveMsg('저장 실패')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(''), 3000)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await window.electron.config.validate(serverUrl.trim(), apiKey.trim())
      setTestResult({ ok: res.ok, msg: res.ok ? '연결 성공!' : (res.error ?? '연결 실패') })
    } catch (err: unknown) {
      setTestResult({ ok: false, msg: err instanceof Error ? err.message : '오류' })
    } finally {
      setTesting(false)
    }
  }

  const handleLogout = async () => {
    if (!confirm('로그아웃하면 설정이 초기화됩니다. 계속하시겠습니까?')) return
    await window.electron.config.save({ serverUrl: '', apiKey: '' })
    setConfig(null)
  }

  const maskedKey = apiKey ? apiKey.slice(0, 8) + '•'.repeat(Math.max(0, apiKey.length - 8)) : ''

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-lg">
      <h1 className="text-slate-100 text-xl font-semibold mb-6">계정 설정</h1>

      <form onSubmit={handleSave} className="flex flex-col gap-5">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col gap-4">
          <h2 className="text-slate-200 text-sm font-semibold">서버 연결</h2>

          <div>
            <label className="block text-slate-400 text-xs font-medium mb-1.5">서버 URL</label>
            <input
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="http://your-server:9090"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3.5 py-2.5 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-medium mb-1.5">API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="cpk_..."
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3.5 py-2.5 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors pr-16"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                {showKey ? '숨기기' : '보기'}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || !serverUrl.trim() || !apiKey.trim()}
              className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-200 text-sm font-medium py-2 rounded-lg transition-colors"
            >
              {testing ? '테스트 중...' : '연결 테스트'}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>

          {testResult && (
            <div
              className={`text-xs px-3 py-2 rounded-lg ${
                testResult.ok
                  ? 'bg-green-900/30 border border-green-700 text-green-300'
                  : 'bg-red-900/30 border border-red-700 text-red-300'
              }`}
            >
              {testResult.msg}
            </div>
          )}

          {saveMsg && (
            <div className="text-xs px-3 py-2 rounded-lg bg-blue-900/30 border border-blue-700 text-blue-300">
              {saveMsg}
            </div>
          )}
        </div>

        {/* Current config info */}
        {config && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h2 className="text-slate-200 text-sm font-semibold mb-3">현재 연결 정보</h2>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">서버</span>
                <span className="text-slate-200 font-mono">{config.serverUrl}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">API Key</span>
                <span className="text-slate-200 font-mono">{maskedKey}</span>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full text-red-400 hover:text-red-300 hover:bg-red-900/20 border border-red-900/40 text-sm font-medium py-2.5 rounded-lg transition-colors"
        >
          로그아웃
        </button>
      </form>
    </div>
  )
}
