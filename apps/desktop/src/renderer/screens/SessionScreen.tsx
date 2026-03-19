import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  Camera,
  MessageSquare,
  Mic,
  MicOff,
  MoreVertical,
  Sparkles,
  Monitor,
  Square,
  X,
  Eye,
  EyeOff,
} from 'lucide-react'

type PanelMode = 'ai-answer' | 'analyze' | 'chat' | 'transcription' | null

type ElectronAPI = {
  closeWindow?: () => void
  fitToBar?: () => void
  expandForPanel?: () => void
  collapseToBar?: () => void
  restoreFull?: () => void
  setIgnoreMouseEvents?: (ignore: boolean) => void
}

function getAPI(): ElectronAPI {
  return ((window as Record<string, unknown>).electronAPI as ElectronAPI) ?? {}
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const noDrag = { WebkitAppRegion: 'no-drag' } as React.CSSProperties

export function SessionScreen() {
  const navigate = useNavigate()

  const [elapsed, setElapsed] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [activePanel, setActivePanel] = useState<PanelMode>(null)
  const [isHidden, setIsHidden] = useState(false)
  const [chatInput, setChatInput] = useState('')

  // Resize window to bar size on mount; restore on unmount
  useEffect(() => {
    const api = getAPI()
    api.fitToBar?.()
    api.setIgnoreMouseEvents?.(false)
    return () => {
      api.restoreFull?.()
      api.setIgnoreMouseEvents?.(false)
    }
  }, [])

  // Expand / collapse window when panel opens or closes.
  // Guard: never call collapseToBar unless the panel was actually open first,
  // otherwise the initial null state would shift the window 288 px downward.
  const panelEverOpened = useRef(false)
  useEffect(() => {
    const api = getAPI()
    if (activePanel) {
      panelEverOpened.current = true
      api.expandForPanel?.()
    } else if (panelEverOpened.current) {
      api.collapseToBar?.()
    }
  }, [activePanel])

  const togglePanel = useCallback((mode: PanelMode) => {
    setActivePanel((prev) => (prev === mode ? null : mode))
  }, [])

  const buttonClass =
    'flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-100'
  const activeButtonClass =
    'flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-primary transition-colors bg-primary/15 hover:bg-primary/20'

  // Elapsed timer
  useEffect(() => {
    const id = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  if (isHidden) {
    return (
      <div className="fixed bottom-2 right-2 z-50">
        <button
          aria-label="Show session"
          onClick={() => {
            setIsHidden(false)
            getAPI().fitToBar?.()
          }}
          style={noDrag}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-800/90 text-slate-400 shadow-lg backdrop-blur-md border border-white/10 transition-colors hover:text-slate-100"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Floating AI Panel — fills space above the bar */}
      {activePanel && (
        <aside
          role="complementary"
          aria-label="AI panel"
          className="flex flex-1 flex-col rounded-2xl border border-white/10 bg-navy-900/95 shadow-2xl backdrop-blur-xl mx-1 mb-1 overflow-hidden"
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        >
          {/* Panel header */}
          <div
            className="flex items-center justify-between border-b border-white/10 px-4 py-3"
            style={noDrag}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {activePanel === 'ai-answer' && 'AI Answer'}
              {activePanel === 'analyze' && 'Screen Analysis'}
              {activePanel === 'chat' && 'Chat'}
              {activePanel === 'transcription' && 'Transcription'}
            </span>
            <button
              aria-label="Close panel"
              onClick={() => setActivePanel(null)}
              style={noDrag}
              className="rounded-lg p-1 text-slate-500 transition-colors hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Panel body */}
          <div className="flex-1 overflow-y-auto p-4" style={noDrag}>
            {activePanel === 'ai-answer' && (
              <p className="text-sm leading-relaxed text-slate-400 italic">
                Waiting for a question from the interviewer...
              </p>
            )}
            {activePanel === 'analyze' && (
              <p className="text-sm leading-relaxed text-slate-400 italic">
                Capture a screenshot to analyze coding problems or visual content.
              </p>
            )}
            {activePanel === 'transcription' && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
                  Current notes
                </p>
                <p className="text-sm text-slate-400 italic">
                  No live transcript yet. Start recording...
                </p>
              </div>
            )}
            {activePanel === 'chat' && (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-slate-400 italic">Ask anything or add context.</p>
                <input
                  type="text"
                  aria-label="Ask anything"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your question..."
                  className="w-full rounded-xl border border-white/10 bg-navy-800 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-primary"
                />
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Pill Bar — always at the bottom, draggable via OS */}
      <nav
        role="region"
        aria-label="Session controls"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        className="flex items-center gap-1 rounded-2xl border border-white/10 bg-navy-900/90 px-3 py-2 shadow-2xl backdrop-blur-xl select-none mx-1 mb-1"
      >
        {/* Elapsed timer */}
        <span
          style={noDrag}
          className="min-w-[36px] text-center text-xs font-mono font-semibold text-slate-400 px-1"
        >
          {formatTime(elapsed)}
        </span>

        {/* Stop / close session */}
        <button
          aria-label="Stop session"
          onClick={() => getAPI().closeWindow?.()}
          style={noDrag}
          className="flex items-center justify-center rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-500/15 hover:text-red-300"
        >
          <Square className="h-3 w-3 fill-current" />
        </button>

        <div className="mx-1 h-6 w-px bg-white/10" />

        {/* Transcription / Equalizer */}
        <button
          aria-label="Transcription"
          onClick={() => togglePanel('transcription')}
          style={noDrag}
          className={activePanel === 'transcription' ? activeButtonClass : buttonClass}
        >
          <Activity className="h-4 w-4" />
          <span className="text-[9px] leading-none">Notes</span>
        </button>

        {/* Screenshot */}
        <button aria-label="Screenshot" style={noDrag} className={buttonClass}>
          <Camera className="h-4 w-4" />
          <span className="text-[9px] leading-none">Capture</span>
        </button>

        {/* Mic */}
        {isRecording ? (
          <button
            aria-label="Stop recording"
            onClick={() => setIsRecording(false)}
            style={noDrag}
            className="flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-red-400 transition-colors bg-red-500/15 hover:bg-red-500/20"
          >
            <MicOff className="h-4 w-4" />
            <span className="text-[9px] leading-none">Stop</span>
          </button>
        ) : (
          <button
            aria-label="Record mic"
            onClick={() => setIsRecording(true)}
            style={noDrag}
            className={buttonClass}
          >
            <Mic className="h-4 w-4" />
            <span className="text-[9px] leading-none">Mic</span>
          </button>
        )}

        <div className="mx-1 h-6 w-px bg-white/10" />

        {/* AI Answer */}
        <button
          aria-label="AI Answer"
          onClick={() => togglePanel('ai-answer')}
          style={noDrag}
          className={activePanel === 'ai-answer' ? activeButtonClass : buttonClass}
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-[9px] leading-none">Answer</span>
        </button>

        {/* Analyze Screen */}
        <button
          aria-label="Analyze Screen"
          onClick={() => togglePanel('analyze')}
          style={noDrag}
          className={activePanel === 'analyze' ? activeButtonClass : buttonClass}
        >
          <Monitor className="h-4 w-4" />
          <span className="text-[9px] leading-none">Analyze</span>
        </button>

        {/* Chat */}
        <button
          aria-label="Chat"
          onClick={() => togglePanel('chat')}
          style={noDrag}
          className={activePanel === 'chat' ? activeButtonClass : buttonClass}
        >
          <MessageSquare className="h-4 w-4" />
          <span className="text-[9px] leading-none">Chat</span>
        </button>

        <div className="mx-1 h-6 w-px bg-white/10" />

        {/* Recording indicator */}
        {isRecording && (
          <span
            data-testid="recording-indicator"
            className="h-2 w-2 animate-pulse rounded-full bg-red-500"
          />
        )}

        {/* Hide button */}
        <button
          aria-label="Hide session"
          onClick={() => setIsHidden(true)}
          style={noDrag}
          className={buttonClass}
        >
          <EyeOff className="h-4 w-4" />
          <span className="text-[9px] leading-none">Hide</span>
        </button>

        {/* More Options */}
        <button
          aria-label="More options"
          onClick={() => navigate('/settings')}
          style={noDrag}
          className={buttonClass}
        >
          <MoreVertical className="h-4 w-4" />
          <span className="text-[9px] leading-none">More</span>
        </button>
      </nav>
    </div>
  )
}
