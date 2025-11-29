import { password, select } from '@inquirer/prompts'
import chalk from 'chalk'
import { getCurrentShellType, getShellRcPath, writeConfigToRc } from '../config'
import { DEFAULT_MODELS } from '../constants'
import type { TQucoConfig } from '../types'

export const setupCommand = async (): Promise<void> => {
  console.log(chalk.bold('\n🚀 Welcome to Quco Setup\n'))
  console.log('This will configure quco to use an AI model for command generation.\n')

  // Ask for model selection
  const modelChoices = DEFAULT_MODELS.map((model) => ({
    name: model.displayName,
    value: `${model.modelProvider}/${model.modelName}`
  }))

  const selectedModel = await select({
    message: 'Which AI model would you like to use?',
    choices: modelChoices
  })

  const model = DEFAULT_MODELS.find((m) => `${m.modelProvider}/${m.modelName}` === selectedModel)
  if (!model) {
    console.error(chalk.red('Error: Selected model not found'))
    process.exit(1)
  }

  // Ask for API key
  const apiKey = await password({
    message: `Enter your ${model.modelProvider.toUpperCase()} API key:`,
    mask: true,
    validate: (input: string) => {
      if (!input || input.trim().length === 0) {
        return 'API key cannot be empty'
      }
      return true
    }
  })

  const config: TQucoConfig = {
    modelProvider: model.modelProvider,
    modelName: model.modelName,
    apiKey: apiKey.trim()
  }

  // Write config to shell rc file
  try {
    writeConfigToRc({ config })
    const rcPath = getShellRcPath()
    const shellType = getCurrentShellType()

    console.log(chalk.green('\n✓ Configuration saved successfully!\n'))
    console.log(`Configuration written to: ${chalk.cyan(rcPath)}`)
    console.log(
      chalk.yellow(`\nPlease restart your terminal or run: ${chalk.bold(`source ${rcPath}`)}\n`)
    )

    // Show autofill hint
    if (shellType === 'zsh' || shellType === 'bash') {
      console.log(chalk.dim('💡 Tip: For the best experience, consider enabling autofill.'))
      console.log(
        chalk.dim('   This allows generated commands to be loaded into your shell buffer.')
      )
      console.log(chalk.dim(`   Run: ${chalk.bold('quco --autofill-on')}\n`))
    }

    // Show information about using other models
    console.log(chalk.dim('📚 Note: You can use other models from supported providers.'))
    console.log(chalk.dim('   Run: quco (without arguments) for more information.'))
    console.log()
  } catch (error) {
    console.error(chalk.red('\n✗ Failed to save configuration:'))
    console.error(chalk.red((error as Error).message))
    process.exit(1)
  }
}
