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

function MoviePicker({ movies, onSelect, onClose }) {
  const [search, setSearch] = useState('')
  const filtered = movies.filter((m) =>
    !search || m.nome.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="absolute inset-0 flex items-end sm:items-center justify-center bg-black/70 rounded-2xl z-10" onClick={onClose}>
      <div
        className="w-full sm:w-80 bg-zinc-900 border border-zinc-700 rounded-t-2xl sm:rounded-2xl max-h-[70%] flex flex-col overflow-hidden shadow-2xl"
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
        <div className="overflow-y-auto flex-1">
          {filtered.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-8">
              {movies.length === 0 ? 'Sua biblioteca está vazia' : 'Nenhum filme encontrado'}
            </p>
          ) : (
            filtered.map((movie) => (
              <button
                key={movie.id}
                onClick={() => { onSelect(movie); onClose() }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800 transition-all border-b border-zinc-800/50 last:border-0"
              >
                <div className="w-8 h-12 bg-zinc-800 rounded-md overflow-hidden shrink-0">
                  {movie.imagem ? (
                    <img src={movie.imagem} alt={movie.nome} className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'}/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-zinc-700">
                        <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-white text-sm font-medium line-clamp-1">{movie.nome}</p>
                  {movie.genero && <p className="text-zinc-500 text-xs">{movie.genero}</p>}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function ChatModal({
  userId,
  friends,
  movies,
  allShares,
  getConversation,
  getUnreadFromFriend,
  onSendShare,
  onMarkSeen,
  onAddMovie,
  onClose,
  initialMovie = null,
}) {
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [pendingMovie, setPendingMovie]     = useState(initialMovie)
  const [caption, setCaption]               = useState('')
  const [showPicker, setShowPicker]         = useState(false)
  const [sending, setSending]               = useState(false)
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl h-[82vh] mx-4 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
          <h2 className="text-white font-bold text-base">Mensagens</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* ── Friends sidebar ── */}
          <div className="w-60 sm:w-64 border-r border-zinc-800 flex flex-col overflow-hidden shrink-0">
            <div className="flex-1 overflow-y-auto">
              {friends.length === 0 ? (
                <div className="p-4 text-center pt-8">
                  <p className="text-zinc-600 text-sm">Nenhum amigo ainda</p>
                </div>
              ) : (
                sortedFriends.map((friend) => {
                  const display    = friend.displayName || friend.username
                  const unread     = getUnreadFromFriend(friend.userId)
                  const lastMsg    = allShares.findLast((s) => s.sender_id === friend.userId || s.receiver_id === friend.userId)
                  const isSelected = selectedFriend?.userId === friend.userId

                  return (
                    <button
                      key={friend.userId}
                      onClick={() => setSelectedFriend(friend)}
                      className={`w-full flex items-center gap-3 px-3 py-3 transition-all border-b border-zinc-900/80 ${
                        isSelected ? 'bg-zinc-800/80' : 'hover:bg-zinc-900'
                      }`}
                    >
                      <FriendAvatar friend={friend} size={9}/>
                      <div className="flex-1 min-w-0 text-left">
                        <p className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                          {display}
                        </p>
                        {lastMsg ? (
                          <p className="text-zinc-600 text-xs truncate">
                            {lastMsg.sender_id === userId ? 'Você: ' : ''}
                            {lastMsg.movie_data ? lastMsg.movie_data.nome : lastMsg.message || ''}
                          </p>
                        ) : (
                          <p className="text-zinc-700 text-xs">Nenhuma mensagem</p>
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
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedFriend ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
                <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7 text-zinc-700">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm font-medium">Selecione um amigo</p>
                  <p className="text-zinc-700 text-xs mt-1">para conversar e compartilhar filmes</p>
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
                {/* Conversation header */}
                <div className="px-4 py-3 border-b border-zinc-800 shrink-0 flex items-center gap-2.5">
                  <FriendAvatar friend={selectedFriend} size={7}/>
                  <p className="text-white font-semibold text-sm">
                    {selectedFriend.displayName || selectedFriend.username}
                  </p>
                </div>

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
                          {movie ? (
                            /* ── Mensagem com filme ── */
                            <div className={`max-w-[260px] rounded-2xl overflow-hidden border ${
                              isMe
                                ? 'bg-red-600/10 border-red-600/20 rounded-tr-sm'
                                : 'bg-zinc-900 border-zinc-800 rounded-tl-sm'
                            }`}>
                              <div className="flex gap-2.5 p-3">
                                <div className="w-10 shrink-0 bg-zinc-800 rounded-lg overflow-hidden" style={{ aspectRatio: '2/3' }}>
                                  {movie.imagem ? (
                                    <img src={movie.imagem} alt={movie.nome} className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'}/>
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-zinc-700 opacity-50">
                                        <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-white text-xs font-semibold leading-snug line-clamp-2">{movie.nome}</p>
                                  {movie.genero && <p className="text-zinc-500 text-[11px] mt-0.5">{movie.genero}</p>}
                                </div>
                              </div>
                              {msg.message && (
                                <p className="px-3 pb-2.5 -mt-1 text-zinc-400 text-xs italic leading-relaxed">
                                  "{msg.message}"
                                </p>
                              )}
                              {!isMe && (
                                <div className="px-3 pb-3 -mt-0.5">
                                  <button
                                    onClick={() => onAddMovie({ nome: movie.nome, imagem: movie.imagem, genero: movie.genero, sinopse: movie.sinopse, tmdbID: movie.tmdbID })}
                                    className="btn-primary text-[11px] py-1 px-2.5 w-full"
                                  >
                                    + Adicionar à biblioteca
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            /* ── Mensagem de texto puro ── */
                            <div className={`max-w-[260px] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                              isMe
                                ? 'bg-red-600/15 text-white rounded-tr-sm'
                                : 'bg-zinc-800 text-zinc-200 rounded-tl-sm'
                            }`}>
                              {msg.message}
                            </div>
                          )}
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
          </div>
        </div>

        {showPicker && (
          <MoviePicker
            movies={movies}
            onSelect={setPendingMovie}
            onClose={() => setShowPicker(false)}
          />
        )}
      </div>
    </div>
  )
}
