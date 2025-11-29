import chalk from 'chalk'
import { getShellRcPath } from '../config'
import { VERSION } from '../constants'
import { getSupportedModelProviders } from '../utils'

export const showHelp = (): void => {
  console.log(chalk.hex('#f86d6d')(`\nQuco AI v${VERSION} - Quick Command AI\n`))
  console.log('Turn natural language into shell commands using AI.\n')

  console.log(chalk.bold('Main Usage:\n'))
  console.log(
    `  ${chalk.cyan('quco <prompt>')}           ${chalk.bold(
      'Generate a shell command from natural language'
    )}`
  )
  console.log()

  console.log(chalk.bold('Setup & Configuration:\n'))
  console.log(`  ${chalk.cyan('quco --setup')}            Interactive setup and configuration`)
  console.log(`  ${chalk.cyan('quco --config')}           Show current configuration`)
  console.log(`  ${chalk.cyan('quco --version')}          Show version information`)
  console.log(
    `  ${chalk.cyan(
      'quco --autofill-on'
    )}      Enable autofill (Commands will be loaded into shell buffer)`
  )
  console.log(
    `  ${chalk.cyan(
      'quco --autofill-off'
    )}     Disable autofill (Commands will be copied to clipboard)\n`
  )

  console.log(chalk.bold('Supported Model Providers:\n'))
  console.log(
    chalk.yellow(
      getSupportedModelProviders()
        .map((p) => `  - ${p}`)
        .join('\n')
    )
  )
  console.log()

  console.log(chalk.bold('Using Other Model Names:\n'))
  console.log('  Quco supports various model names from supported providers via Vercel AI SDK')
  console.log('  To use a different model name, manually edit your shell configuration file:\n')
  console.log(`    1. Go to your shell config: ${chalk.cyan(getShellRcPath())}`)
  console.log(`    2. Update the model provider and model name in your shell config`)
  console.log(
    `       ${chalk.dim('Check https://ai-sdk.dev/docs/foundations/providers-and-models#ai-sdk-providers for model names')}`
  )
  console.log(`    3. Reload config: ${chalk.cyan(`source ${getShellRcPath()}`)}\n`)

  console.log(chalk.bold('Examples:\n'))
  console.log(`  ${chalk.dim('# Check IP address')}`)
  console.log(`  ${chalk.green('quco show my ip address')}\n`)

  console.log(`  ${chalk.dim('# Kill process on port')}`)
  console.log(`  ${chalk.green('quco kill process running on port 8000')}\n`)

  console.log(`  ${chalk.dim('# Check recent git commits')}`)
  console.log(`  ${chalk.green('quco show last 5 commits')}\n`)

  console.log(`  ${chalk.dim('# Download youtube video')}`)
  console.log(`  ${chalk.green('quco "download youtube video https://youtu.be/AbCd"')}\n`)

  console.log(chalk.bold('Notes:\n'))
  console.log(
    `  • ${chalk.yellow('Use quotes around prompts having special characters')} (?, *, &, |, etc.)`
  )
  console.log('  • Commands are never executed automatically (safety first)')
  console.log('  • Use autofill for the best experience')
  console.log(`  • History stored in ${chalk.dim('~/.quco/history.json')}\n`)
}
