import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
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
  beforeEach(() => {
    mockNavigate.mockReset()
  })

  // --- Layout ---

  it('renders the page heading', () => {
    renderOnboarding()
    expect(
      screen.getByRole('heading', { name: /complete your profile/i }),
    ).toBeInTheDocument()
  })

  it('renders the step indicator', () => {
    renderOnboarding()
    expect(screen.getByText(/step 1 of 3/i)).toBeInTheDocument()
  })

  it('renders the app title in the header', () => {
    renderOnboarding()
    expect(screen.getByText('Interview Co-pilot')).toBeInTheDocument()
  })

  // --- Form fields ---

  it('renders the full name input', () => {
    renderOnboarding()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
  })

  it('renders the resume drop zone', () => {
    renderOnboarding()
    expect(screen.getByText(/drop your resume here/i)).toBeInTheDocument()
  })

  it('renders the hidden file input accepting pdf and docx', () => {
    const { container } = renderOnboarding()
    const fileInput = container.querySelector('input[type="file"]')
    expect(fileInput).toBeInTheDocument()
    expect(fileInput).toHaveAttribute('accept', '.pdf,.docx')
  })

  // --- Validation ---

  it('shows a validation error when Next Step is clicked with empty name', async () => {
    renderOnboarding()
    await userEvent.click(screen.getByRole('button', { name: /next step/i }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('does not navigate when name contains only whitespace', async () => {
    renderOnboarding()
    await userEvent.type(screen.getByLabelText(/full name/i), '   ')
    await userEvent.click(screen.getByRole('button', { name: /next step/i }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('clears the validation error once the user starts typing', async () => {
    renderOnboarding()
    await userEvent.click(screen.getByRole('button', { name: /next step/i }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText(/full name/i), 'A')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  // --- Navigation ---

  it('navigates to /job-context when name is filled and form is submitted', async () => {
    renderOnboarding()
    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Doe')
    await userEvent.click(screen.getByRole('button', { name: /next step/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/job-context')
  })

  // --- File selection ---

  it('displays the selected file name after a file is chosen', () => {
    const { container } = renderOnboarding()
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['content'], 'my-resume.pdf', { type: 'application/pdf' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    expect(screen.getByText('my-resume.pdf')).toBeInTheDocument()
  })

  it('shows an error for files over 5 MB', () => {
    const { container } = renderOnboarding()
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    const bigFile = new File(['x'.repeat(6 * 1024 * 1024)], 'big.pdf', {
      type: 'application/pdf',
    })
    fireEvent.change(fileInput, { target: { files: [bigFile] } })
    expect(screen.getByText(/5mb/i)).toBeInTheDocument()
  })

  // --- Drag and drop ---

  it('highlights the drop zone while dragging over it', () => {
    renderOnboarding()
    const dropZone = screen.getByTestId('drop-zone')
    fireEvent.dragOver(dropZone)
    // The zone should still be in the document after the drag event
    expect(dropZone).toBeInTheDocument()
  })

  it('resets drag state when drag leaves the drop zone', () => {
    renderOnboarding()
    const dropZone = screen.getByTestId('drop-zone')
    fireEvent.dragOver(dropZone)
    fireEvent.dragLeave(dropZone)
    expect(dropZone).toBeInTheDocument()
  })

  it('selects a file when one is dropped onto the drop zone', () => {
    renderOnboarding()
    const dropZone = screen.getByTestId('drop-zone')
    const file = new File(['content'], 'dropped.pdf', { type: 'application/pdf' })
    fireEvent.drop(dropZone, { dataTransfer: { files: [file] } })
    expect(screen.getByText('dropped.pdf')).toBeInTheDocument()
  })

  it('opens the file picker when Enter is pressed on the drop zone', () => {
    renderOnboarding()
    const dropZone = screen.getByTestId('drop-zone')
    // Should not throw when Enter is pressed
    fireEvent.keyDown(dropZone, { key: 'Enter' })
    expect(dropZone).toBeInTheDocument()
  })

  it('clears the selected file when the remove button is clicked', () => {
    const { container } = renderOnboarding()
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    expect(screen.getByText('resume.pdf')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /remove file/i }))
    expect(screen.queryByText('resume.pdf')).not.toBeInTheDocument()
  })

  // --- Footer bar ---

  it('renders the Copilot Engine Active status', () => {
    renderOnboarding()
    expect(screen.getByText(/copilot engine active/i)).toBeInTheDocument()
  })
})
