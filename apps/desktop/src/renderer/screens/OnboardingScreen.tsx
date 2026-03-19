import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWindowFit } from '../hooks/useWindowFit'
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Lock,
  UploadCloud,
  User,
  X,
} from 'lucide-react'

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const ACCEPTED_TYPES = ['.pdf', '.docx']

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function OnboardingScreen() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const rootRef = useWindowFit(460)

  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  function handleFileSelect(selected: File) {
    setFileError('')
    if (selected.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`File exceeds 5MB limit (${formatFileSize(selected.size)})`)
      return
    }
    setFile(selected)
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (selected) handleFileSelect(selected)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) handleFileSelect(dropped)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setNameError('Full name is required')
      return
    }
    navigate('/job-context')
  }

  return (
    <div ref={rootRef} className="flex flex-col bg-navy-900 text-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-primary/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-primary/10 hover:text-slate-100"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-lg font-bold tracking-tight">
            Interview Co-pilot
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-primary/20">
            <div className="h-full w-1/3 rounded-full bg-primary" />
          </div>
          <span className="text-xs font-medium uppercase tracking-wider text-primary/70">
            Step 1 of 3
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="px-6 py-10">
        <div className="w-full max-w-xl">
          {/* Heading */}
          <div className="mb-10">
            <h1 className="mb-3 text-3xl font-bold">Complete your profile</h1>
            <p className="leading-relaxed text-slate-400">
              Personalize your interview experience. Your resume will be used to
              generate tailored talking points and behavioral answers during your
              live sessions.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {/* Full Name */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="full-name"
                className="text-sm font-semibold uppercase tracking-wide text-slate-400"
              >
                Full Name <span className="text-primary">*</span>
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-primary">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="full-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (nameError) setNameError('')
                  }}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-xl border-2 border-primary/20 bg-navy-800 py-4 pl-12 pr-4 text-slate-100 outline-none placeholder:text-slate-500 transition-colors focus:border-primary"
                  aria-describedby={nameError ? 'name-error' : undefined}
                />
              </div>
              {nameError && (
                <p
                  id="name-error"
                  role="alert"
                  className="text-sm text-red-400"
                >
                  {nameError}
                </p>
              )}
            </div>

            {/* Resume Upload */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Resume / CV
              </span>

              {file ? (
                <div className="flex items-center justify-between rounded-xl border-2 border-primary/30 bg-primary/5 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <UploadCloud className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-slate-100">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null)
                      setFileError('')
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="rounded-lg p-1 text-slate-400 hover:text-slate-100"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  data-testid="drop-zone"
                  aria-label="Upload resume"
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`group flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-10 transition-colors ${
                    isDragging
                      ? 'border-primary bg-primary/10'
                      : 'border-primary/30 bg-primary/5 hover:border-primary/50'
                  }`}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                    <UploadCloud className="h-8 w-8" />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-semibold">
                      Drop your resume here or{' '}
                      <span className="text-primary">browse</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Supports PDF, DOCX (Max 5 MB)
                    </p>
                  </div>
                </div>
              )}

              {fileError && (
                <p role="alert" className="text-sm text-red-400">
                  {fileError}
                </p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                onChange={handleFileInputChange}
                className="hidden"
                aria-hidden="true"
              />
            </div>

            {/* Form footer */}
            <div className="flex items-center justify-between border-t border-primary/10 pt-6">
              <div className="flex items-center gap-2 text-slate-400">
                <Lock className="h-4 w-4" />
                <span className="text-xs">Data is encrypted and private</span>
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
              >
                Next Step
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Bottom bar */}
      <footer className="flex justify-center border-t border-primary/10 bg-primary/5 px-4 py-3">
        <div className="flex gap-8">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            Copilot Engine Active
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Globe className="h-4 w-4" />
            English (US)
          </div>
        </div>
      </footer>
    </div>
  )
}
