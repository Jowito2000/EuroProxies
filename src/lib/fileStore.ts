'use client'

import { create } from 'zustand'

interface FileStoreState {
  files: Map<string, File>
  addFile: (cardId: string, file: File) => void
  removeFile: (cardId: string) => void
  clear: () => void
}

export const useFileStore = create<FileStoreState>()(set => ({
  files: new Map(),

  addFile: (cardId, file) =>
    set(state => {
      const next = new Map(state.files)
      next.set(cardId, file)
      return { files: next }
    }),

  removeFile: (cardId) =>
    set(state => {
      const next = new Map(state.files)
      next.delete(cardId)
      return { files: next }
    }),

  clear: () => set({ files: new Map() }),
}))
