import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { CONFIG_COMMENT_END, CONFIG_COMMENT_START, DEFAULT_MODELS } from './constants'
import type { TModelProvider, TQucoConfig, TShellType } from './types'
import { cleanupOldBackups } from './utils'

export const getShellRcPath = (): string => {
  const shell = process.env.SHELL || ''
  const homeDir = os.homedir()

  if (shell.includes('zsh')) {
    return path.join(homeDir, '.zshrc')
  }
  if (shell.includes('bash')) {
    return path.join(homeDir, '.bashrc')
  }
  // Default to .bashrc if shell is unknown
  return path.join(homeDir, '.bashrc')
}

export const getCurrentShellType = (): TShellType => {
  const shell = process.env.SHELL || ''
  if (shell.includes('zsh')) return 'zsh'
  if (shell.includes('bash')) return 'bash'
  return 'unknown'
}

export const getConfigFromEnv = (): TQucoConfig | null => {
  const apiKey = process.env.QUCO_API_KEY

  if (!apiKey) {
    return null
  }

  const modelProvider = process.env.QUCO_MODEL_PROVIDER as TModelProvider
  const modelName = process.env.QUCO_MODEL_NAME as string

  if (!modelProvider || !modelName) {
    return null
  }

  // Validate that the provider is supported
  const validProviders = DEFAULT_MODELS.map((m) => m.modelProvider)
  if (!validProviders.includes(modelProvider)) {
    return null
  }

  return {
    modelProvider,
    modelName,
    apiKey
  }
}

const removeAllConfigBlocks = (content: string, startMarker: string, endMarker: string): string => {
  let result = content
  let modified = true

  // Keep removing blocks until none are found
  while (modified) {
    modified = false
    const startIndex = result.indexOf(startMarker)
    const endIndex = result.indexOf(endMarker)

    // Handle complete blocks (both markers present)
    if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
      const endLineEnd = result.indexOf('\n', endIndex)
      result =
        result.substring(0, startIndex) +
        result.substring(endLineEnd !== -1 ? endLineEnd + 1 : endIndex + endMarker.length)
      modified = true
    }
    // Handle orphaned start marker
    else if (startIndex !== -1 && (endIndex === -1 || startIndex > endIndex)) {
      const nextLineEnd = result.indexOf('\n', startIndex)
      result =
        result.substring(0, startIndex) +
        result.substring(nextLineEnd !== -1 ? nextLineEnd + 1 : startIndex + startMarker.length)
      modified = true
    }
    // Handle orphaned end marker
    else if (endIndex !== -1 && startIndex === -1) {
      const nextLineEnd = result.indexOf('\n', endIndex)
      result =
        result.substring(0, endIndex) +
        result.substring(nextLineEnd !== -1 ? nextLineEnd + 1 : endIndex + endMarker.length)
      modified = true
    }
  }

  return result
}

export const writeConfigToRc = ({ config }: { config: TQucoConfig }): void => {
  const rcPath = getShellRcPath()

  // Backup the rc file
  if (fs.existsSync(rcPath)) {
    const backupPath = `${rcPath}.quco-backup-${Date.now()}`
    fs.copyFileSync(rcPath, backupPath)
    cleanupOldBackups({ rcPath })
  }

  // Read current content
  let currentContent = ''
  if (fs.existsSync(rcPath)) {
    currentContent = fs.readFileSync(rcPath, 'utf-8')
  }

  // Remove all existing quco config blocks (including orphaned markers)
  currentContent = removeAllConfigBlocks(currentContent, CONFIG_COMMENT_START, CONFIG_COMMENT_END)

  // Create new config block
  const configBlock = `
${CONFIG_COMMENT_START}
export QUCO_MODEL_PROVIDER="${config.modelProvider}"
export QUCO_MODEL_NAME="${config.modelName}"
export QUCO_API_KEY="${config.apiKey}"
${CONFIG_COMMENT_END}
`

  // Append to file
  const newContent = `${currentContent.trimEnd()}\n${configBlock}`
  fs.writeFileSync(rcPath, newContent, 'utf-8')
}

export const removeConfigFromRc = (): void => {
  const rcPath = getShellRcPath()

  if (!fs.existsSync(rcPath)) {
    return
  }

  // Backup the rc file
  const backupPath = `${rcPath}.quco-backup-${Date.now()}`
  fs.copyFileSync(rcPath, backupPath)
  cleanupOldBackups({ rcPath })

  // Read current content
  const currentContent = fs.readFileSync(rcPath, 'utf-8')

  // Remove all quco config blocks (including orphaned markers)
  const newContent = removeAllConfigBlocks(currentContent, CONFIG_COMMENT_START, CONFIG_COMMENT_END)
  fs.writeFileSync(rcPath, `${newContent.trimEnd()}\n`, 'utf-8')
}
