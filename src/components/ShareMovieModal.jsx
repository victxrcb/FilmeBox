import { useState } from 'react'

export default function ShareMovieModal({ movie, friends, onShare, onClose }) {
  const [selected, setSelected] = useState(null)
  const [message, setMessage]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [error, setError]       = useState('')

  async function handleSend() {
    if (!selected) return
    setLoading(true)
    setError('')
    const result = await onShare(selected.userId, movie, message)
    setLoading(false)
    if (!result.ok) { setError(result.error); return }
    setSent(true)
    setTimeout(onClose, 1400)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div className="min-w-0">
            <h2 className="text-white font-bold">Compartilhar filme</h2>
            <p className="text-zinc-500 text-xs mt-0.5 truncate">{movie.nome}</p>
          </div>
          <button onClick={onClose} className="shrink-0 ml-3 text-zinc-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {sent ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-14 h-14 bg-emerald-600/20 border border-emerald-600/30 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-7 h-7 text-emerald-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                </svg>
              </div>
              <p className="text-white font-semibold">Compartilhado com sucesso!</p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Enviar para</p>
                {friends.length === 0 ? (
                  <p className="text-zinc-600 text-sm">Você ainda não tem amigos adicionados.</p>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {friends.map((friend) => {
                      const display = friend.displayName || friend.username
                      const isSelected = selected?.userId === friend.userId
                      return (
                        <button
                          key={friend.userId}
                          onClick={() => setSelected(isSelected ? null : friend)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-red-600/10 border-red-600/40'
                              : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                            {friend.photo ? (
                              <img src={friend.photo} alt={display} className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'}/>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-800 to-red-950">
                                <span className="text-white text-xs font-bold select-none">{display.charAt(0).toUpperCase()}</span>
                              </div>
                            )}
                          </div>
                          <span className={`text-sm font-medium flex-1 text-left ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                            {display}
                          </span>
                          {isSelected && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 text-red-400 shrink-0">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                            </svg>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Mensagem (opcional)</p>
                <textarea
                  className="input-field resize-none text-sm"
                  rows={2}
                  placeholder="Escreva algo sobre o filme..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={200}
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}
            </>
          )}
        </div>

        {!sent && (
          <div className="flex justify-end gap-2 p-5 border-t border-zinc-800">
            <button onClick={onClose} className="btn-secondary text-sm py-2 px-4">Cancelar</button>
            <button
              onClick={handleSend}
              disabled={!selected || loading}
              className="btn-primary text-sm py-2 px-4 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
              Enviar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
