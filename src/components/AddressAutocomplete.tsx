'use client'

import { useState, useEffect, useRef } from 'react'

export interface NominatimAddress {
  place_id: number
  display_name: string
  address: {
    country_code: string
    [key: string]: string
  }
}

interface AddressAutocompleteProps {
  countryCode: string
  onAddressSelect: (address: string) => void
  initialValue?: string
}

export default function AddressAutocomplete({ countryCode, onAddressSelect, initialValue = '' }: AddressAutocompleteProps) {
  const [query, setQuery] = useState(initialValue)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [results, setResults] = useState<NominatimAddress[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  // Fetch
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 3) {
      setResults([])
      setLoading(false)
      return
    }

    const fetchAddresses = async () => {
      setLoading(true)
      try {
        const countryFilter = countryCode ? `&countrycodes=${countryCode.toLowerCase()}` : ''
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(debouncedQuery)}&format=json&addressdetails=1&limit=5${countryFilter}`)
        if (res.ok) {
          const data: NominatimAddress[] = await res.json()
          setResults(data)
          setIsOpen(true)
        }
      } catch (err) {
        console.error('Error fetching addresses:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAddresses()
  }, [debouncedQuery])

  const handleSelect = (item: NominatimAddress) => {
    setQuery(item.display_name)
    setIsOpen(false)
    onAddressSelect(item.display_name)
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-bold mb-2" style={{ color: '#fff' }}>
        Calle / Vía
      </label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          placeholder="Ej: Paseo de la Castellana 15, Madrid"
          className="input-field w-full pr-10"
          style={{ 
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(124,58,237,0.3)',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: '12px',
            outline: 'none',
            transition: 'all 0.2s'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'rgba(124,58,237,0.8)'
            e.currentTarget.style.boxShadow = '0 0 15px rgba(124,58,237,0.2)'
            if (results.length > 0) setIsOpen(true)
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="inline-block w-4 h-4 border-2 border-t-transparent border-purple-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 rounded-xl border border-purple-500/30 overflow-hidden" 
            style={{ 
              background: 'rgba(15,10,30,0.95)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.8), 0 0 20px rgba(124,58,237,0.15)',
              animation: 'panel-card-in 0.2s ease-out'
            }}>
          {results.map((item) => (
            <li
              key={item.place_id}
              onClick={() => handleSelect(item)}
              className="px-4 py-3 cursor-pointer transition-colors text-sm"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--color-text)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(124,58,237,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#a78bfa' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="leading-snug">{item.display_name}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
