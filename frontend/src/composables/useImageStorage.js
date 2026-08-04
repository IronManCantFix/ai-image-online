import { openDB } from 'idb';
const DB_NAME = 'ai-image-online';
const STORE_NAME = 'gallery';
let dbPromise = null;
function getDB() {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            },
        });
    }
    return dbPromise;
}
export async function saveToGallery(item) {
    const db = await getDB();
    await db.put(STORE_NAME, item);
}
export async function getAllFromGallery() {
    const db = await getDB();
    const all = await db.getAll(STORE_NAME);
    return all.sort((a, b) => b.createdAt - a.createdAt);
}
export async function deleteFromGallery(id) {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
}
export async function clearGallery() {
    const db = await getDB();
    await db.clear(STORE_NAME);
}
//# sourceMappingURL=useImageStorage.js.map