import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SplashScreen } from '../SplashScreen'

// ---------------------------------------------------------------------------
// framer-motion mock
// Replaces every motion.* element with its plain HTML counterpart so jsdom
// does not choke on animation props (initial, animate, transition, etc.).
// ---------------------------------------------------------------------------
vi.mock('framer-motion', () => {
  const createMotionComponent = (tag: string) => {
    const Component = ({ children, ...rest }: React.HTMLAttributes<HTMLElement> & Record<string, unknown>) => {
      // Strip framer-specific props before forwarding to the DOM element so
      // React does not warn about unknown attributes.
      const {
        initial: _initial,
        animate: _animate,
        exit: _exit,
        transition: _transition,
        variants: _variants,
        whileHover: _whileHover,
        whileTap: _whileTap,
        whileFocus: _whileFocus,
        layout: _layout,
        layoutId: _layoutId,
        onAnimationComplete,
        ...domProps
      } = rest as Record<string, unknown>

      // When the component mounts we immediately fire onAnimationComplete if
      // provided, simulating an instant animation finish. This is what drives
      // the navigation-after-animation test.
      const ref = { current: false }
      if (!ref.current && typeof onAnimationComplete === 'function') {
        ref.current = true
        // Schedule microtask so the component has finished its first render.
        Promise.resolve().then(() => (onAnimationComplete as () => void)())
      }

      return React.createElement(tag, domProps, children)
    }
    Component.displayName = `motion.${tag}`
    return Component
  }

  const tags = [
    'div', 'span', 'section', 'article', 'header', 'footer',
    'main', 'nav', 'aside', 'h1', 'h2', 'h3', 'h4', 'p',
    'ul', 'li', 'button', 'a', 'img', 'svg', 'path',
  ]

  const motion = tags.reduce<Record<string, unknown>>((acc, tag) => {
    acc[tag] = createMotionComponent(tag)
    return acc
  }, {})

  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  }
})

// ---------------------------------------------------------------------------
// react-router-dom mock — intercept useNavigate
// ---------------------------------------------------------------------------
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

// React must be in scope because the framer-motion mock calls React.createElement
import React from 'react'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function renderSplashScreen() {
  return render(
    <MemoryRouter>
      <SplashScreen />
    </MemoryRouter>,
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('SplashScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockNavigate.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('renders the app title "Interview Co-pilot"', () => {
    renderSplashScreen()
    expect(
      screen.getByRole('heading', { name: /interview co-pilot/i }),
    ).toBeInTheDocument()
  })

  it('renders the subtitle text', () => {
    renderSplashScreen()
    // The subtitle describes the product's core value proposition.
    // We match on a partial string so minor copy tweaks do not break the test.
    expect(
      screen.getByText(/real-time ai/i),
    ).toBeInTheDocument()
  })

  it('renders the "Initializing Co-pilot" status label', () => {
    renderSplashScreen()
    expect(screen.getByText(/initializing co-pilot/i)).toBeInTheDocument()
  })

  it('renders the app version string', () => {
    renderSplashScreen()
    expect(screen.getByText(/v0\.1\.0/i)).toBeInTheDocument()
  })

  it('renders five soundwave bars', () => {
    renderSplashScreen()
    // The soundwave logo is an accessible landmark or a set of decorative bars.
    // We identify them via a data-testid convention the component will expose.
    const bars = screen.getAllByTestId('soundwave-bar')
    expect(bars).toHaveLength(5)
  })

  it('renders a progress bar', () => {
    renderSplashScreen()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('navigates to /onboarding after the progress animation completes', async () => {
    renderSplashScreen()

    // Advance past the 2.5-second progress animation duration and flush all
    // timers (setTimeout / setInterval used internally by the component).
    await act(async () => {
      vi.advanceTimersByTime(3000)
      // Allow any pending promises / microtasks to resolve.
      await Promise.resolve()
    })

    expect(mockNavigate).toHaveBeenCalledWith('/onboarding')
    expect(mockNavigate).toHaveBeenCalledTimes(1)
  })

  it('does not navigate before the animation completes', async () => {
    renderSplashScreen()

    // Only 1 second has elapsed — navigation must not have happened yet.
    await act(async () => {
      vi.advanceTimersByTime(1000)
      await Promise.resolve()
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
