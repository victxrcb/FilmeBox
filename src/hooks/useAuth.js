import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function toEmail(username) {
  return `${username.trim().toLowerCase()}@filmeapp.local`
}

export function useAuth() {
  // undefined = carregando sessão, null = não logado, objeto = logado
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
    const { error } = await supabase.auth.signInWithPassword({
      email: toEmail(username),
      password,
    })
    if (error) return { ok: false, error: 'Usuário ou senha inválidos.' }
    return { ok: true }
  }

  async function register(username, password) {
    if (!username.trim() || !password.trim())
      return { ok: false, error: 'Preencha todos os campos.' }
    if (password.length < 4)
      return { ok: false, error: 'A senha deve ter pelo menos 4 caracteres.' }

    const { data, error } = await supabase.auth.signUp({
      email: toEmail(username),
      password,
      options: { data: { username: username.trim() } },
    })

    if (error) {
      if (error.message.toLowerCase().includes('already registered'))
        return { ok: false, error: 'Nome de usuário já existe.' }
      return { ok: false, error: error.message }
    }

    await supabase.from('profiles').insert({
      id: data.user.id,
      username: username.trim(),
    })

    return { ok: true }
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  return { currentUser, login, register, logout }
}
