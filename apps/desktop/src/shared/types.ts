export type LLMProvider =
  | 'anthropic'
  | 'openai'
  | 'gemini'
  | 'groq'
  | 'ollama'
  | 'openrouter'

export type STTProvider = 'whisper' | 'deepgram' | 'local'

export type Speaker = 'interviewer' | 'candidate' | 'llm'

export interface TranscriptEntry {
  id: string
  timestamp: number
  speaker: Speaker
  text: string
}

export interface ResumeContext {
  rawText: string
  name: string
  skills: string[]
  experience: ExperienceEntry[]
  education: EducationEntry[]
  summary: string
}

export interface ExperienceEntry {
  company: string
  role: string
  duration: string
  highlights: string[]
}

export interface EducationEntry {
  institution: string
  degree: string
  year: string
}

export interface JobContext {
  url: string
  title: string
  description: string
}

export interface SessionState {
  id: string
  candidateName: string
  resumeContext: ResumeContext | null
  jobContext: JobContext | null
  status: 'idle' | 'active' | 'paused' | 'ended'
  transcript: TranscriptEntry[]
  currentAnswer: string
  isAutoListen: boolean
  isRecording: boolean
}

export interface AppSettings {
  primaryProvider: LLMProvider
  fallbackProvider: LLMProvider | null
  sttProvider: STTProvider
  apiKeys: Record<LLMProvider, string>
  ollamaUrl: string
  ollamaModel: string
}
