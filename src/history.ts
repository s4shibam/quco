import * as fs from 'node:fs'
import { HISTORY_DIR, HISTORY_FILE, MAX_HISTORY_ENTRIES } from './constants'
import type { THistoryEntry } from './types'

/**
 * Ensures the .quco directory exists
 */
const ensureHistoryDir = (): void => {
  if (!fs.existsSync(HISTORY_DIR)) {
    fs.mkdirSync(HISTORY_DIR, { recursive: true })
  }
}

/**
 * Reads all history entries from the history file
 */
const readHistory = (): THistoryEntry[] => {
  try {
    ensureHistoryDir()
    if (!fs.existsSync(HISTORY_FILE)) {
      return []
    }
    const content = fs.readFileSync(HISTORY_FILE, 'utf-8')
    return JSON.parse(content)
  } catch (_error) {
    // If file is corrupted or doesn't exist, return empty array
    return []
  }
}

/**
 * Writes history entries to the history file
 */
const writeHistory = (entries: THistoryEntry[]): void => {
  try {
    ensureHistoryDir()
    // Keep only the first MAX_HISTORY_ENTRIES entries (newest at top)
    const trimmedEntries = entries.slice(0, MAX_HISTORY_ENTRIES)
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(trimmedEntries, null, 2), 'utf-8')
  } catch (_error) {
    // Silently fail - history is not critical
    console.error('Warning: Failed to write history')
  }
}

/**
 * Adds a new history entry
 */
export const addHistoryEntry = ({
  prompt,
  response,
  status,
  error
}: Omit<THistoryEntry, 'timestamp'>): void => {
  try {
    const entries = readHistory()
    const entry: THistoryEntry = {
      timestamp: new Date().toISOString(),
      prompt,
      status,
      response,
      error
    }
    entries.unshift(entry) // Add new entry at the beginning (top)
    writeHistory(entries)
  } catch (_error) {
    // Silently fail - history is not critical
  }
}
