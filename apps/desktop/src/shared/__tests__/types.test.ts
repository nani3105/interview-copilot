import { describe, it, expect } from 'vitest'
import type { TranscriptEntry, SessionState, AppSettings } from '../types'

describe('Type definitions', () => {
  it('TranscriptEntry has required fields', () => {
    const entry: TranscriptEntry = {
      id: 'test-id',
      timestamp: Date.now(),
      speaker: 'interviewer',
      text: 'Tell me about yourself',
    }
    expect(entry.id).toBeDefined()
    expect(entry.speaker).toBe('interviewer')
  })

  it('SessionState initializes correctly', () => {
    const state: SessionState = {
      id: 'session-1',
      candidateName: 'John',
      resumeContext: null,
      jobContext: null,
      status: 'idle',
      transcript: [],
      currentAnswer: '',
      isAutoListen: false,
      isRecording: false,
    }
    expect(state.status).toBe('idle')
    expect(state.transcript).toHaveLength(0)
  })

  it('AppSettings has all provider keys', () => {
    const settings: AppSettings = {
      primaryProvider: 'anthropic',
      fallbackProvider: 'openai',
      sttProvider: 'whisper',
      apiKeys: {
        anthropic: '',
        openai: '',
        gemini: '',
        groq: '',
        ollama: '',
        openrouter: '',
      },
      ollamaUrl: 'http://localhost:11434',
      ollamaModel: 'llama3.2',
    }
    expect(settings.primaryProvider).toBe('anthropic')
    expect(Object.keys(settings.apiKeys)).toHaveLength(6)
  })
})
