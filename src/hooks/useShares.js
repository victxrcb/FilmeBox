import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useShares(userId) {
  const [allShares, setAllShares] = useState([])

  const refresh = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('movie_shares')
      .select('id, sender_id, receiver_id, movie_data, message, seen, created_at')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: true })
    setAllShares(data || [])
  }, [userId])

  useEffect(() => { refresh() }, [refresh])

  function getConversation(friendId) {
    return allShares.filter((s) =>
      (s.sender_id === userId && s.receiver_id === friendId) ||
      (s.sender_id === friendId && s.receiver_id === userId)
    )
  }

  function getUnreadFromFriend(friendId) {
    return allShares.filter((s) => s.sender_id === friendId && s.receiver_id === userId && !s.seen).length
  }

  async function sendShare(receiverId, movieData = null, message = '') {
    const { error } = await supabase.from('movie_shares').insert({
      sender_id:   userId,
      receiver_id: receiverId,
      movie_data: movieData ? {
        nome:    movieData.nome,
        imagem:  movieData.imagem  || null,
        genero:  movieData.genero  || null,
        sinopse: movieData.sinopse || null,
        tmdbID:  movieData.tmdbID  || null,
      } : null,
      message: message.trim(),
    })
    if (error) return { ok: false, error: 'Não foi possível enviar.' }
    await refresh()
    return { ok: true }
  }

  async function markSeenFromFriend(friendId) {
    const toMark = allShares
      .filter((s) => s.sender_id === friendId && s.receiver_id === userId && !s.seen)
      .map((s) => s.id)
    if (toMark.length === 0) return
    await supabase.from('movie_shares').update({ seen: true }).in('id', toMark)
    setAllShares((prev) => prev.map((s) => toMark.includes(s.id) ? { ...s, seen: true } : s))
  }

  const unreadCount = allShares.filter((s) => s.receiver_id === userId && !s.seen).length

  return { allShares, unreadCount, sendShare, getConversation, getUnreadFromFriend, markSeenFromFriend }
}
