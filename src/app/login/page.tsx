'use client'

import { Suspense } from 'react'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/app/actions/auth'

function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined)
  const searchParams = useSearchParams()
  const justReset = searchParams.get('reset') === '1'

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 16px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 70% 60% at 65% 40%, rgba(124,58,237,0.18) 0%, transparent 60%),
          radial-gradient(ellipse 50% 50% at 20% 75%, rgba(79,70,229,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 40% 40% at 80% 10%, rgba(245,158,11,0.06) 0%, transparent 50%)
        `,
      }} />
      {/* Orbs */}
      <div style={{
        position: 'absolute', width: 480, height: 480,
        top: -140, right: '-8%', borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(124,58,237,0.28) 0%, transparent 70%)',
        filter: 'blur(70px)', animation: 'orb-drift-1 18s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: 340, height: 340,
        bottom: '-10%', left: '-4%', borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(79,46,229,0.22) 0%, transparent 70%)',
        filter: 'blur(60px)', animation: 'orb-drift-2 22s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: 220, height: 220,
        top: '45%', right: '38%', borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(245,158,11,0.14) 0%, transparent 70%)',
        filter: 'blur(50px)', animation: 'orb-drift-3 15s ease-in-out infinite',
      }} />

      {/* Contenido */}
      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10, animation: 'auth-card-in 0.55s cubic-bezier(0.2,0.8,0.2,1) both', marginTop: '-10vh' }}>

        {/* Logo */}
        <Link href="/" className="navbar-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 32, fontSize: '1.5rem', textDecoration: 'none' }}>
          <img src="/InicioSesionColor.png" alt="EuroProxy" style={{ width: 96, height: 96, marginBottom: 4, objectFit: 'contain' }} />
          EuroProxy
        </Link>

        {/* Card */}
        <div style={{
          background: 'rgba(9,7,20,0.90)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(124,58,237,0.28)',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04), 0 0 60px rgba(124,58,237,0.1)',
          animation: 'glow-pulse 6s ease-in-out infinite 0.8s',
        }}>
          {/* Barra superior animada */}
          <div style={{
            height: 3,
            background: 'linear-gradient(90deg, #7c3aed, #9333ea, #c084fc, #9333ea, #7c3aed)',
            backgroundSize: '200% auto',
            animation: 'gradient-shift 3s ease infinite',
          }} />

          <div style={{ padding: '36px 32px 32px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em' }}>
              Bienvenido de nuevo
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 28 }}>
              ¿No tienes cuenta?{' '}
              <Link href="/signup" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'underline' }}>
                Regístrate gratis
              </Link>
            </p>

            {justReset && (
              <div className="success-toast" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <span>✓</span> Contraseña actualizada. Ya puedes iniciar sesión.
              </div>
            )}

            <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label htmlFor="email" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  Email
                </label>
                <input
                  id="email" name="email" type="email" required
                  autoComplete="email" placeholder="tu@email.com"
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <label htmlFor="password" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                    Contraseña
                  </label>
                  <Link href="/forgot-password" style={{ fontSize: '0.78rem', color: '#8892a4', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#8892a4')}>
                    ¿La olvidaste?
                  </Link>
                </div>
                <input
                  id="password" name="password" type="password" required
                  autoComplete="current-password" placeholder="••••••••"
                  className="input-field"
                />
              </div>

              {state?.error && (
                <div className="danger-toast" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>⚠</span> {state.error}
                </div>
              )}

              <button type="submit" disabled={pending} className="btn-primary"
                style={{ width: '100%', padding: '13px 24px', fontSize: '0.95rem', fontWeight: 800, borderRadius: 14, marginTop: 4 }}>
                {pending ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{
                      width: 16, height: 16, borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.25)',
                      borderTopColor: '#fff',
                      display: 'inline-block',
                      animation: 'auth-spinner-spin 0.7s linear infinite',
                    }} />
                    Entrando…
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    Entrar <span className="cta-arrow">→</span>
                  </span>
                )}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Cargando...</div>}>
      <LoginForm />
    </Suspense>
  )
}
