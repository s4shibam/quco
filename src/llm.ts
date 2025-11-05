import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'
import ora from 'ora'
import { RETRY_PROMPT_REMINDER, SUPPORTED_MODELS, SYSTEM_PROMPT } from './constants'
import { addHistoryEntry } from './history'
import type { TLLMResponse, TModelProvider } from './types'

export const getModelProvider = ({ modelId }: { modelId: string }): TModelProvider => {
  const model = SUPPORTED_MODELS.find((m) => m.id === modelId)
  if (!model) {
    throw new Error(`Unknown model: ${modelId}`)
  }
  return model.provider
}

export const getModelName = ({ modelId }: { modelId: string }): string => {
  const model = SUPPORTED_MODELS.find((m) => m.id === modelId)
  if (!model) {
    throw new Error(`Unknown model: ${modelId}`)
  }

  // Extract model name by removing provider prefix (e.g., "openai/gpt-4" -> "gpt-4")
  const firstSlashIndex = model.id.indexOf('/')
  return firstSlashIndex !== -1 ? model.id.substring(firstSlashIndex + 1) : model.id
}

export const generateCommand = async ({
  prompt,
  modelId,
  apiKey,
  maxRetries = 2
}: {
  prompt: string
  modelId: string
  apiKey: string
  maxRetries?: number
}): Promise<TLLMResponse> => {
  const provider = getModelProvider({ modelId })
  const modelName = getModelName({ modelId })

  const spinner = ora({ text: 'Generating command...' }).start()

  let lastError: Error | null = null
  let lastRawResponse: string | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        spinner.text = `Retrying (${attempt + 1}/${maxRetries + 1})...`
        spinner.color = 'gray'
      }

      const sdk = createSDK({ provider, apiKey })
      const model = sdk(modelName)

      // Adjust prompt for retries
      const userPrompt = attempt === 0 ? prompt : `${prompt}\n\n${RETRY_PROMPT_REMINDER}`

      const result = await generateText({
        model,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.1,
        maxOutputTokens: 500,
        abortSignal: AbortSignal.timeout(30000) // 30 seconds timeout
      })

      lastRawResponse = result.text

      // Extract command from triple backticks
      const backtickMatch = lastRawResponse.match(/```(?:\w+)?\s*\n?(.*?)\n?```/s)
      const command = backtickMatch ? backtickMatch[1].trim() : lastRawResponse.trim()

      spinner.succeed('Command generated')

      // Log to history
      addHistoryEntry({
        prompt,
        response: command,
        status: 'success'
      })

      return { command }
    } catch (error) {
      lastError = error as Error
      if (attempt === maxRetries) {
        break
      }

      // Log error to history
      addHistoryEntry({
        prompt,
        status: 'error',
        response: lastRawResponse || 'No response from LLM',
        error: lastError || 'Unknown error'
      })

      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  spinner.fail('Failed to generate command')

  throw new Error(
    `Failed to generate command after ${maxRetries + 1} attempts: ${
      lastError?.message || 'Unknown error'
    }`
  )
}

const createSDK = ({ provider, apiKey }: { provider: TModelProvider; apiKey: string }) => {
  switch (provider) {
    case 'openai':
      return createOpenAI({ apiKey })
    case 'anthropic':
      return createAnthropic({ apiKey })
    case 'google':
      return createGoogleGenerativeAI({ apiKey })
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}
