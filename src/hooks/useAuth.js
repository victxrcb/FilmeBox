import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user
        ? { id: session.user.id, username: session.user.user_metadata.username }
        : null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user
        ? { id: session.user.id, username: session.user.user_metadata.username }
        : null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function login(username, password) {
    // Busca o email real do usuário na tabela profiles (requer SELECT público na tabela)
    const { data: prof } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', username.trim())
      .maybeSingle()

    const authEmail = prof?.email || `${username.trim().toLowerCase()}@filmeapp.local`

    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password })
    if (error) return { ok: false, error: 'Usuário ou senha inválidos.' }
    return { ok: true }
  }

  async function register(username, password, email) {
    if (!username.trim() || !password.trim() || !email?.trim())
      return { ok: false, error: 'Preencha todos os campos.' }
    if (password.length < 6)
      return { ok: false, error: 'A senha deve ter pelo menos 6 caracteres.' }

    const normalizedEmail = email.trim().toLowerCase()

    const [{ data: existingUser }, { data: existingEmail }] = await Promise.all([
      supabase.from('profiles').select('id').eq('username', username.trim()).maybeSingle(),
      supabase.from('profiles').select('id').eq('email', normalizedEmail).maybeSingle(),
    ])

    if (existingUser) return { ok: false, error: 'Nome de usuário já existe.' }
    if (existingEmail) return { ok: false, error: 'E-mail já cadastrado.' }

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: { data: { username: username.trim() } },
    })

    if (error) {
      if (error.message.toLowerCase().includes('already registered'))
        return { ok: false, error: 'E-mail já cadastrado.' }
      return { ok: false, error: error.message }
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        username: username.trim(),
        email: normalizedEmail,
      })
    }

    return { ok: true }
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  return { currentUser, login, register, logout }
}
