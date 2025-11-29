import chalk from 'chalk'
import { getConfigFromEnv, getShellRcPath } from '../config'
import { HISTORY_FILE } from '../constants'
import { getSupportedModelProviders } from '../utils'

export const showConfig = (): void => {
  const config = getConfigFromEnv()

  if (!config) {
    console.log(chalk.yellow('Quco is not configured yet.'))
    console.log(chalk.yellow('Run: quco --setup'))
    process.exit(0)
  }

  const supportedProviders = getSupportedModelProviders()

  if (!supportedProviders.includes(config.modelProvider)) {
    console.log(
      chalk.yellow(`Quco is not configured to use model provider: ${config.modelProvider}.`)
    )
    console.log(chalk.yellow('Supported model providers:'))
    console.log(chalk.yellow(supportedProviders.map((p) => `- ${p}`).join('\n')))
    console.log(chalk.yellow('Run: quco --setup'))
    process.exit(0)
  }

  const rcPath = getShellRcPath()

  console.log(chalk.bold('\nQuco Configuration:\n'))
  console.log(`${chalk.cyan('Model Provider:')} ${config.modelProvider}`)
  console.log(`${chalk.cyan('Model Name:')} ${config.modelName}`)
  console.log(`${chalk.cyan('API Key:')} ${maskApiKey({ apiKey: config.apiKey })}`)
  console.log(`${chalk.cyan('Config File:')} ${rcPath}`)
  console.log(`${chalk.cyan('History File:')} ${HISTORY_FILE}\n`)

  console.log(chalk.dim('📚 You can use other models from supported providers.'))
  console.log(chalk.dim('   Run: quco (without arguments) for more information.'))
  console.log()
}

const maskApiKey = ({ apiKey }: { apiKey: string }): string => {
  if (apiKey.length <= 8) {
    return '***'
  }
  return `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`
}
