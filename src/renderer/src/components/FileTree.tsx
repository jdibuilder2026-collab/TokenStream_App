import React, { useEffect, useState } from 'react'

interface DirEntry {
  name: string
  isDir: boolean
  path: string
}

interface FileTreeNodeProps {
  entry: DirEntry
  depth: number
}

function FileTreeNode({ entry, depth }: FileTreeNodeProps) {
  const [open, setOpen] = useState(false)
  const [children, setChildren] = useState<DirEntry[]>([])

  const toggle = async () => {
    if (!entry.isDir) return
    if (!open) {
      const entries = await window.electron.fs.readDir(entry.path)
      setChildren(entries)
    }
    setOpen((v) => !v)
  }

  const icon = entry.isDir ? (open ? '📂' : '📁') : getFileIcon(entry.name)

  return (
    <div>
      <div
        className="flex items-center gap-1.5 px-2 py-0.5 rounded cursor-pointer hover:bg-slate-700 text-slate-300 hover:text-slate-100 text-xs"
        style={{ paddingLeft: 8 + depth * 12 }}
        onClick={toggle}
      >
        <span className="text-xs leading-none">{icon}</span>
        <span className="truncate">{entry.name}</span>
      </div>
      {open && children.map((c) => <FileTreeNode key={c.path} entry={c} depth={depth + 1} />)}
    </div>
  )
}

function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    ts: '🔷', tsx: '🔷', js: '🟡', jsx: '🟡',
    json: '📋', md: '📝', css: '🎨', html: '🌐',
    py: '🐍', sh: '⚙️', env: '🔒', gitignore: '🚫',
    png: '🖼️', jpg: '🖼️', svg: '🖼️',
  }
  return map[ext] ?? '📄'
}

interface FileTreeProps {
  rootPath: string
}

export function FileTree({ rootPath }: FileTreeProps) {
  const [entries, setEntries] = useState<DirEntry[]>([])
  const folderName = rootPath.split('/').pop() ?? rootPath

  useEffect(() => {
    window.electron.fs.readDir(rootPath).then(setEntries)
  }, [rootPath])

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">📁</span>
          <span className="text-slate-300 text-xs font-semibold truncate">{folderName}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {entries.map((e) => (
          <FileTreeNode key={e.path} entry={e} depth={0} />
        ))}
      </div>
    </div>
  )
}
