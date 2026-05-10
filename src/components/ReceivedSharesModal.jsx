export default function ReceivedSharesModal({ shares, onClose, onAdd, onDismiss }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="text-white font-bold">Filmes recebidos</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {shares.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7 text-zinc-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"/>
              </svg>
            </div>
            <p className="text-zinc-500 text-sm font-medium">Nenhum filme recebido</p>
            <p className="text-zinc-700 text-xs mt-1">Quando um amigo compartilhar um filme, ele aparecerá aqui</p>
          </div>
        ) : (
          <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
            {shares.map((share) => {
              const sender = share.profiles
              const senderDisplay = sender?.display_name || sender?.username || 'Alguém'
              const movie = share.movie_data
              return (
                <div key={share.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex gap-3 animate-fade-in-up">
                  <div className="w-12 shrink-0 bg-zinc-800 rounded-lg overflow-hidden" style={{ aspectRatio: '2/3' }}>
                    {movie.imagem ? (
                      <img src={movie.imagem} alt={movie.nome} className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'}/>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 opacity-30">
                          <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold leading-tight line-clamp-1">{movie.nome}</p>
                    {movie.genero && <p className="text-zinc-500 text-xs mt-0.5">{movie.genero}</p>}
                    <p className="text-zinc-600 text-xs mt-1">
                      De <span className="text-zinc-400 font-medium">{senderDisplay}</span>
                    </p>
                    {share.message && (
                      <p className="text-zinc-400 text-xs mt-1.5 italic line-clamp-2">"{share.message}"</p>
                    )}
                    <div className="flex gap-2 mt-2.5">
                      <button onClick={() => onAdd(share)} className="btn-primary text-xs py-1 px-3">
                        + Adicionar
                      </button>
                      <button onClick={() => onDismiss(share.id)} className="btn-secondary text-xs py-1 px-3">
                        Dispensar
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
