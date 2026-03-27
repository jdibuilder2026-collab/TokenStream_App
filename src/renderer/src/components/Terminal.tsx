import React, { useEffect, useRef } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'

interface TerminalProps {
  sessionId: string
  cwd?: string
}

export function Terminal({ sessionId, cwd }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<XTerm | null>(null)
  const fitRef = useRef<FitAddon | null>(null)
  const createdRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current || createdRef.current) return
    createdRef.current = true

    const term = new XTerm({
      theme: {
        background: '#0f172a',
        foreground: '#e2e8f0',
        cursor: '#60a5fa',
        cursorAccent: '#0f172a',
        selectionBackground: '#3b82f640',
        black: '#1e293b',
        red: '#f87171',
        green: '#4ade80',
        yellow: '#facc15',
        blue: '#60a5fa',
        magenta: '#c084fc',
        cyan: '#22d3ee',
        white: '#f1f5f9',
        brightBlack: '#475569',
        brightRed: '#fca5a5',
        brightGreen: '#86efac',
        brightYellow: '#fde047',
        brightBlue: '#93c5fd',
        brightMagenta: '#d8b4fe',
        brightCyan: '#67e8f9',
        brightWhite: '#f8fafc',
      },
      fontFamily: '"JetBrains Mono", Menlo, Monaco, Consolas, monospace',
      fontSize: 13,
      lineHeight: 1.5,
      cursorBlink: true,
      scrollback: 5000,
      allowTransparency: true,
    })

    const fit = new FitAddon()
    term.loadAddon(fit)
    term.open(containerRef.current)

    requestAnimationFrame(() => {
      fit.fit()
    })

    termRef.current = term
    fitRef.current = fit

    // Create PTY session
    window.electron.pty.create(sessionId, cwd).then((res) => {
      if (!res.ok) {
        term.writeln(`\r\n\x1b[31m오류: claude 바이너리를 찾을 수 없습니다.\x1b[0m`)
        term.writeln(`\x1b[33m먼저 claude를 설치해주세요: npm install -g @anthropic-ai/claude-code\x1b[0m\r\n`)
      }
    })

    // Receive PTY data
    const unsubData = window.electron.pty.onData(sessionId, (data) => {
      term.write(data)
    })

    // Receive PTY exit
    const unsubExit = window.electron.pty.onExit(sessionId, (code) => {
      term.writeln(`\r\n\x1b[2m[프로세스 종료: 코드 ${code}]\x1b[0m`)
    })

    // Send input to PTY
    term.onData((data) => {
      window.electron.pty.write(sessionId, data)
    })

    // Resize observer
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        fit.fit()
        window.electron.pty.resize(sessionId, term.cols, term.rows)
      })
    })
    observer.observe(containerRef.current)

    return () => {
      unsubData()
      unsubExit()
      observer.disconnect()
      term.dispose()
      window.electron.pty.kill(sessionId)
      createdRef.current = false
    }
  }, [sessionId, cwd])

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: '#0f172a' }}
    />
  )
}
