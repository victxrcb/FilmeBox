import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useFriends(userId) {
  const [friends,         setFriends]         = useState([])
  const [pendingReceived, setPendingReceived] = useState([])
  const [pendingSent,     setPendingSent]     = useState([])
  const [loading,         setLoading]         = useState(true)

  const refresh = useCallback(async () => {
    if (!userId) return
    setLoading(true)

    const { data: fships } = await supabase
      .from('friendships')
      .select('id, requester_id, addressee_id, status, created_at')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)

    if (!fships || fships.length === 0) {
      setFriends([])
      setPendingReceived([])
      setPendingSent([])
      setLoading(false)
      return
    }

    const peerIds = [...new Set(fships.map((f) =>
      f.requester_id === userId ? f.addressee_id : f.requester_id
    ))]

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, display_name, photo')
      .in('id', peerIds)

    const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]))

    const accepted = [], received = [], sent = []
    for (const f of fships) {
      const isRequester = f.requester_id === userId
      const peerId = isRequester ? f.addressee_id : f.requester_id
      const peer = profileMap[peerId] || { id: peerId, username: 'Usuário', display_name: '', photo: '' }
      const entry = {
        friendshipId: f.id,
        userId:       peer.id,
        username:     peer.username,
        displayName:  peer.display_name || '',
        photo:        peer.photo        || '',
        isRequester,
        createdAt:    f.created_at,
      }
      if (f.status === 'accepted')    accepted.push(entry)
      else if (isRequester)           sent.push(entry)
      else                            received.push(entry)
    }

    setFriends(accepted)
    setPendingReceived(received)
    setPendingSent(sent)
    setLoading(false)
  }, [userId])

  useEffect(() => { refresh() }, [refresh])

  function getFriendshipWith(targetId) {
    if (friends.find((f) => f.userId === targetId))
      return { status: 'accepted' }
    const s = pendingSent.find((f) => f.userId === targetId)
    if (s) return { status: 'pending_sent', friendshipId: s.friendshipId }
    const r = pendingReceived.find((f) => f.userId === targetId)
    if (r) return { status: 'pending_received', friendshipId: r.friendshipId }
    return null
  }

  async function sendRequest(addresseeId) {
    const { error } = await supabase.from('friendships').insert({
      requester_id: userId,
      addressee_id: addresseeId,
    })
    if (error) return { ok: false, error: 'Não foi possível enviar o pedido.' }
    await refresh()
    return { ok: true }
  }

  async function acceptRequest(friendshipId) {
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId)
    await refresh()
    return { ok: true }
  }

  async function rejectRequest(friendshipId) {
    await supabase.from('friendships').delete().eq('id', friendshipId)
    await refresh()
    return { ok: true }
  }

  async function removeFriend(friendshipId) {
    await supabase.from('friendships').delete().eq('id', friendshipId)
    await refresh()
    return { ok: true }
  }

  async function searchUsers(query) {
    if (!query.trim()) return []
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, photo')
      .ilike('username', `%${query}%`)
      .neq('id', userId)
      .limit(10)
    return data || []
  }

  return {
    friends, pendingReceived, pendingSent, loading,
    getFriendshipWith, sendRequest, acceptRequest, rejectRequest, removeFriend,
    searchUsers, refresh,
  }
}
