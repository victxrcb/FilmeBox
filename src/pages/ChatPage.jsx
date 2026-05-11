import { useState, useEffect, useRef } from 'react'

function FriendAvatar({ friend, size = 9 }) {
  const display = friend.displayName || friend.username
  return (
    <div className={`w-${size} h-${size} rounded-full overflow-hidden bg-zinc-800 shrink-0`}>
      {friend.photo ? (
        <img src={friend.photo} alt={display} className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'}/>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-800 to-red-950">
          <span className="text-white text-xs font-bold select-none">{display.charAt(0).toUpperCase()}</span>
        </div>
      )}
    </div>
  )
}


function SeenIndicator({ seen }) {
  return (
    <span className={`text-[10px] select-none ${seen ? 'text-red-400' : 'text-zinc-600'}`}>
      {seen ? '✓✓ visto' : '✓'}
    </span>
  )
}

function MovieMessageCard({ movie, message, isMe, onAddMovie }) {
  const [added, setAdded] = useState(false)

  function handleAdd() {
    onAddMovie({ nome: movie.nome, imagem: movie.imagem, genero: movie.genero, sinopse: movie.sinopse, tmdbID: movie.tmdbID })
    setAdded(true)
  }

  return (
    <div className={`w-52 rounded-2xl overflow-hidden border ${
      isMe ? 'bg-red-600/10 border-red-600/20 rounded-tr-sm' : 'bg-zinc-900 border-zinc-800 rounded-tl-sm'
    }`}>
      {/* Capa do filme */}
      <div className="w-full bg-zinc-800 overflow-hidden" style={{ aspectRatio: '2/3' }}>
        {movie.imagem ? (
          <img src={movie.imagem} alt={movie.nome} className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'}/>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-zinc-700">
              <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-3 pt-2.5 pb-1">
        <p className="text-white text-sm font-semibold leading-snug line-clamp-2">{movie.nome}</p>
        {movie.genero && <p className="text-zinc-500 text-xs mt-0.5">{movie.genero}</p>}
      </div>

      {message && (
        <p className="px-3 pb-1.5 text-zinc-400 text-xs italic leading-relaxed">"{message}"</p>
      )}

      {!isMe && (
        <div className="px-3 pb-3 pt-1">
          <button
            onClick={handleAdd}
            disabled={added}
            className={`w-full text-xs py-1.5 rounded-lg font-semibold transition-all duration-500 ${
              added
                ? 'bg-green-600/20 text-green-400 border border-green-500/40 scale-95'
                : 'btn-primary'
            }`}
          >
            {added ? '✓ Adicionado' : '+ Adicionar à biblioteca'}
          </button>
        </div>
      )}
    </div>
  )
}

function MoviePicker({ movies, onSelect, onClose }) {
  const [search, setSearch] = useState('')
  const filtered = movies.filter((m) =>
    !search || m.nome.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="absolute inset-0 flex items-end sm:items-center justify-center bg-black/70 z-10" onClick={onClose}>
      <div
        className="w-full sm:w-[520px] bg-zinc-900 border border-zinc-700 rounded-t-2xl sm:rounded-2xl max-h-[75%] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
          <p className="text-white text-sm font-semibold">Escolher filme</p>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="px-3 py-2 border-b border-zinc-800 shrink-0">
          <input
            autoFocus
            className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-red-600/60 transition-all"
            placeholder="Buscar na sua biblioteca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="overflow-y-auto flex-1 p-3">
          {filtered.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-8">
              {movies.length === 0 ? 'Sua biblioteca está vazia' : 'Nenhum filme encontrado'}
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {filtered.map((movie) => (
                <button
                  key={movie.id}
                  onClick={() => { onSelect(movie); onClose() }}
                  className="flex flex-col gap-1.5 rounded-xl overflow-hidden hover:bg-zinc-800 transition-all p-1.5 text-left group"
                >
                  <div className="w-full bg-zinc-800 rounded-lg overflow-hidden" style={{ aspectRatio: '2/3' }}>
                    {movie.imagem ? (
                      <img src={movie.imagem} alt={movie.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" onError={(e) => e.target.style.display = 'none'}/>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-zinc-700">
                          <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-zinc-300 text-[11px] font-medium line-clamp-2 leading-tight px-0.5">{movie.nome}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ChatPage({
  userId,
  friends,
  movies,
  allShares,
  getConversation,
  getUnreadFromFriend,
  onSendShare,
  onMarkSeen,
  onAddMovie,
  onBack,
  initialMovie = null,
  initialFriend = null,
  onlineUsers = new Set(),
}) {
  const [selectedFriend, setSelectedFriend] = useState(initialFriend)
  const [pendingMovie, setPendingMovie]     = useState(initialMovie)
  const [caption, setCaption]               = useState('')
  const [showPicker, setShowPicker]         = useState(false)
  const [sending, setSending]               = useState(false)
  const [showSidebar, setShowSidebar]       = useState(initialFriend ? false : true)
  const messagesEndRef                      = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedFriend, allShares])

  useEffect(() => {
    if (selectedFriend) onMarkSeen(selectedFriend.userId)
  }, [selectedFriend])

  const conversation = selectedFriend ? getConversation(selectedFriend.userId) : []

  const sortedFriends = [...friends].sort((a, b) => {
    const lastA = allShares.findLast((s) => s.sender_id === a.userId || s.receiver_id === a.userId)?.created_at || ''
    const lastB = allShares.findLast((s) => s.sender_id === b.userId || s.receiver_id === b.userId)?.created_at || ''
    return lastB.localeCompare(lastA)
  })

  async function handleSend() {
    if (!selectedFriend || (!pendingMovie && !caption.trim())) return
    setSending(true)
    const result = await onSendShare(selectedFriend.userId, pendingMovie, caption)
    setSending(false)
    if (result.ok) {
      setPendingMovie(null)
      setCaption('')
    }
  }

  function handleSelectFriend(friend) {
    setSelectedFriend(friend)
    setShowSidebar(false)
  }

  const friendIsOnline = selectedFriend ? onlineUsers.has(selectedFriend.userId) : false

  return (
    <div className="h-screen bg-zinc-950 flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <header className="bg-black/90 backdrop-blur-md border-b border-zinc-900 shrink-0">
        <div className="px-2 h-14 flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all shrink-0"
            title="Voltar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
            </svg>
          </button>

          {/* Mobile — conversa aberta: mostra info do amigo */}
          {selectedFriend && !showSidebar ? (
            <div className="flex sm:hidden items-center gap-2.5 min-w-0 flex-1">
              <div className="relative shrink-0">
                <FriendAvatar friend={selectedFriend} size={8}/>
                <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-black ${friendIsOnline ? 'bg-green-500' : 'bg-zinc-600'}`}/>
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">
                  {selectedFriend.displayName || selectedFriend.username}
                </p>
                <p className={`text-[11px] leading-none ${friendIsOnline ? 'text-green-500' : 'text-zinc-500'}`}>
                  {friendIsOnline ? 'online' : 'offline'}
                </p>
              </div>
            </div>
          ) : null}

          {/* Título padrão — desktop sempre, mobile só na sidebar */}
          <div className={`${selectedFriend && !showSidebar ? 'hidden sm:flex' : 'flex'} items-center gap-2`}>
            <div className="w-7 h-7 bg-red-600 rounded-md flex items-center justify-center shadow-md shadow-red-900/60">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
              </svg>
            </div>
            <h1 className="text-white font-bold text-base">Mensagens</h1>
          </div>

          {/* Desktop — amigo selecionado no lado direito do header principal */}
          {selectedFriend && (
            <div className="hidden sm:flex items-center gap-3 ml-30">
              <div className="relative shrink-0">
                <FriendAvatar friend={selectedFriend} size={10}/>
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-black ${friendIsOnline ? 'bg-green-500' : 'bg-zinc-600'}`}/>
              </div>
              <div>
                <p className="text-white text-base font-semibold leading-tight">
                  {selectedFriend.displayName || selectedFriend.username}
                </p>
                <p className={`text-xs leading-tight ${friendIsOnline ? 'text-green-500' : 'text-zinc-500'}`}>
                  {friendIsOnline ? 'online' : 'offline'}
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden w-full">

        {/* ── Friends sidebar ── */}
        <div className={`${showSidebar ? 'flex' : 'hidden'} sm:flex w-full sm:w-72 border-r border-zinc-800 flex-col overflow-hidden shrink-0`}>
          <div className="h-10 px-4 border-b border-zinc-800 shrink-0 flex items-center">
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Conversas</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {friends.length === 0 ? (
              <div className="p-6 text-center pt-10">
                <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-zinc-700">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
                  </svg>
                </div>
                <p className="text-zinc-600 text-sm">Nenhum amigo ainda</p>
                <p className="text-zinc-700 text-xs mt-1">Adicione amigos para conversar</p>
              </div>
            ) : (
              sortedFriends.map((friend) => {
                const display    = friend.displayName || friend.username
                const unread     = getUnreadFromFriend(friend.userId)
                const lastMsg    = allShares.findLast((s) => s.sender_id === friend.userId || s.receiver_id === friend.userId)
                const isSelected = selectedFriend?.userId === friend.userId
                const isOnline   = onlineUsers.has(friend.userId)

                return (
                  <button
                    key={friend.userId}
                    onClick={() => handleSelectFriend(friend)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all border-b border-zinc-900/80 ${
                      isSelected ? 'bg-zinc-800/80' : 'hover:bg-zinc-900'
                    }`}
                  >
                    {/* Avatar com bolinha de status */}
                    <div className="relative shrink-0">
                      <FriendAvatar friend={friend} size={10}/>
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-zinc-950 ${isOnline ? 'bg-green-500' : 'bg-zinc-600'}`}/>
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <p className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                        {display}
                      </p>
                      {lastMsg ? (
                        <p className="text-zinc-600 text-xs truncate mt-0.5">
                          {lastMsg.sender_id === userId ? 'Você: ' : ''}
                          {lastMsg.movie_data ? lastMsg.movie_data.nome : lastMsg.message || ''}
                        </p>
                      ) : (
                        <p className="text-zinc-700 text-xs mt-0.5">Nenhuma mensagem</p>
                      )}
                    </div>
                    {unread > 0 && (
                      <span className="w-5 h-5 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shrink-0">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* ── Conversation panel ── */}
        <div className={`${!showSidebar ? 'flex' : 'hidden'} sm:flex flex-1 flex-col overflow-hidden relative`}>
          {!selectedFriend ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
              <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-zinc-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
                </svg>
              </div>
              <div>
                <p className="text-zinc-400 text-sm font-medium">Selecione um amigo</p>
                <p className="text-zinc-600 text-xs mt-1">para conversar e compartilhar filmes</p>
              </div>
              {pendingMovie && (
                <div className="mt-2 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 flex items-center gap-2 max-w-[200px]">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-500 shrink-0">
                    <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
                  </svg>
                  <p className="text-zinc-300 text-xs line-clamp-1 flex-1">{pendingMovie.nome}</p>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {conversation.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-zinc-700 text-sm">Nenhuma mensagem ainda</p>
                  </div>
                ) : (
                  conversation.map((msg) => {
                    const isMe = msg.sender_id === userId
                    const movie = msg.movie_data
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          {movie ? (
                            <MovieMessageCard
                              movie={movie}
                              message={msg.message}
                              isMe={isMe}
                              onAddMovie={onAddMovie}
                            />
                          ) : (
                            <div className={`max-w-[280px] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                              isMe
                                ? 'bg-red-600/15 text-white rounded-tr-sm'
                                : 'bg-zinc-800 text-zinc-200 rounded-tl-sm'
                            }`}>
                              {msg.message}
                            </div>
                          )}
                          {isMe && <SeenIndicator seen={msg.seen}/>}
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef}/>
              </div>

              {/* ── Compose area ── */}
              <div className="border-t border-zinc-800 p-3 space-y-2 shrink-0">
                {pendingMovie && (
                  <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-2.5 flex items-center gap-2.5">
                    <div className="w-8 h-12 bg-zinc-800 rounded-md overflow-hidden shrink-0">
                      {pendingMovie.imagem ? (
                        <img src={pendingMovie.imagem} alt={pendingMovie.nome} className="w-full h-full object-cover"/>
                      ) : (
                        <div className="w-full h-full bg-zinc-700 rounded-md"/>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium line-clamp-1">{pendingMovie.nome}</p>
                      {pendingMovie.genero && <p className="text-zinc-600 text-[11px]">{pendingMovie.genero}</p>}
                    </div>
                    <button onClick={() => setPendingMovie(null)} className="text-zinc-600 hover:text-zinc-400 shrink-0 transition-colors">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPicker(true)}
                    className="shrink-0 p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all border border-zinc-800 hover:border-zinc-600"
                    title="Escolher filme"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
                    </svg>
                  </button>
                  <input
                    className="flex-1 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-600/60 focus:ring-1 focus:ring-red-600/20 transition-all"
                    placeholder="Mensagem..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !sending) handleSend() }}
                    maxLength={200}
                  />
                  <button
                    onClick={handleSend}
                    disabled={(!pendingMovie && !caption.trim()) || sending}
                    className="btn-primary px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center justify-center"
                  >
                    {sending ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {showPicker && (
            <MoviePicker
              movies={movies}
              onSelect={setPendingMovie}
              onClose={() => setShowPicker(false)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
