import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SessionScreen } from '../SessionScreen'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderSession() {
  return render(
    <MemoryRouter initialEntries={['/session']}>
      <Routes>
        <Route path="/session" element={<SessionScreen />} />
        <Route path="/settings" element={<div>Settings Page</div>} />
        <Route path="/onboarding" element={<div>Onboarding Page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('SessionScreen', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
  })

  // --- Pill bar layout ---

  it('renders the pill bar', () => {
    renderSession()
    expect(screen.getByRole('region', { name: /session controls/i })).toBeInTheDocument()
  })

  it('shows the elapsed timer starting at 0:00', () => {
    renderSession()
    expect(screen.getByText('0:00')).toBeInTheDocument()
  })

  // --- Control buttons ---

  it('renders the mic/record button', () => {
    renderSession()
    expect(screen.getByRole('button', { name: /record mic/i })).toBeInTheDocument()
  })

  it('renders the screenshot button', () => {
    renderSession()
    expect(screen.getByRole('button', { name: /screenshot/i })).toBeInTheDocument()
  })

  it('renders the AI Answer button', () => {
    renderSession()
    expect(screen.getByRole('button', { name: /ai answer/i })).toBeInTheDocument()
  })

  it('renders the Analyze Screen button', () => {
    renderSession()
    expect(screen.getByRole('button', { name: /analyze screen/i })).toBeInTheDocument()
  })

  it('renders the Chat button', () => {
    renderSession()
    expect(screen.getByRole('button', { name: /chat/i })).toBeInTheDocument()
  })

  it('renders the transcription/equalizer button', () => {
    renderSession()
    expect(screen.getByRole('button', { name: /transcription/i })).toBeInTheDocument()
  })

  it('renders the More Options button', () => {
    renderSession()
    expect(screen.getByRole('button', { name: /more options/i })).toBeInTheDocument()
  })

  it('renders the hide button', () => {
    renderSession()
    expect(screen.getByRole('button', { name: /hide session/i })).toBeInTheDocument()
  })

  // --- Floating panel ---

  it('floating panel is not visible initially', () => {
    renderSession()
    expect(screen.queryByRole('complementary', { name: /ai panel/i })).not.toBeInTheDocument()
  })

  it('opens the AI Answer panel when AI Answer is clicked', async () => {
    renderSession()
    await userEvent.click(screen.getByRole('button', { name: /ai answer/i }))
    expect(screen.getByRole('complementary', { name: /ai panel/i })).toBeInTheDocument()
  })

  it('shows LLM response placeholder in AI Answer panel', async () => {
    renderSession()
    await userEvent.click(screen.getByRole('button', { name: /ai answer/i }))
    expect(screen.getByText(/waiting for a question/i)).toBeInTheDocument()
  })

  it('opens the same panel when Analyze Screen is clicked', async () => {
    renderSession()
    await userEvent.click(screen.getByRole('button', { name: /analyze screen/i }))
    expect(screen.getByRole('complementary', { name: /ai panel/i })).toBeInTheDocument()
  })

  it('shows analyze placeholder in Analyze Screen panel', async () => {
    renderSession()
    await userEvent.click(screen.getByRole('button', { name: /analyze screen/i }))
    expect(screen.getByText(/capture a screenshot/i)).toBeInTheDocument()
  })

  it('opens panel with chat input when Chat is clicked', async () => {
    renderSession()
    await userEvent.click(screen.getByRole('button', { name: /chat/i }))
    expect(screen.getByRole('complementary', { name: /ai panel/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /ask anything/i })).toBeInTheDocument()
  })

  it('opens transcription panel when Equalizer is clicked', async () => {
    renderSession()
    await userEvent.click(screen.getByRole('button', { name: /transcription/i }))
    expect(screen.getByRole('complementary', { name: /ai panel/i })).toBeInTheDocument()
    expect(screen.getByText(/no live transcript/i)).toBeInTheDocument()
  })

  it('closes the panel when the close button is clicked', async () => {
    renderSession()
    await userEvent.click(screen.getByRole('button', { name: /ai answer/i }))
    expect(screen.getByRole('complementary', { name: /ai panel/i })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /close panel/i }))
    expect(screen.queryByRole('complementary', { name: /ai panel/i })).not.toBeInTheDocument()
  })

  it('toggles between panels when switching buttons', async () => {
    renderSession()
    await userEvent.click(screen.getByRole('button', { name: /ai answer/i }))
    expect(screen.getByText(/waiting for a question/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /chat/i }))
    expect(screen.getByRole('textbox', { name: /ask anything/i })).toBeInTheDocument()
    expect(screen.queryByText(/waiting for a question/i)).not.toBeInTheDocument()
  })

  it('closes panel when the same active button is clicked again', async () => {
    renderSession()
    await userEvent.click(screen.getByRole('button', { name: /ai answer/i }))
    expect(screen.getByRole('complementary', { name: /ai panel/i })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /ai answer/i }))
    expect(screen.queryByRole('complementary', { name: /ai panel/i })).not.toBeInTheDocument()
  })

  // --- Recording ---

  it('toggles recording state when mic button is clicked', async () => {
    renderSession()
    await userEvent.click(screen.getByRole('button', { name: /record mic/i }))
    expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument()
  })

  it('shows recording indicator when recording is active', async () => {
    renderSession()
    await userEvent.click(screen.getByRole('button', { name: /record mic/i }))
    expect(screen.getByTestId('recording-indicator')).toBeInTheDocument()
  })

  // --- Hide ---

  it('hides the bar when the hide button is clicked', async () => {
    renderSession()
    await userEvent.click(screen.getByRole('button', { name: /hide session/i }))
    expect(screen.queryByRole('region', { name: /session controls/i })).not.toBeInTheDocument()
  })

  it('shows a restore button when the bar is hidden', async () => {
    renderSession()
    await userEvent.click(screen.getByRole('button', { name: /hide session/i }))
    expect(screen.getByRole('button', { name: /show session/i })).toBeInTheDocument()
  })

  it('restores the bar when the restore button is clicked', async () => {
    renderSession()
    await userEvent.click(screen.getByRole('button', { name: /hide session/i }))
    await userEvent.click(screen.getByRole('button', { name: /show session/i }))
    expect(screen.getByRole('region', { name: /session controls/i })).toBeInTheDocument()
  })

  // --- Stop ---

  it('renders the stop session button', () => {
    renderSession()
    expect(screen.getByRole('button', { name: /stop session/i })).toBeInTheDocument()
  })

  it('calls closeWindow when stop session is clicked', async () => {
    const closeWindow = vi.fn()
    ;(window as Record<string, unknown>).electronAPI = {
      ...(window as Record<string, unknown>).electronAPI as object,
      closeWindow,
    }
    renderSession()
    await userEvent.click(screen.getByRole('button', { name: /stop session/i }))
    expect(closeWindow).toHaveBeenCalled()
  })

  // --- More Options / Settings ---

  it('navigates to /settings when More Options is clicked', async () => {
    renderSession()
    await userEvent.click(screen.getByRole('button', { name: /more options/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/settings')
  })

  // --- Timer (isolated with fake timers) ---

  describe('elapsed timer', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('increments the elapsed timer every second', async () => {
      renderSession()
      await act(async () => {
        vi.advanceTimersByTime(3000)
      })
      expect(screen.getByText('0:03')).toBeInTheDocument()
    })

    it('formats timer correctly for 1 minute 5 seconds', async () => {
      renderSession()
      await act(async () => {
        vi.advanceTimersByTime(65000)
      })
      expect(screen.getByText('1:05')).toBeInTheDocument()
    })
  })
})
