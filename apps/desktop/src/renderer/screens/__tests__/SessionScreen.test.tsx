import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { SessionScreen } from '../SessionScreen'

function renderWithRouter(initialEntry = '/session') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/session" element={<SessionScreen />} />
        <Route path="/settings" element={<div>Settings</div>} />
        <Route path="/onboarding" element={<div>Onboarding</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('SessionScreen', () => {
  it('renders live session indicators', () => {
    renderWithRouter()
    expect(screen.getByText('LIVE')).toBeInTheDocument()
    expect(screen.getByText('Listening...')).toBeInTheDocument()
  })

  it('renders AI answer placeholder', () => {
    renderWithRouter()
    expect(screen.getByText('AI Answer')).toBeInTheDocument()
    expect(
      screen.getByText(/Answer will appear here/)
    ).toBeInTheDocument()
  })

  it('renders Screenshot and Record buttons', () => {
    renderWithRouter()
    expect(screen.getByText(/Screenshot/)).toBeInTheDocument()
    expect(screen.getByText(/Record/)).toBeInTheDocument()
  })

  it('navigates to settings when gear icon clicked', async () => {
    renderWithRouter()
    await userEvent.click(screen.getByText('⚙'))
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('navigates to onboarding when End is clicked', async () => {
    renderWithRouter()
    await userEvent.click(screen.getByText(/End/))
    expect(screen.getByText('Onboarding')).toBeInTheDocument()
  })

  it('shows Auto-Listen and Opacity controls', () => {
    renderWithRouter()
    expect(screen.getByText('Auto-Listen')).toBeInTheDocument()
    expect(screen.getByText('Opacity')).toBeInTheDocument()
  })
})
