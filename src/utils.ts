import { exec } from 'node:child_process'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { promisify } from 'node:util'
import { DEFAULT_MODELS, MAX_SHELL_CONFIG_BACKUPS } from './constants'
import type { TValidationResult } from './types'

const execAsync = promisify(exec)

/**
 * Returns the supported model providers
 */
export const getSupportedModelProviders = (): string[] => {
  return [...new Set(DEFAULT_MODELS.map((m) => m.modelProvider))]
}

/**
 * Generates user context information to be included in the prompt
 * This helps the AI generate more accurate and context-aware commands
 */
export const getUserContext = (): string => {
  // Get current date in readable format
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Get OS information
  const platform = os.platform()
  const osType = os.type()
  const osRelease = os.release()
  const osInfo = `${osType} ${osRelease} (${platform})`

  // Get shell information from environment
  const shell = process.env.SHELL || 'unknown'

  // Get current working directory (workspace path)
  const workspacePath = process.cwd()

  // Get user's home directory
  const homeDir = os.homedir()

  return `## USER CONTEXT
- Current Date: ${currentDate}
- Operating System: ${osInfo}
- Shell: ${shell}
- Current Working Directory: ${workspacePath}
- Home Directory: ${homeDir}
- Architecture: ${os.arch()}

Use this context to generate commands that are appropriate for the user's environment.`
}

export const copyToClipboard = async ({ text }: { text: string }): Promise<boolean> => {
  try {
    // macOS specific
    await execAsync(`echo ${escapeForShell({ text })} | pbcopy`)
    return true
  } catch (_error) {
    return false
  }
}

export const escapeForShell = ({ text }: { text: string }): string => {
  // Escape single quotes and wrap in single quotes
  return `'${text.replace(/'/g, "'\\''")}'`
}

export const formatError = ({ error }: { error: unknown }): string => {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

export const isNetworkError = ({ error }: { error: unknown }): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes('network') ||
      message.includes('econnrefused') ||
      message.includes('enotfound') ||
      message.includes('timeout') ||
      message.includes('fetch failed')
    )
  }
  return false
}

export const isShellAutofillActive = (): boolean => {
  // Check if being called from within the shell autofill function
  // The shell autofill function sets a specific environment or calling pattern
  // This can be detected by checking if the parent process is a shell function
  // or by checking specific environment variables that might be set

  // For now, a simple heuristic: if QUCO_SHELL_AUTOFILL is set
  // This can be set by the shell autofill function
  return process.env.QUCO_SHELL_AUTOFILL === 'true'
}

export const cleanupOldBackups = ({ rcPath }: { rcPath: string }): void => {
  try {
    const dir = path.dirname(rcPath)
    const baseFilename = path.basename(rcPath)
    const backupPattern = `${baseFilename}.quco-backup-`

    // Get all backup files
    const files = fs.readdirSync(dir)
    const backupFiles = files
      .filter((file) => file.startsWith(backupPattern))
      .map((file) => {
        const timestampStr = file.replace(backupPattern, '')
        const timestamp = Number.parseInt(timestampStr, 10)
        return {
          filename: file,
          fullPath: path.join(dir, file),
          timestamp: Number.isNaN(timestamp) ? 0 : timestamp
        }
      })
      .sort((a, b) => b.timestamp - a.timestamp) // Sort newest first

    // Keep only the MAX_BACKUPS most recent, delete the rest
    if (backupFiles.length > MAX_SHELL_CONFIG_BACKUPS) {
      const filesToDelete = backupFiles.slice(MAX_SHELL_CONFIG_BACKUPS)
      for (const file of filesToDelete) {
        fs.unlinkSync(file.fullPath)
      }
    }
  } catch {
    // Silently fail - cleanup is not critical
  }
}

export const validateLLMResponse = ({
  rawResponse
}: {
  rawResponse: string
}): TValidationResult => {
  const backtickMatch = rawResponse.match(/```(?:\w+)?\s*\n?(.*?)\n?```/s)
  const jsonString = backtickMatch ? backtickMatch[1].trim() : rawResponse.trim()

  let parsedResponse: { reasoning: string; command: string }

  try {
    parsedResponse = JSON.parse(jsonString)

    // Validate JSON structure
    if (
      typeof parsedResponse.reasoning !== 'string' ||
      typeof parsedResponse.command !== 'string'
    ) {
      return {
        valid: false,
        reasoning: 'Invalid JSON structure: missing reasoning or command fields'
      }
    }
  } catch (parseError) {
    return {
      valid: false,
      reasoning: `Failed to parse LLM response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
    }
  }

  const { reasoning, command } = parsedResponse

  // Trim whitespace
  const trimmedCommand = command?.trim()

  // Check if command is empty or missing
  if (!trimmedCommand || trimmedCommand === '') {
    return {
      valid: false,
      reasoning: 'Unable to generate command'
    }
  }

  // Basic sanity checks
  if (trimmedCommand.includes('\0')) {
    return {
      valid: false,
      reasoning: 'Command contains null bytes'
    }
  }

  // Check for commands starting with invalid characters
  if (/^[|&;<>]/.test(trimmedCommand)) {
    return {
      valid: false,
      reasoning: 'Command cannot start with pipe, redirect, or control operators'
    }
  }

  // Check for shell prompt symbols at start
  if (/^[$#>]\s/.test(trimmedCommand)) {
    return {
      valid: false,
      reasoning: 'Command should not start with shell prompt symbols ($, #, >)'
    }
  }

  return {
    valid: true,
    command: trimmedCommand,
    reasoning
  }
}
