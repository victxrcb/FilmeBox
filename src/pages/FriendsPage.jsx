import { useState, useRef, useEffect } from 'react'
import FriendProfileModal from '../components/FriendProfileModal'

function UserAvatar({ photo, name }) {
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700">
      {photo ? (
        <img src={photo} alt={name} className="w-full h-full object-cover"
          onError={(e) => { e.target.style.display = 'none' }}/>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-800 to-red-950">
          <span className="text-white text-sm font-bold select-none">
            {(name || '?').charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  )
}

const TABS = [
  { id: 'friends', label: 'Amigos' },
  { id: 'pending', label: 'Pedidos' },
  { id: 'search',  label: 'Buscar'  },
]

export default function FriendsPage({
  friends, pendingReceived, pendingSent, loading,
  sendRequest, acceptRequest, rejectRequest, removeFriend,
  searchUsers, getFriendshipWith,
  onBack,
}) {
  const [tab,            setTab]            = useState('friends')
  const [searchQuery,    setSearchQuery]    = useState('')
  const [searchResults,  setSearchResults]  = useState([])
  const [searching,      setSearching]      = useState(false)
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [busyIds,        setBusyIds]        = useState(new Set())
  const searchTimeout = useRef(null)

  useEffect(() => {
    clearTimeout(searchTimeout.current)
    if (!searchQuery.trim()) { setSearchResults([]); return }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true)
      const results = await searchUsers(searchQuery)
      setSearchResults(results)
      setSearching(false)
    }, 400)
    return () => clearTimeout(searchTimeout.current)
  }, [searchQuery, searchUsers])

  function setBusy(id, val) {
    setBusyIds((prev) => {
      const s = new Set(prev)
      if (val) s.add(id); else s.delete(id)
      return s
    })
  }

  async function handleSend(targetId) {
    setBusy(targetId, true)
    await sendRequest(targetId)
    setBusy(targetId, false)
  }

  async function handleAccept(friendshipId) {
    setBusy(friendshipId, true)
    await acceptRequest(friendshipId)
    setBusy(friendshipId, false)
  }

  async function handleReject(friendshipId) {
    setBusy(friendshipId, true)
    await rejectRequest(friendshipId)
    setBusy(friendshipId, false)
  }

  async function handleRemove(friendshipId) {
    setBusy(friendshipId, true)
    await removeFriend(friendshipId)
    setBusy(friendshipId, false)
  }

  function FriendshipBtn({ targetId }) {
    const rel   = getFriendshipWith(targetId)
    const busy  = busyIds.has(targetId)

    if (rel?.status === 'accepted')
      return <span className="text-xs text-zinc-500 bg-zinc-800 px-3 py-1.5 rounded-lg">Amigo</span>

    if (rel?.status === 'pending_sent')
      return <span className="text-xs text-zinc-500 bg-zinc-800 px-3 py-1.5 rounded-lg">Pendente</span>

    if (rel?.status === 'pending_received') {
      const entry = pendingReceived.find((f) => f.userId === targetId)
      return (
        <button disabled={busy} onClick={() => entry && handleAccept(entry.friendshipId)}
          className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
          Aceitar
        </button>
      )
    }

    return (
      <button disabled={busy} onClick={() => handleSend(targetId)}
        className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
        {busy ? '…' : 'Adicionar'}
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button onClick={onBack}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
            </svg>
            <span className="text-sm font-medium">Voltar</span>
          </button>
          <div className="w-px h-5 bg-zinc-800"/>
          <span className="text-white font-semibold text-sm">Amigos</span>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-zinc-900 bg-black/50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 flex gap-1">
          {TABS.map((t) => {
            const count = t.id === 'pending' ? pendingReceived.length : t.id === 'friends' ? friends.length : 0
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all ${
                  tab === t.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}>
                {t.label}
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    tab === t.id ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-500'
                  }`}>{count}</span>
                )}
                {tab === t.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-t-full"/>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex justify-center py-24">
            <span className="w-8 h-8 border-2 border-zinc-700 border-t-red-600 rounded-full animate-spin"/>
          </div>
        ) : (
          <>
            {/* ── Amigos ── */}
            {tab === 'friends' && (
              friends.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in-up">
                  <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-4 text-3xl">👥</div>
                  <h3 className="text-white font-semibold text-lg mb-2">Nenhum amigo ainda</h3>
                  <p className="text-zinc-600 text-sm mb-5 max-w-xs">Pesquise pelo username de alguém para enviar um pedido de amizade</p>
                  <button onClick={() => setTab('search')} className="btn-primary text-sm">Buscar amigos</button>
                </div>
              ) : (
                <div className="space-y-2 animate-fade-in-up">
                  {friends.map((f) => (
                    <div key={f.friendshipId}
                      className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 hover:border-zinc-700 transition-colors">
                      <UserAvatar photo={f.photo} name={f.displayName || f.username}/>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{f.displayName || f.username}</p>
                        <p className="text-zinc-500 text-xs">@{f.username}</p>
                      </div>
                      <button onClick={() => setSelectedFriend(f)}
                        className="text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-all shrink-0">
                        Ver perfil
                      </button>
                      <button
                        onClick={() => handleRemove(f.friendshipId)}
                        disabled={busyIds.has(f.friendshipId)}
                        className="p-1.5 text-zinc-600 hover:text-red-400 rounded-lg transition-colors disabled:opacity-40 shrink-0"
                        title="Remover amigo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* ── Pedidos ── */}
            {tab === 'pending' && (
              pendingReceived.length === 0 && pendingSent.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in-up">
                  <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-4 text-3xl">📬</div>
                  <h3 className="text-white font-semibold text-lg mb-2">Nenhum pedido</h3>
                  <p className="text-zinc-600 text-sm max-w-xs">Pedidos de amizade recebidos e enviados aparecerão aqui</p>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in-up">
                  {pendingReceived.length > 0 && (
                    <div>
                      <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
                        Recebidos ({pendingReceived.length})
                      </p>
                      <div className="space-y-2">
                        {pendingReceived.map((f) => (
                          <div key={f.friendshipId}
                            className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
                            <UserAvatar photo={f.photo} name={f.displayName || f.username}/>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium text-sm truncate">{f.displayName || f.username}</p>
                              <p className="text-zinc-500 text-xs">@{f.username}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => handleAccept(f.friendshipId)}
                                disabled={busyIds.has(f.friendshipId)}
                                className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                                Aceitar
                              </button>
                              <button
                                onClick={() => handleReject(f.friendshipId)}
                                disabled={busyIds.has(f.friendshipId)}
                                className="text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                                Recusar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {pendingSent.length > 0 && (
                    <div>
                      <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
                        Enviados ({pendingSent.length})
                      </p>
                      <div className="space-y-2">
                        {pendingSent.map((f) => (
                          <div key={f.friendshipId}
                            className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
                            <UserAvatar photo={f.photo} name={f.displayName || f.username}/>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium text-sm truncate">{f.displayName || f.username}</p>
                              <p className="text-zinc-500 text-xs">@{f.username}</p>
                            </div>
                            <span className="text-xs text-zinc-500 bg-zinc-800 px-3 py-1.5 rounded-lg shrink-0">
                              Pendente
                            </span>
                            <button
                              onClick={() => handleReject(f.friendshipId)}
                              disabled={busyIds.has(f.friendshipId)}
                              className="p-1.5 text-zinc-600 hover:text-red-400 rounded-lg transition-colors disabled:opacity-40 shrink-0"
                              title="Cancelar pedido">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            )}

            {/* ── Buscar ── */}
            {tab === 'search' && (
              <div className="animate-fade-in-up">
                <div className="relative mb-6">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                    className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Buscar por username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-red-600/60 focus:ring-1 focus:ring-red-600/20 transition-all"
                  />
                  {searching && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-zinc-700 border-t-red-600 rounded-full animate-spin"/>
                  )}
                </div>

                {!searchQuery && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-4 text-3xl">🔍</div>
                    <p className="text-zinc-500 text-sm">Digite o username de alguém para buscar</p>
                  </div>
                )}

                {searchQuery && !searching && searchResults.length === 0 && (
                  <div className="text-center py-14 text-zinc-600">
                    <p className="text-lg mb-1">Nenhum usuário encontrado</p>
                    <p className="text-sm">Tente outro username</p>
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.map((result) => (
                      <div key={result.id}
                        className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 hover:border-zinc-700 transition-colors">
                        <UserAvatar photo={result.photo} name={result.display_name || result.username}/>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">{result.display_name || result.username}</p>
                          <p className="text-zinc-500 text-xs">@{result.username}</p>
                        </div>
                        <FriendshipBtn targetId={result.id}/>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {selectedFriend && (
        <FriendProfileModal friend={selectedFriend} onClose={() => setSelectedFriend(null)}/>
      )}
    </div>
  )
}
