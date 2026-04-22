'use client'

import { useState, useRef, useEffect } from 'react'
import { COUNTRIES } from '@/utils/countries'

interface PhonePrefixSelectProps {
  value: string
  onChange: (dialCode: string) => void
  disabled?: boolean
}

export default function PhonePrefixSelect({ value, onChange, disabled }: PhonePrefixSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Find the country that matches the current prefix (default to the first if not found)
  const selectedCountry = COUNTRIES.find(c => c.dialCode === value) || COUNTRIES[0]

  const filteredCountries = COUNTRIES.filter(c => 
    c.dialCode.includes(search) || 
    c.label.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    } else {
      setSearch('')
    }
  }, [isOpen])

  return (
    <div className="relative shrink-0" ref={wrapperRef} style={{ width: '110px' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="input-field w-full flex items-center justify-between transition-all"
        style={{ 
          opacity: disabled ? 0.5 : 1, 
          cursor: disabled ? 'not-allowed' : 'pointer',
          padding: '10px 12px',
          borderColor: isOpen ? 'rgba(124,58,237,0.8)' : 'rgba(124,58,237,0.3)',
          boxShadow: isOpen ? '0 0 15px rgba(124,58,237,0.2)' : 'none',
          minHeight: '46px'
        }}
      >
        <div className="flex items-center gap-2">
          <img src={selectedCountry.iconUrl} alt={selectedCountry.label} className="w-5 h-auto shadow-sm rounded-[2px]" />
          <span className="text-sm font-medium" style={{ color: '#fff' }}>{selectedCountry.dialCode}</span>
        </div>
        <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute z-50 w-[200px] mt-2 rounded-xl border border-purple-500/30 overflow-hidden flex flex-col"
          style={{ 
            background: 'rgba(15,10,30,0.95)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.8), 0 0 20px rgba(124,58,237,0.15)',
            animation: 'panel-card-in 0.2s ease-out',
            maxHeight: '300px',
            left: 0
          }}
        >
          <div className="p-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar prefijo..."
              className="w-full bg-transparent text-sm px-3 py-2 outline-none placeholder-white/30"
              style={{ color: '#fff' }}
            />
          </div>
          <ul className="overflow-y-auto scrollbar-thin">
            {filteredCountries.length > 0 ? (
              filteredCountries.map(c => (
                <li
                  key={c.code}
                  onClick={() => {
                    onChange(c.dialCode)
                    setIsOpen(false)
                  }}
                  className="px-4 py-3 flex items-center gap-3 cursor-pointer text-sm transition-colors"
                  style={{ color: 'var(--color-text)', borderBottom: '1px solid rgba(255,255,255,0.02)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(124,58,237,0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <img src={c.iconUrl} alt={c.label} className="w-5 h-auto shadow-sm rounded-[2px]" />
                  <span className="font-semibold" style={{ color: '#fff' }}>{c.dialCode}</span>
                  <span className="opacity-70 truncate text-xs">{c.label}</span>
                </li>
              ))
            ) : (
              <li className="px-4 py-4 text-center text-sm opacity-50" style={{ color: '#fff' }}>No hay resultados</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
