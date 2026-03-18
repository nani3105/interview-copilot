import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

const VERSION = 'v0.1.0'

const SOUNDWAVE_BARS = [
  { height: 'h-8', opacity: 'opacity-40', delay: 0 },
  { height: 'h-12', opacity: 'opacity-60', delay: 0.1 },
  { height: 'h-16', opacity: 'opacity-100', delay: 0.2 },
  { height: 'h-10', opacity: 'opacity-70', delay: 0.15 },
  { height: 'h-14', opacity: 'opacity-50', delay: 0.05 },
]

const ANIMATION_DURATION = 2.5

export function SplashScreen() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(
      () => navigate('/onboarding'),
      ANIMATION_DURATION * 1000
    )
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-navy-900">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -right-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-primary/10 to-transparent blur-[100px]" />
      </div>

      {/* Branding */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
        {/* Soundwave logo */}
        <div className="relative mb-8 flex h-32 w-32 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex items-end gap-1.5">
            {SOUNDWAVE_BARS.map((bar, index) => (
              <motion.div
                key={index}
                data-testid="soundwave-bar"
                className={`w-2 rounded-full bg-primary ${bar.height} ${bar.opacity}`}
                animate={{ scaleY: [1, 1.3, 0.8, 1.2, 1] }}
                transition={{
                  duration: 1.4,
                  delay: bar.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </div>

        <h1 className="animate-slide-up text-center text-4xl font-bold tracking-tight text-slate-100">
          Interview <span className="text-primary">Co-pilot</span>
        </h1>

        <p className="animate-fade-in mt-4 max-w-xs text-center text-lg font-light text-slate-400">
          Your real-time AI partner for interview success.
        </p>
      </div>

      {/* Loading section */}
      <div className="relative z-10 mx-auto mb-12 w-full max-w-md px-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-base font-medium text-slate-100">
              Initializing Co-pilot
            </p>
            <Sparkles className="h-5 w-5 text-primary" />
          </div>

          <div
            role="progressbar"
            aria-label="Loading progress"
            className="h-1.5 w-full overflow-hidden rounded-full bg-navy-700"
          >
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: ANIMATION_DURATION, ease: 'easeInOut' }}
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Getting started...</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {VERSION}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
