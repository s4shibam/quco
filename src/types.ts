export type TModelProvider = 'openai' | 'anthropic' | 'google'

export type TShellType = 'zsh' | 'bash' | 'unknown'

export type TModelOption = {
  id: string
  name: string
  provider: TModelProvider
}

export type TQucoConfig = {
  modelId: string
  apiKey: string
}

export type TValidationResult = {
  valid: boolean
  command?: string
  error?: string
}

export type TLLMResponse = {
  command: string
}

export type THistoryEntry = {
  timestamp: string
  prompt: string
  response?: string
  status: 'success' | 'error'
  error?: unknown
}
