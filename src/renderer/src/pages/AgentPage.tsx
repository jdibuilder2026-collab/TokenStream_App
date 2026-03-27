import React, { useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { FileTree } from '../components/FileTree'
import { Terminal } from '../components/Terminal'

export function AgentPage() {
  const { currentFolder, setCurrentFolder } = useApp()
  const sessionIdRef = useRef(`session-${Date.now()}`)

  // Reset session when folder changes
  useEffect(() => {
    sessionIdRef.current = `session-${Date.now()}`
  }, [currentFolder])

  const openFolder = async () => {
    const folder = await window.electron.dialog.openFolder()
    if (folder) setCurrentFolder(folder)
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="flex flex-col w-56 shrink-0 border-r border-slate-700 bg-surface-800">
        <div className="p-3 border-b border-slate-700">
          <button
            onClick={openFolder}
            className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium py-2 px-3 rounded-md transition-colors"
          >
            <span>📁</span>
            <span>폴더 열기</span>
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {currentFolder ? (
            <FileTree rootPath={currentFolder} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs px-4 text-center gap-2">
              <span className="text-2xl">📂</span>
              <span>폴더를 열면 파일 트리가 표시됩니다</span>
            </div>
          )}
        </div>
      </div>

      {/* Main — Terminal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentFolder ? (
          <Terminal
            key={sessionIdRef.current}
            sessionId={sessionIdRef.current}
            cwd={currentFolder}
          />
        ) : (
          <EmptySplash onOpenFolder={openFolder} />
        )}
      </div>
    </div>
  )
}

function EmptySplash({ onOpenFolder }: { onOpenFolder: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl">
        🤖
      </div>
      <div>
        <h2 className="text-slate-100 text-lg font-semibold mb-2">AI 코딩 에이전트</h2>
        <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
          프로젝트 폴더를 열면 Claude Code가 해당 디렉토리에서 시작됩니다.
          파일 수정, 터미널 실행, Git 작업을 AI와 함께 진행하세요.
        </p>
      </div>
      <button
        onClick={onOpenFolder}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-5 rounded-lg transition-colors text-sm"
      >
        <span>📁</span>
        <span>폴더 열기</span>
      </button>
    </div>
  )
}
