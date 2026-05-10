import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useProfile(userId) {
  const [profile, setProfile] = useState({})

  useEffect(() => {
    if (!userId) return
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (data) setProfile({
          displayName:  data.display_name  || '',
          photo:        data.photo         || '',
          banner:       data.banner        || '',
          topFavorites: data.top_favorites || [],
          email:        data.email         || '',
        })
      })
  }, [userId])

  async function saveProfile(data) {
    const dbData = {}
    if ('displayName'  in data) dbData.display_name  = data.displayName
    if ('photo'        in data) dbData.photo          = data.photo
    if ('banner'       in data) dbData.banner         = data.banner
    if ('topFavorites' in data) dbData.top_favorites  = data.topFavorites
    // email vazio (remoção) também é salvo aqui
    if ('email' in data && data.email === '') dbData.email = ''

    await supabase.from('profiles').update(dbData).eq('id', userId)
    setProfile((prev) => ({ ...prev, ...data }))
  }

  // Inicia troca de email: envia OTP de confirmação para o novo endereço
  async function updateEmail(newEmail) {
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    if (error) {
      // Ignora erro de email antigo inválido (emails fake @filmeapp.local):
      // o Supabase ainda enviou o OTP para o novo email mesmo com esse erro.
      if (!error.message?.includes('filmeapp.local')) {
        return { ok: false, error: error.message }
      }
    }
    return { ok: true, needsVerification: true }
  }

  // Verifica o OTP recebido e salva o novo email no perfil
  async function verifyEmailOtp(newEmail, token) {
    const { error } = await supabase.auth.verifyOtp({
      email: newEmail,
      token,
      type: 'email_change',
    })
    if (error) return { ok: false, error: 'Código inválido ou expirado.' }
    await supabase.from('profiles').update({ email: newEmail }).eq('id', userId)
    setProfile((prev) => ({ ...prev, email: newEmail }))
    return { ok: true }
  }

  async function resendEmailOtp(newEmail) {
    const { error } = await supabase.auth.resend({ type: 'email_change', email: newEmail })
    if (error) return { ok: false, error: 'Não foi possível reenviar. Tente novamente.' }
    return { ok: true }
  }

  return { profile, saveProfile, updateEmail, verifyEmailOtp, resendEmailOtp }
}
