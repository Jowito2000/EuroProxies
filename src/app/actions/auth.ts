'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function friendlyError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('rate limit') || m.includes('too many') || m.includes('exceeded'))
    return 'Demasiados intentos. Espera unos minutos antes de intentarlo de nuevo.'
  if (m.includes('invalid login') || m.includes('invalid credentials') || m.includes('wrong password'))
    return 'Email o contraseña incorrectos.'
  if (m.includes('email not confirmed'))
    return 'Confirma tu email antes de iniciar sesión. Revisa tu bandeja de entrada.'
  if (m.includes('user already registered') || m.includes('already been registered'))
    return 'Ya existe una cuenta con ese email.'
  if (m.includes('password') && m.includes('weak'))
    return 'La contraseña es demasiado débil. Usa al menos 6 caracteres.'
  if (m.includes('network') || m.includes('fetch'))
    return 'Error de conexión. Comprueba tu internet e inténtalo de nuevo.'
  return message
}

type LoginState = { error: string } | undefined
type SignupState = { error: string } | { sent: true } | undefined

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) return { error: friendlyError(error.message) }

  const next = formData.get('next') as string | null
  redirect(next || '/')
}

export async function signup(prevState: SignupState, formData: FormData): Promise<SignupState> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  })

  if (error) return { error: friendlyError(error.message) }

  // Cuando el email ya existe Supabase devuelve éxito pero identities viene vacío
  if (data.user && data.user.identities?.length === 0) {
    return { error: 'Ya existe una cuenta con ese email. ¿Quieres iniciar sesión?' }
  }

  return { sent: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

type ResetState = { error: string } | { sent: true } | undefined

export async function requestPasswordReset(prevState: ResetState, formData: FormData): Promise<ResetState> {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback?next=/reset-password`,
  })

  if (error) return { error: friendlyError(error.message) }
  return { sent: true }
}

type UpdatePasswordState = { error: string } | undefined

export async function updatePassword(prevState: UpdatePasswordState, formData: FormData): Promise<UpdatePasswordState> {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (password !== confirm) return { error: 'Las contraseñas no coinciden' }
  if (password.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres' }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: friendlyError(error.message) }

  redirect('/login?reset=1')
}
