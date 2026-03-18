import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { JobContextScreen } from '../JobContextScreen'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderJobContext() {
  return render(
    <MemoryRouter>
      <JobContextScreen />
    </MemoryRouter>,
  )
}

describe('JobContextScreen', () => {
  it('renders all form fields', () => {
    renderJobContext()
    expect(screen.getByPlaceholderText(/https:\/\/jobs/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Senior Software Engineer/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Paste the job description/i)).toBeInTheDocument()
  })

  it('navigates back on back click', async () => {
    renderJobContext()
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/onboarding')
  })

  it('navigates to session on start click', async () => {
    renderJobContext()
    await userEvent.click(screen.getByRole('button', { name: /start session/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/session')
  })
})
