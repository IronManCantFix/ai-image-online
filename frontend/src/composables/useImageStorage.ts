import { getDB } from './db'

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
  await db.put('gallery', item)
}

export async function getAllFromGallery(): Promise<GalleryItem[]> {
  const db = await getDB()
  const all = await db.getAll('gallery')
  return all.sort((a, b) => b.createdAt - a.createdAt)
}

export async function deleteFromGallery(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('gallery', id)
}

export async function clearGallery(): Promise<void> {
  const db = await getDB()
  await db.clear('gallery')
}
