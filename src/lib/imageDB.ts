// IndexedDB wrapper for persisting card images across page reloads.
// File objects are stored directly — IndexedDB handles binary natively,
// unlike localStorage which can't store Files and is limited to ~5 MB.

const DB_NAME = 'europroxy-images'
const STORE   = 'images'

function openDB(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => res(req.result)
    req.onerror   = () => rej(req.error)
  })
}

export async function idbSave(id: string, file: File): Promise<void> {
  const db = await openDB()
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(file, id)
    tx.oncomplete = () => res()
    tx.onerror    = () => rej(tx.error)
  })
}

export async function idbGet(id: string): Promise<File | undefined> {
  const db = await openDB()
  return new Promise((res, rej) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(id)
    req.onsuccess = () => res(req.result as File | undefined)
    req.onerror   = () => rej(req.error)
  })
}

export async function idbDelete(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => res()
    tx.onerror    = () => rej(tx.error)
  })
}

export async function idbDeleteMany(ids: string[]): Promise<void> {
  if (!ids.length) return
  const db = await openDB()
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite')
    ids.forEach(id => tx.objectStore(STORE).delete(id))
    tx.oncomplete = () => res()
    tx.onerror    = () => rej(tx.error)
  })
}
