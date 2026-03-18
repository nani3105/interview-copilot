import { useNavigate } from 'react-router-dom'

export function SessionScreen() {
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col bg-navy-900">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-navy-700 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse-dot rounded-full bg-red-500" />
          <span className="text-xs font-medium text-slate-300">LIVE</span>
        </div>
        <span className="text-xs text-slate-500">Senior Software Engineer</span>
        <button
          onClick={() => navigate('/settings')}
          className="text-xs text-slate-500 hover:text-slate-300"
        >
          ⚙
        </button>
      </div>

      {/* Interviewer transcript */}
      <div className="border-b border-navy-700 px-4 py-3">
        <div className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
          Interviewer
        </div>
        <p className="text-sm text-slate-300 italic">Listening...</p>
      </div>

      {/* LLM Answer */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="mb-1 text-xs font-medium uppercase tracking-wider text-teal-500">
          AI Answer
        </div>
        <p className="text-sm leading-relaxed text-slate-200">
          Answer will appear here once the interviewer asks a question.
        </p>
      </div>

      {/* Controls */}
      <div className="border-t border-navy-700 px-4 py-3 space-y-3">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-navy-600 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-500 hover:text-white">
            📸 Screenshot
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-navy-600 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-500 hover:text-white">
            🎙 Record
          </button>
          <button
            onClick={() => navigate('/onboarding')}
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-red-900 px-3 py-1.5 text-xs text-red-400 hover:border-red-700 hover:text-red-300"
          >
            ⏹ End
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Auto-Listen</span>
          <div className="h-5 w-9 rounded-full bg-navy-600" />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Opacity</span>
          <div className="h-1.5 w-32 rounded-full bg-navy-600">
            <div className="h-1.5 w-2/3 rounded-full bg-teal-500" />
          </div>
        </div>
      </div>
    </div>
  )
}
