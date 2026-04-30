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
        })
      })
  }, [userId])

  async function saveProfile(data) {
    const dbData = {}
    if ('displayName'  in data) dbData.display_name  = data.displayName
    if ('photo'        in data) dbData.photo          = data.photo
    if ('banner'       in data) dbData.banner         = data.banner
    if ('topFavorites' in data) dbData.top_favorites  = data.topFavorites

    await supabase.from('profiles').update(dbData).eq('id', userId)
    setProfile((prev) => ({ ...prev, ...data }))
  }

  return { profile, saveProfile }
}
