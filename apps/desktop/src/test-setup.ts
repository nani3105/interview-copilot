import '@testing-library/jest-dom'

// ResizeObserver is not implemented in jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock Electron APIs not available in test environment
Object.defineProperty(window, 'electronAPI', {
  value: {
    setOpacity: vi.fn().mockResolvedValue(undefined),
    setAlwaysOnTop: vi.fn().mockResolvedValue(undefined),
    captureScreenshot: vi.fn().mockResolvedValue(true),
    setWindowSize: vi.fn().mockResolvedValue(undefined),
    fitToBar: vi.fn().mockResolvedValue(undefined),
    expandForPanel: vi.fn().mockResolvedValue(undefined),
    collapseToBar: vi.fn().mockResolvedValue(undefined),
    restoreFull: vi.fn().mockResolvedValue(undefined),
    setIgnoreMouseEvents: vi.fn().mockResolvedValue(undefined),
  },
  writable: true,
})
