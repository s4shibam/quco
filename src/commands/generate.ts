import chalk from 'chalk'
import { getConfigFromEnv } from '../config'
import { generateCommand } from '../llm'
import {
  copyToClipboard,
  formatError,
  getSupportedModelProviders,
  isNetworkError,
  isShellAutofillActive
} from '../utils'

export const generateCommandFromPrompt = async ({ prompt }: { prompt: string }): Promise<void> => {
  // Get config from environment
  const config = getConfigFromEnv()

  if (!config) {
    console.error(chalk.red('Error: Quco is not configured.'))
    console.error(chalk.yellow('Please run: quco --setup'))
    process.exit(1)
  }

  // Validate model
  if (!getSupportedModelProviders().includes(config.modelProvider)) {
    console.error(
      chalk.red(`Error: Quco is not configured to use model provider: ${config.modelProvider}.`)
    )
    console.error(chalk.yellow('Supported model providers:'))
    console.error(
      chalk.yellow(
        getSupportedModelProviders()
          .map((p) => `- ${p}`)
          .join('\n')
      )
    )
    console.error(chalk.yellow('Please run: quco --setup'))
    process.exit(1)
  }

  try {
    // Call LLM to generate command
    const response = await generateCommand({
      prompt,
      modelProvider: config.modelProvider,
      modelName: config.modelName,
      apiKey: config.apiKey
    })

    // Validate the response
    if (!response.valid) {
      console.error(chalk.red('❌ Failed to generate command'))
      console.error(chalk.yellow('Reason: ') + response.reasoning)
      process.exit(1)
    }

    // Output the validated command
    await outputCommand({ command: response.command })
  } catch (error) {
    if (isNetworkError({ error })) {
      console.error(chalk.red('Error: Network request failed.'))
      console.error(chalk.yellow('Please check your internet connection and API key.'))
    } else {
      console.error(chalk.red(`Error: ${formatError({ error })}`))
    }
    process.exit(1)
  }
}

const outputCommand = async ({ command }: { command: string }): Promise<void> => {
  // Only copy to clipboard if autofill is not active
  // When autofill is active, the command is loaded directly into the shell buffer
  if (isShellAutofillActive()) {
    console.log(command)
  } else {
    console.log(`$ ${command}`)
    const copied = await copyToClipboard({ text: command })
    if (copied) {
      console.log(chalk.green('✓ Copied to clipboard'))
    }
  }
}
