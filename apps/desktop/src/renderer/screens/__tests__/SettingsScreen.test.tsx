import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { SettingsScreen } from '../SettingsScreen'

function renderWithRouter(initialEntry = '/settings') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/session" element={<div>Session</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('SettingsScreen', () => {
  it('renders settings heading', () => {
    renderWithRouter()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders all LLM provider options', () => {
    renderWithRouter()
    const providers = ['Anthropic (Claude)', 'OpenAI', 'Google Gemini', 'Groq', 'Ollama (local)', 'OpenRouter']
    providers.forEach((provider) => {
      expect(screen.getAllByText(provider).length).toBeGreaterThan(0)
    })
    const radioButtons = screen.getAllByRole('radio')
    expect(radioButtons.length).toBe(6)
  })

  it('renders API key inputs for each provider', () => {
    renderWithRouter()
    expect(screen.getByText('AI Provider')).toBeInTheDocument()
    expect(screen.getByText('API Keys')).toBeInTheDocument()
    const passwordInputs = screen.getAllByPlaceholderText('sk-...')
    expect(passwordInputs.length).toBe(5)
  })

  it('renders Save Settings button', () => {
    renderWithRouter()
    expect(
      screen.getByRole('button', { name: /Save Settings/ })
    ).toBeInTheDocument()
  })

  it('close button is present and clickable', async () => {
    renderWithRouter()
    const closeBtn = screen.getByRole('button', { name: '✕' })
    expect(closeBtn).toBeInTheDocument()
    // navigate(-1) — clicking should not throw
    await userEvent.click(closeBtn)
  })
})
