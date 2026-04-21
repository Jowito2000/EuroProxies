'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/browser'
import { useCartStore } from '@/lib/cartStore'

interface AuthContextValue {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true })

export function useAuth() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children, initialUser = null }: { children: React.ReactNode, initialUser?: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [loading, setLoading] = useState(false)
  const { cards, loadFromSupabase, saveToSupabase, clearCart } = useCartStore()

  useEffect(() => {
    setUser(initialUser)
    if (initialUser) loadFromSupabase(initialUser.id)
  }, [initialUser, loadFromSupabase])

  useEffect(() => {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = session?.user ?? null
      setUser(nextUser)

      if (event === 'SIGNED_IN' && nextUser) {
        saveToSupabase(nextUser.id, cards)
      }
      if (event === 'SIGNED_OUT') {
        clearCart()
      }
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}
