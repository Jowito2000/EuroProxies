'use client'

import { useActionState } from 'react'
import { updatePassword } from '@/app/actions/auth'

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState(updatePassword, undefined)

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 70% 60% at 60% 40%, rgba(124,58,237,0.16) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 20% 75%, rgba(79,70,229,0.1) 0%, transparent 60%)' }} />
      <div style={{ position: 'absolute', width: 440, height: 440, top: -120, right: '-6%', borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)', filter: 'blur(70px)', animation: 'orb-drift-1 18s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 300, height: 300, bottom: '-8%', left: '-3%', borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(79,46,229,0.2) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'orb-drift-2 22s ease-in-out infinite' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10, animation: 'auth-card-in 0.55s cubic-bezier(0.2,0.8,0.2,1) both' }}>
        <div style={{ background: 'rgba(9,7,20,0.90)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(124,58,237,0.28)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04), 0 0 60px rgba(124,58,237,0.1)', animation: 'glow-pulse 6s ease-in-out infinite 0.8s' }}>
          <div style={{ height: 3, background: 'linear-gradient(90deg, #7c3aed, #9333ea, #c084fc, #9333ea, #7c3aed)', backgroundSize: '200% auto', animation: 'gradient-shift 3s ease infinite' }} />

          <div style={{ padding: '36px 32px 32px' }}>
            {/* Icono */}
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(124,58,237,0.1))', border: '1px solid rgba(124,58,237,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', marginBottom: 20 }}>
              🛡
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: 8, letterSpacing: '-0.02em' }}>
              Nueva contraseña
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 28, lineHeight: 1.6 }}>
              Elige una contraseña segura para tu cuenta.
            </p>

            <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label htmlFor="password" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  Nueva contraseña <span style={{ fontWeight: 400 }}>(mín. 6 caracteres)</span>
                </label>
                <input
                  id="password" name="password" type="password"
                  required minLength={6} autoComplete="new-password"
                  placeholder="••••••••" className="input-field"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label htmlFor="confirm" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  Confirmar contraseña
                </label>
                <input
                  id="confirm" name="confirm" type="password"
                  required minLength={6} autoComplete="new-password"
                  placeholder="••••••••" className="input-field"
                />
              </div>

              {state?.error && (
                <div className="danger-toast" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>⚠</span> {state.error}
                </div>
              )}

              {/* Indicador de seguridad */}
              <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 12, padding: '12px 16px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 8, fontWeight: 600 }}>Contraseña segura:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {['Al menos 6 caracteres', 'Mezcla letras y números', 'Evita contraseñas comunes'].map((tip, i) => (
                    <span key={i} style={{ fontSize: '0.75rem', color: 'rgba(136,146,164,0.7)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: '#7c3aed', fontSize: '0.6rem' }}>◆</span> {tip}
                    </span>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={pending} className="btn-primary"
                style={{ width: '100%', padding: '13px 24px', fontSize: '0.95rem', fontWeight: 800, borderRadius: 14, marginTop: 4 }}>
                {pending ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', display: 'inline-block', animation: 'auth-spinner-spin 0.7s linear infinite' }} />
                    Guardando…
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    Guardar nueva contraseña <span className="cta-arrow">→</span>
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
