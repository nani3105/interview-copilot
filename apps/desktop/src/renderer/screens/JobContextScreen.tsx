import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWindowFit } from '../hooks/useWindowFit'
import { ArrowLeft, Play } from 'lucide-react'

export function JobContextScreen() {
  const navigate = useNavigate()
  const rootRef = useWindowFit(460)

  const [company, setCompany] = useState('')
  const [companyError, setCompanyError] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [description, setDescription] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!company.trim()) {
      setCompanyError('Company name is required')
      return
    }
    navigate('/session')
  }

  const inputClass =
    'w-full rounded-xl border-2 border-primary/20 bg-navy-800 h-14 px-4 ' +
    'text-slate-100 placeholder:text-slate-500 outline-none transition-colors ' +
    'focus:border-primary focus:ring-2 focus:ring-primary/20'

  return (
    <div ref={rootRef} className="relative flex flex-col overflow-x-hidden bg-navy-900 text-slate-100">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -right-1/4 -top-1/4 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      {/* Top app bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-navy-900/90 px-4 py-3 backdrop-blur-sm border-b border-primary/10">
        <button
          type="button"
          onClick={() => navigate('/onboarding')}
          aria-label="Go back"
          className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>

        <h2 className="flex-1 text-center text-lg font-bold tracking-tight pr-10">
          Interview Setup
        </h2>

        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-primary/20">
            <div className="h-full w-2/3 rounded-full bg-primary" />
          </div>
          <span className="text-xs font-medium uppercase tracking-wider text-primary/70 whitespace-nowrap">
            Step 2 of 3
          </span>
        </div>
      </header>

      {/* Heading */}
      <div className="px-6 pb-4 pt-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Job Context</h1>
        <p className="text-base leading-normal text-slate-400">
          Provide details about the role to help your co-pilot prepare for your
          specific interview.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 px-6 py-4">
        {/* Company Name */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="company-name"
            className="text-sm font-semibold uppercase tracking-wider text-slate-300"
          >
            Company Name <span className="text-primary">*</span>
          </label>
          <input
            id="company-name"
            type="text"
            value={company}
            onChange={(e) => {
              setCompany(e.target.value)
              if (companyError) setCompanyError('')
            }}
            placeholder="e.g. Google, Stripe, or Startup Inc."
            className={inputClass}
            aria-describedby={companyError ? 'company-error' : undefined}
          />
          {companyError && (
            <p id="company-error" role="alert" className="text-sm text-red-400">
              {companyError}
            </p>
          )}
        </div>

        {/* Job URL */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="job-url"
            className="text-sm font-semibold uppercase tracking-wider text-slate-300"
          >
            Job URL{' '}
            <span className="normal-case text-slate-500 font-normal">(Optional)</span>
          </label>
          <input
            id="job-url"
            type="url"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            placeholder="https://linkedin.com/jobs/..."
            className={inputClass}
          />
        </div>

        {/* Job Description */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="job-description"
              className="text-sm font-semibold uppercase tracking-wider text-slate-300"
            >
              Job Description
            </label>
            <span className="text-xs italic text-slate-500">
              Paste full text for better accuracy
            </span>
          </div>
          <textarea
            id="job-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Paste the job requirements, responsibilities, and qualifications here..."
            className="w-full resize-none rounded-xl border-2 border-primary/20 bg-navy-800 p-4 text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[280px] leading-relaxed"
          />
        </div>

        {/* Action footer */}
        <div className="mt-4 pb-12">
          <button
            type="submit"
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-bold text-lg text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
          >
            Start Session
            <Play className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </button>
          <p className="mt-4 text-center text-sm text-slate-500">
            Your data is used only to personalize the co-pilot session.
          </p>
        </div>
      </form>
    </div>
  )
}
