import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'
import ora from 'ora'
import { RETRY_PROMPT_REMINDER, SYSTEM_PROMPT } from './constants'
import { addHistoryEntry } from './history'
import type { TModelProvider, TValidationResult } from './types'
import { getUserContext, validateLLMResponse } from './utils'

export const generateCommand = async ({
  prompt,
  modelProvider,
  modelName,
  apiKey,
  maxRetries = 2
}: {
  prompt: string
  modelProvider: TModelProvider
  modelName: string
  apiKey: string
  maxRetries?: number
}): Promise<TValidationResult> => {
  const spinner = ora({ text: 'Generating command...' }).start()

  let lastError: Error | null = null
  let lastRawResponse: string | null = null
  let lastValidation: TValidationResult | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt === 0) {
        spinner.text = 'Generating command...'
      } else if (attempt < maxRetries) {
        spinner.text = `Retrying (${attempt}/${maxRetries})...`
      } else {
        spinner.text = 'Last try...'
      }

      const sdk = createSDK({ provider: modelProvider, apiKey })
      const model = sdk(modelName)

      // Get user context for better command generation
      const userContext = getUserContext()

      // Combine system prompt with user context
      const enhancedSystemPrompt = `${SYSTEM_PROMPT}\n\n${userContext}`

      // Adjust prompt for retries
      const userPrompt = attempt === 0 ? prompt : `${prompt}\n\n${RETRY_PROMPT_REMINDER}`

      const result = await generateText({
        model,
        messages: [
          {
            role: 'system',
            content: enhancedSystemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.1,
        maxOutputTokens: 1024,
        abortSignal: AbortSignal.timeout(30000) // 30 seconds timeout
      })

      lastRawResponse = result.text

      const validation = validateLLMResponse({ rawResponse: lastRawResponse })

      lastValidation = validation

      if (!validation.valid || !validation.command) {
        throw new Error(validation.reasoning || 'Invalid command')
      }

      const { command, reasoning } = validation

      // Log to history
      addHistoryEntry({
        prompt,
        status: 'success',
        response: lastRawResponse || 'No response from LLM'
      })

      return { valid: true, command, reasoning }
    } catch (error) {
      lastError = error as Error

      // Log error to history
      addHistoryEntry({
        prompt,
        status: 'error',
        response: lastRawResponse || 'No response from LLM',
        error: lastError || 'Unknown error'
      })

      if (attempt === maxRetries) {
        return { valid: false, reasoning: lastValidation?.reasoning || 'No reasoning available' }
      }

      await new Promise((resolve) => setTimeout(resolve, 512))
    } finally {
      spinner.stop()
    }
  }

  // This should never be reached, but TypeScript needs it
  spinner.fail('Failed to generate command')
  return { valid: false, reasoning: 'Unexpected error: loop completed without return' }
}

const createSDK = ({ provider, apiKey }: { provider: TModelProvider; apiKey: string }) => {
  switch (provider) {
    case 'anthropic':
      return createAnthropic({ apiKey })
    case 'google':
      return createGoogleGenerativeAI({ apiKey })
    case 'openai':
      return createOpenAI({ apiKey })
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}
