import { getDB } from './db'

const STORE_NAME = 'history'
const HISTORY_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export interface PersistedHistoryEntry {
  id: string
  mode: 'text-to-image' | 'image-to-image'
  prompt: string
  images: { data: Blob; mimeType: string }[]
  raw?: unknown
  createdAt: number
}

export async function saveHistoryEntry(entry: PersistedHistoryEntry): Promise<void> {
  const db = await getDB()
  await db.put(STORE_NAME, entry)
}

export async function getAllHistory(): Promise<PersistedHistoryEntry[]> {
  const db = await getDB()
  const all = await db.getAll(STORE_NAME)
  // Filter out expired entries
  const cutoff = Date.now() - HISTORY_TTL_MS
  const valid = all.filter((item) => item.createdAt > cutoff)
  // Clean up expired entries
  if (valid.length < all.length) {
    const expired = all.filter((item) => item.createdAt <= cutoff)
    const tx = db.transaction(STORE_NAME, 'readwrite')
    for (const item of expired) {
      tx.store.delete(item.id)
    }
    await tx.done
  }
  return valid.sort((a, b) => b.createdAt - a.createdAt)
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

export async function clearHistory(): Promise<void> {
  const db = await getDB()
  await db.clear(STORE_NAME)
}
