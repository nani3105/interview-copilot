import { useNavigate } from 'react-router-dom'

export function JobContextScreen() {
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-white">Job Details</h2>
          <p className="text-sm text-slate-400">Add context to get better answers</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Job URL <span className="normal-case text-slate-500">(optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://jobs.example.com/..."
              className="w-full rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Job Title
            </label>
            <input
              type="text"
              placeholder="Senior Software Engineer"
              className="w-full rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Job Description
            </label>
            <textarea
              rows={5}
              placeholder="Paste the job description here..."
              className="w-full resize-none rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/onboarding')}
            className="flex-1 rounded-lg border border-navy-600 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white focus:outline-none"
          >
            ← Back
          </button>
          <button
            onClick={() => navigate('/session')}
            className="flex-1 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-navy-900"
          >
            Start Session →
          </button>
        </div>
      </div>
    </div>
  )
}
