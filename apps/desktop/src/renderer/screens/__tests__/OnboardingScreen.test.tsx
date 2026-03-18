import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { OnboardingScreen } from '../OnboardingScreen'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderOnboarding() {
  return render(
    <MemoryRouter>
      <OnboardingScreen />
    </MemoryRouter>,
  )
}

describe('OnboardingScreen', () => {
  it('renders name input and resume upload', () => {
    renderOnboarding()
    expect(screen.getByPlaceholderText('John Smith')).toBeInTheDocument()
    expect(screen.getByText(/Drop PDF or DOCX/i)).toBeInTheDocument()
  })

  it('renders next button', () => {
    renderOnboarding()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })

  it('navigates to job-context on next click', async () => {
    renderOnboarding()
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/job-context')
  })
})
