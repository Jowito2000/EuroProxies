'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { requestPasswordReset } from '@/app/actions/auth'

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined)
  const sent = (state as { sent?: boolean } | undefined)?.sent

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', position: 'relative', overflow: 'hidden' }}>
      {/* Fondo */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 70% 60% at 60% 40%, rgba(124,58,237,0.16) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 20% 75%, rgba(79,70,229,0.1) 0%, transparent 60%)' }} />
      <div style={{ position: 'absolute', width: 440, height: 440, top: -120, right: '-6%', borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)', filter: 'blur(70px)', animation: 'orb-drift-1 18s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 300, height: 300, bottom: '-8%', left: '-3%', borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(79,46,229,0.2) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'orb-drift-2 22s ease-in-out infinite' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10, animation: 'auth-card-in 0.55s cubic-bezier(0.2,0.8,0.2,1) both' }}>
        <Link href="/" className="navbar-logo" style={{ display: 'block', textAlign: 'center', marginBottom: 32, fontSize: '1.5rem' }}>
          EuroProxy
        </Link>

        <div style={{ background: 'rgba(9,7,20,0.90)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(124,58,237,0.28)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04), 0 0 60px rgba(124,58,237,0.1)', animation: 'glow-pulse 6s ease-in-out infinite 0.8s' }}>
          <div style={{ height: 3, background: 'linear-gradient(90deg, #7c3aed, #9333ea, #c084fc, #9333ea, #7c3aed)', backgroundSize: '200% auto', animation: 'gradient-shift 3s ease infinite' }} />

          <div style={{ padding: '36px 32px 32px' }}>
            {!sent ? (
              <>
                {/* Icono de llave */}
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(124,58,237,0.1))', border: '1px solid rgba(124,58,237,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', marginBottom: 20 }}>
                  🔑
                </div>

                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: 8, letterSpacing: '-0.02em' }}>
                  ¿Olvidaste tu contraseña?
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 28, lineHeight: 1.6 }}>
                  Escribe tu email y te enviaremos un enlace para recuperar el acceso.
                </p>

                <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label htmlFor="email" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                      Email de tu cuenta
                    </label>
                    <input
                      id="email" name="email" type="email" required
                      autoComplete="email" placeholder="tu@email.com"
                      className="input-field"
                    />
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
                        Enviando…
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        Enviar enlace de recuperación <span className="cta-arrow">→</span>
                      </span>
                    )}
                  </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <Link href="/login" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'color 0.2s' }}>
                    ← Volver a iniciar sesión
                  </Link>
                </div>
              </>
            ) : (
              /* Estado: email enviado */
              <div style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(124,58,237,0.5)', animation: 'email-ring-expand 2s ease-out infinite' }} />
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(124,58,237,0.4)', animation: 'email-ring-expand 2s ease-out infinite 1s' }} />
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(124,58,237,0.08))', border: '1px solid rgba(124,58,237,0.4)', boxShadow: '0 0 30px rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.7rem', animation: 'email-icon-bounce 3s ease-in-out infinite', position: 'relative', zIndex: 1 }}>
                    ✉
                  </div>
                </div>

                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', marginBottom: 10, letterSpacing: '-0.02em' }}>
                  ¡Revisa tu email!
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: 24 }}>
                  Si esa cuenta existe, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
                </p>

                <div style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 14, padding: '14px 18px', marginBottom: 24, textAlign: 'left' }}>
                  {['Revisa bandeja de entrada y spam', 'El enlace expira en 1 hora', 'Puedes solicitar otro si no llega'].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.83rem', color: 'var(--color-text-muted)', marginBottom: i < 2 ? 10 : 0, animation: `check-item-in 0.4s ease both ${0.2 + i * 0.12}s`, opacity: 0, animationFillMode: 'forwards' }}>
                      <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#a78bfa', fontSize: '0.55rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</span>
                      {item}
                    </div>
                  ))}
                </div>

                <Link href="/login" className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px 24px', fontSize: '0.95rem', fontWeight: 800, borderRadius: 14, textDecoration: 'none' }}>
                  Volver al inicio de sesión <span className="cta-arrow">→</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
