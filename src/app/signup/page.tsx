'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signup } from '@/app/actions/auth'

const BG_ORBS = (
  <>

    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 70% 60% at 65% 40%, rgba(124,58,237,0.18) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 20% 75%, rgba(79,70,229,0.12) 0%, transparent 60%)` }} />
    <div style={{ position: 'absolute', width: 480, height: 480, top: -140, right: '-8%', borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(124,58,237,0.28) 0%, transparent 70%)', filter: 'blur(70px)', animation: 'orb-drift-1 18s ease-in-out infinite' }} />
    <div style={{ position: 'absolute', width: 340, height: 340, bottom: '-10%', left: '-4%', borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(79,46,229,0.22) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'orb-drift-2 22s ease-in-out infinite' }} />
  </>
)

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined)

  if ((state as { sent?: boolean } | undefined)?.sent) {
    return <EmailSentScreen />
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', position: 'relative', overflow: 'hidden' }}>
      {BG_ORBS}

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10, animation: 'auth-card-in 0.55s cubic-bezier(0.2,0.8,0.2,1) both', marginTop: '-10vh' }}>
        <Link href="/" className="navbar-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 32, fontSize: '1.5rem', textDecoration: 'none' }}>
          <img src="/InicioSesionColor.png" alt="EuroProxy" style={{ width: 96, height: 96, marginBottom: 4, objectFit: 'contain' }} />
          EuroProxy
        </Link>

        <div style={{
          background: 'rgba(9,7,20,0.90)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(124,58,237,0.28)', borderRadius: 24, overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04), 0 0 60px rgba(124,58,237,0.1)',
          animation: 'glow-pulse 6s ease-in-out infinite 0.8s',
        }}>
          <div style={{ height: 3, background: 'linear-gradient(90deg, #7c3aed, #9333ea, #c084fc, #9333ea, #7c3aed)', backgroundSize: '200% auto', animation: 'gradient-shift 3s ease infinite' }} />

          <div style={{ padding: '36px 32px 32px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em' }}>
              Crea tu cuenta
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 28 }}>
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'underline' }}>
                Inicia sesión
              </Link>
            </p>

            <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label htmlFor="email" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Email</label>
                <input id="email" name="email" type="email" required autoComplete="email" placeholder="tu@email.com" defaultValue={'email' in (state ?? {}) ? (state as { email?: string }).email || '' : ''} className="input-field" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label htmlFor="password" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  Contraseña <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(mín. 6 caracteres)</span>
                </label>
                <input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" placeholder="••••••••" className="input-field" />
              </div>

              {'error' in (state ?? {}) && (
                <div className="danger-toast" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>⚠</span> {(state as { error: string }).error}
                </div>
              )}

              <button type="submit" disabled={pending} className="btn-primary"
                style={{ width: '100%', padding: '13px 24px', fontSize: '0.95rem', fontWeight: 800, borderRadius: 14, marginTop: 4 }}>
                {pending ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', display: 'inline-block', animation: 'auth-spinner-spin 0.7s linear infinite' }} />
                    Creando cuenta…
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    Crear cuenta gratis <span className="cta-arrow">→</span>
                  </span>
                )}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'rgba(136,146,164,0.55)', marginTop: 20 }}>
              Uso casual y testing únicamente · No válido para torneos oficiales
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}

function EmailSentScreen() {
  const checks = ['Revisa tu bandeja de entrada', 'Si no aparece, mira el spam', 'El enlace expira en 24 horas']

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(16,185,129,0.1) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 20% 75%, rgba(79,70,229,0.1) 0%, transparent 60%)' }} />
      <div style={{ position: 'absolute', width: 420, height: 420, top: -100, right: '-5%', borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)', filter: 'blur(70px)', animation: 'orb-drift-1 18s ease-in-out infinite' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10, animation: 'auth-card-in 0.6s cubic-bezier(0.2,0.8,0.2,1) both', marginTop: '-10vh' }}>
        <Link href="/" className="navbar-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 32, fontSize: '1.5rem', textDecoration: 'none' }}>
          <img src="/InicioSesionColor.png" alt="EuroProxy" style={{ width: 96, height: 96, marginBottom: 4, objectFit: 'contain' }} />
          EuroProxy
        </Link>

        <div style={{
          background: 'rgba(9,7,20,0.90)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(16,185,129,0.3)', borderRadius: 24, overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.65), 0 0 60px rgba(16,185,129,0.08)',
        }}>
          {/* Barra verde */}
          <div style={{ height: 3, background: 'linear-gradient(90deg, #10b981, #34d399, #10b981)', backgroundSize: '200% auto', animation: 'gradient-shift 4s ease infinite' }} />

          <div style={{ padding: '40px 32px 36px', textAlign: 'center' }}>
            {/* Icono sobre animado */}
            <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(16,185,129,0.5)', animation: 'email-ring-expand 2s ease-out infinite' }} />
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(16,185,129,0.4)', animation: 'email-ring-expand 2s ease-out infinite 1s' }} />
              <div style={{
                width: 64, height: 64, borderRadius: '50%', position: 'relative', zIndex: 1,
                background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.06))',
                border: '1px solid rgba(16,185,129,0.4)',
                boxShadow: '0 0 30px rgba(16,185,129,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.8rem',
                animation: 'email-icon-bounce 3s ease-in-out infinite',
              }}>✉</div>
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: 10, letterSpacing: '-0.02em' }}>
              ¡Revisa tu email!
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: 28 }}>
              Te hemos enviado un enlace de confirmación.<br />
              Haz clic en él para activar tu cuenta.
            </p>

            {/* Checklist */}
            <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: 14, padding: '16px 20px', marginBottom: 28, textAlign: 'left' }}>
              {checks.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: i < checks.length - 1 ? 10 : 0, animation: `check-item-in 0.4s ease both ${0.3 + i * 0.12}s`, opacity: 0, animationFillMode: 'forwards' }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', fontSize: '0.6rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</span>
                  {item}
                </div>
              ))}
            </div>

            <Link href="/login" className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px 24px', fontSize: '0.95rem', fontWeight: 800, borderRadius: 14, textDecoration: 'none' }}>
              Ir a iniciar sesión <span className="cta-arrow">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
