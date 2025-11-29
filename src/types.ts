export type TModelProvider = 'openai' | 'anthropic' | 'google'

export type TShellType = 'zsh' | 'bash' | 'unknown'

export type TModelOption = {
  modelProvider: TModelProvider
  modelName: string
  displayName: string
}

export type TQucoConfig = {
  modelProvider: TModelProvider
  modelName: string
  apiKey: string
}

export type TValidationResult =
  | {
      valid: false
      reasoning: string
    }
  | {
      valid: true
      reasoning: string
      command: string
    }

export type THistoryEntry = {
  timestamp: string
  prompt: string
  response?: string
  status: 'success' | 'error'
  error?: unknown
}
