import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useShares(userId) {
  const [allShares, setAllShares]   = useState([])
  const [onlineUsers, setOnlineUsers] = useState(new Set())

  const refresh = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('movie_shares')
      .select('id, sender_id, receiver_id, movie_data, message, seen, created_at')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: true })
    setAllShares(data || [])
  }, [userId])

  useEffect(() => {
    if (!userId) return

    refresh()

    const addRow = (row) =>
      setAllShares((prev) =>
        prev.some((s) => s.id === row.id) ? prev : [...prev, row]
      )

    const updateRow = (row) =>
      setAllShares((prev) =>
        prev.map((s) => (s.id === row.id ? { ...s, ...row } : s))
      )

    // Canal para mensagens em tempo real
    const sharesChannel = supabase
      .channel(`shares_${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'movie_shares',
        filter: `receiver_id=eq.${userId}`,
      }, ({ new: row }) => addRow(row))
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'movie_shares',
        filter: `sender_id=eq.${userId}`,
      }, ({ new: row }) => addRow(row))
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'movie_shares',
        filter: `sender_id=eq.${userId}`,
      }, ({ new: row }) => updateRow(row))
      .subscribe()

    // Canal de presença — rastreia quem está online
    const presenceChannel = supabase
      .channel('online_users')
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        const ids = new Set(
          Object.values(state).flat().map((p) => p.userId)
        )
        setOnlineUsers(ids)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ userId })
        }
      })

    return () => {
      supabase.removeChannel(sharesChannel)
      supabase.removeChannel(presenceChannel)
    }
  }, [userId, refresh])

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

  return { allShares, unreadCount, onlineUsers, sendShare, getConversation, getUnreadFromFriend, markSeenFromFriend }
}
