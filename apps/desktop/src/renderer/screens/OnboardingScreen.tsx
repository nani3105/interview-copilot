import { useNavigate } from 'react-router-dom'

export function OnboardingScreen() {
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-white">Interview Copilot</h1>
          <p className="text-sm text-slate-400">Your real-time AI interview assistant</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Your Name
            </label>
            <input
              type="text"
              placeholder="John Smith"
              className="w-full rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Resume
            </label>
            <div className="flex h-20 w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-navy-600 bg-navy-800 text-sm text-slate-500 transition-colors hover:border-teal-500 hover:text-teal-400">
              Drop PDF or DOCX here, or click to browse
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/job-context')}
          className="w-full rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-navy-900"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
