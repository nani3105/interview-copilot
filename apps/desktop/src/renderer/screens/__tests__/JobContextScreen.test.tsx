import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
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
  beforeEach(() => {
    mockNavigate.mockReset()
  })

  // --- Layout ---

  it('renders the page heading', () => {
    renderJobContext()
    expect(
      screen.getByRole('heading', { name: /job context/i }),
    ).toBeInTheDocument()
  })

  it('renders the header title', () => {
    renderJobContext()
    expect(screen.getByText('Interview Setup')).toBeInTheDocument()
  })

  it('renders the step indicator', () => {
    renderJobContext()
    expect(screen.getByText(/step 2 of 3/i)).toBeInTheDocument()
  })

  it('renders the descriptive subtitle', () => {
    renderJobContext()
    expect(screen.getByText(/prepare for your specific interview/i)).toBeInTheDocument()
  })

  // --- Form fields ---

  it('renders the Company Name input', () => {
    renderJobContext()
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument()
  })

  it('renders the Job URL input', () => {
    renderJobContext()
    expect(
      screen.getByPlaceholderText(/linkedin\.com\/jobs/i),
    ).toBeInTheDocument()
  })

  it('renders the Job Description textarea', () => {
    renderJobContext()
    expect(
      screen.getByPlaceholderText(/paste the job requirements/i),
    ).toBeInTheDocument()
  })

  // --- Validation ---

  it('shows a validation error when Start Session is clicked with no company name', async () => {
    renderJobContext()
    await userEvent.click(screen.getByRole('button', { name: /start session/i }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('does not navigate when company name is only whitespace', async () => {
    renderJobContext()
    await userEvent.type(screen.getByLabelText(/company name/i), '   ')
    await userEvent.click(screen.getByRole('button', { name: /start session/i }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('clears the validation error once the user starts typing', async () => {
    renderJobContext()
    await userEvent.click(screen.getByRole('button', { name: /start session/i }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText(/company name/i), 'G')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  // --- Navigation ---

  it('navigates to /session when company name is provided', async () => {
    renderJobContext()
    await userEvent.type(screen.getByLabelText(/company name/i), 'Google')
    await userEvent.click(screen.getByRole('button', { name: /start session/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/session')
  })

  it('navigates back to /onboarding when back button is clicked', async () => {
    renderJobContext()
    await userEvent.click(screen.getByRole('button', { name: /go back/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/onboarding')
  })

  // --- Footer ---

  it('renders the privacy note', () => {
    renderJobContext()
    expect(
      screen.getByText(/used only to personalize/i),
    ).toBeInTheDocument()
  })
})
