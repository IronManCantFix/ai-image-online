import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'ai-image-online'
const DB_VERSION = 2

let dbPromise: Promise<IDBPDatabase> | null = null

export function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('gallery')) {
          db.createObjectStore('gallery', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('history')) {
          db.createObjectStore('history', { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}
