import '@testing-library/jest-dom'

// Mock Electron APIs not available in test environment
Object.defineProperty(window, 'electronAPI', {
  value: {
    setOpacity: vi.fn().mockResolvedValue(undefined),
    setAlwaysOnTop: vi.fn().mockResolvedValue(undefined),
    captureScreenshot: vi.fn().mockResolvedValue(true),
  },
  writable: true,
})
