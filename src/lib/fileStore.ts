'use client'

import { create } from 'zustand'
import { idbSave, idbDelete, idbDeleteMany } from './imageDB'

interface FileStoreState {
  files: Map<string, File>
  addFile: (cardId: string, file: File) => void
  removeFile: (cardId: string) => void
  clear: (ids?: string[]) => void
}

export const useFileStore = create<FileStoreState>()(set => ({
  files: new Map(),

  addFile: (cardId, file) => {
    idbSave(cardId, file).catch(console.error) // persist async, fire-and-forget
    set(state => {
      const next = new Map(state.files)
      next.set(cardId, file)
      return { files: next }
    })
  },

  removeFile: (cardId) => {
    idbDelete(cardId).catch(console.error)
    set(state => {
      const next = new Map(state.files)
      next.delete(cardId)
      return { files: next }
    })
  },

  clear: (ids) => {
    if (ids?.length) idbDeleteMany(ids).catch(console.error)
    set({ files: new Map() })
  },
}))
