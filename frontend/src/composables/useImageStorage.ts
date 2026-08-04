import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'ai-image-online'
const STORE_NAME = 'gallery'

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('history')) {
          db.createObjectStore('history', { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

export interface GalleryItem {
  id: string
  adapterId: string
  mode: string
  prompt: string
  params: Record<string, unknown>
  imageData: Blob
  mimeType: string
  createdAt: number
  apiConfig: { endpoint: string; model: string }
}

export async function saveToGallery(item: GalleryItem): Promise<void> {
  const db = await getDB()
  await db.put(STORE_NAME, item)
}

export async function getAllFromGallery(): Promise<GalleryItem[]> {
  const db = await getDB()
  const all = await db.getAll(STORE_NAME)
  return all.sort((a, b) => b.createdAt - a.createdAt)
}

export async function deleteFromGallery(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

export async function clearGallery(): Promise<void> {
  const db = await getDB()
  await db.clear(STORE_NAME)
}
