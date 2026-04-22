'use client'

import { useEffect, useRef } from 'react'
import { useCartStore } from './cartStore'
import { useFileStore } from './fileStore'
import { idbGet } from './imageDB'

/**
 * Re-hydrates card images after a page reload.
 *
 * Zustand's `persist` rehydrates `cards` from localStorage AFTER the first
 * render, so a one-shot `useEffect([])` would see an empty cart and give up.
 * Instead, we react to cart changes and keep a ref of IDs we've already
 * tried, so we don't re-fetch on every render.
 */
export function useRestoreCartImages() {
  const cards          = useCartStore(s => s.cards)
  const updateImageUrl = useCartStore(s => s.updateImageUrl)
  const files          = useFileStore(s => s.files)
  const addFile        = useFileStore(s => s.addFile)

  const attempted = useRef<Set<string>>(new Set())

  useEffect(() => {
    const pending = cards.filter(
      c => !files.has(c.id) && !attempted.current.has(c.id)
    )
    if (!pending.length) return

    pending.forEach(c => attempted.current.add(c.id))

    ;(async () => {
      // Run IndexedDB reads concurrently instead of sequentially
      const results = await Promise.all(
        pending.map(async (card) => {
          try {
            const file = await idbGet(card.id)
            if (file) return { id: card.id, file }
          } catch {
            // skip
          }
          return null
        })
      )

      // Apply the successful reads
      for (const res of results) {
        if (!res) continue
        const freshUrl = URL.createObjectURL(res.file)
        addFile(res.id, res.file)
        updateImageUrl(res.id, freshUrl)
      }
    })()
  }, [cards, files, addFile, updateImageUrl])
}
