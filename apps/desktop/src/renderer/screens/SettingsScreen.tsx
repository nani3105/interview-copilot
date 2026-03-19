import { useNavigate } from 'react-router-dom'

export function SettingsScreen() {
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col bg-navy-900 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Settings</h2>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-slate-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-6 overflow-y-auto">
        <section className="space-y-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-slate-500">
            AI Provider
          </h3>
          <div className="space-y-2">
            {['Anthropic (Claude)', 'OpenAI', 'Google Gemini', 'Groq', 'Ollama (local)', 'OpenRouter'].map(
              (provider) => (
                <label
                  key={provider}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 hover:border-teal-600"
                >
                  <span className="text-sm text-slate-300">{provider}</span>
                  <input type="radio" name="provider" className="accent-teal-500" />
                </label>
              ),
            )}
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-xs font-medium uppercase tracking-wider text-slate-500">
            API Keys
          </h3>
          {['Anthropic', 'OpenAI', 'Groq', 'Gemini', 'OpenRouter'].map((key) => (
            <div key={key} className="space-y-1">
              <label className="text-xs text-slate-400">{key}</label>
              <input
                type="password"
                placeholder={`sk-...`}
                className="w-full rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-teal-500"
              />
            </div>
          ))}
        </section>
      </div>

      <button className="mt-6 w-full rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-500">
        Save Settings
      </button>
    </div>
  )
}
