import { useState } from 'react'
import AddMovieModal from './AddMovieModal'

function PopcornRating({ value = 0, onChange }) {
  const [hover, setHover] = useState(0)
  const active = hover || value

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(value === n ? 0 : n)}
          onMouseEnter={() => setHover(n)}
          className="focus:outline-none transition-transform hover:scale-125"
          title={`${n} balde${n > 1 ? 's' : ''} de pipoca`}
        >
          <span className={`text-2xl transition-all ${active >= n ? 'opacity-100' : 'opacity-20 grayscale'}`}>
            🍿
          </span>
        </button>
      ))}
      {value > 0 && (
        <span className="text-zinc-500 text-sm ml-2">{value}/5</span>
      )}
    </div>
  )
}

const StarIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.5}
    className={`w-5 h-5 transition-all duration-200 ${filled ? 'text-amber-400' : 'text-zinc-500 hover:text-amber-300'}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
  </svg>
)

const STATUS_OPTS = [
  { value: null,        label: 'Nenhum',    cls: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
  { value: 'watchlist', label: 'Watchlist', cls: 'bg-blue-600/20 text-blue-400 border-blue-600/30' },
  { value: 'assistido', label: 'Assistido', cls: 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30' },
]

export default function MovieDetailModal({ movie, onClose, onToggleFavorite, onUpdate, onDelete, onOpenChat }) {
  const [editing, setEditing]             = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [starAnim, setStarAnim]           = useState(false)
  const [obs, setObs]                     = useState(movie?.observacao || '')
  const [obsSaved, setObsSaved]           = useState(true)

  if (!movie) return null

  const isFromAPI = !!movie.tmdbID

  if (editing) {
    return (
      <AddMovieModal
        initial={movie}
        onClose={() => setEditing(false)}
        onSave={(data) => { onUpdate(movie.id, data); setEditing(false) }}
      />
    )
  }

  function handleFav() {
    setStarAnim(true)
    onToggleFavorite(movie.id)
    setTimeout(() => setStarAnim(false), 400)
  }

  function handleDelete() {
    if (confirmDelete) { onDelete(movie.id); onClose() }
    else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  function handleStatusChange(value) {
    onUpdate(movie.id, { status: value })
  }

  function handleRate(n) {
    onUpdate(movie.id, { avaliacao: n })
  }

  function handleObsSave() {
    onUpdate(movie.id, { observacao: obs })
    setObsSaved(true)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-h-[90vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-zinc-800">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={handleFav}
              className={`shrink-0 hover:scale-110 transition-transform ${starAnim ? 'animate-star-pop' : ''}`}
              title={movie.favorito ? 'Remover dos favoritos' : 'Marcar como favorito'}>
              <StarIcon filled={movie.favorito}/>
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white leading-tight truncate">{movie.nome}</h2>
                {isFromAPI && (
                  <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded-full shrink-0">
                    TMDB
                  </span>
                )}
              </div>
              {movie.genero && <span className="tag text-xs mt-1 inline-block">{movie.genero}</span>}
            </div>
          </div>
          <button onClick={onClose} className="shrink-0 ml-3 text-zinc-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Poster */}
            <div className="shrink-0">
              <div className="aspect-[2/3] w-full sm:w-40 bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700">
                {movie.imagem ? (
                  <img src={movie.imagem} alt={movie.nome} className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'}/>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 opacity-30">
                      <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 space-y-4 min-w-0">

              {/* Status selector */}
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Status</p>
                <div className="flex gap-2 flex-wrap">
                  {STATUS_OPTS.map((opt) => (
                    <button key={String(opt.value)} onClick={() => handleStatusChange(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                        movie.status === opt.value
                          ? opt.cls + ' scale-105'
                          : 'bg-zinc-900 text-zinc-600 border-zinc-800 hover:border-zinc-600 hover:text-zinc-400'
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Avaliação — aparece quando assistido */}
              {movie.status === 'assistido' && (
                <div className="animate-fade-in-up">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Sua avaliação</p>
                  <PopcornRating value={movie.avaliacao ?? 0} onChange={handleRate} />
                  {!(movie.avaliacao > 0) && (
                    <p className="text-zinc-600 text-xs mt-2">Clique nas pipocas para avaliar</p>
                  )}
                </div>
              )}

              {/* Sinopse */}
              {movie.sinopse && (
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Sinopse</p>
                  <p className="text-zinc-300 text-sm leading-relaxed">{movie.sinopse}</p>
                </div>
              )}

              {/* Observação — editável inline para filmes da API, somente leitura para manuais */}
              {isFromAPI ? (
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Minhas observações
                  </p>
                  <textarea
                    className="input-field resize-none text-sm"
                    rows={3}
                    placeholder="Adicione suas observações pessoais sobre o filme..."
                    value={obs}
                    onChange={(e) => { setObs(e.target.value); setObsSaved(false) }}
                  />
                  {!obsSaved && (
                    <button
                      onClick={handleObsSave}
                      className="btn-primary text-xs py-1.5 px-4 mt-2"
                    >
                      Salvar observação
                    </button>
                  )}
                  {obsSaved && obs && (
                    <p className="text-zinc-600 text-xs mt-1.5">✓ Salvo</p>
                  )}
                </div>
              ) : (
                <>
                  {movie.observacao && (
                    <div>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Minhas observações</p>
                      <div className="bg-red-600/5 border border-red-600/20 rounded-lg p-3">
                        <p className="text-zinc-300 text-sm leading-relaxed">{movie.observacao}</p>
                      </div>
                    </div>
                  )}
                  {!movie.sinopse && !movie.observacao && (
                    <p className="text-zinc-600 text-sm italic">Nenhuma informação adicionada.</p>
                  )}
                </>
              )}  

              {/* Aviso de somente leitura para filmes da API */}
              {isFromAPI && (
                <p className="text-zinc-700 text-xs flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
                  </svg>
                  Informações do filme vêm do TMDB e não podem ser editadas
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-zinc-800 gap-3">
          <button onClick={handleDelete}
            className={`btn-danger text-sm py-2 px-4 transition-all ${confirmDelete ? 'animate-pulse' : ''}`}>
            {confirmDelete ? 'Confirmar exclusão' : 'Excluir'}
          </button>
          <div className="flex gap-2">
            {onOpenChat && (
              <button onClick={() => { onOpenChat(movie); onClose() }} className="btn-secondary text-sm py-2 px-4 flex items-center gap-1.5" title="Compartilhar com amigo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"/>
                </svg>
                Compartilhar
              </button>
            )}
            <button onClick={onClose} className="btn-secondary text-sm py-2 px-4">Fechar</button>
            {!isFromAPI && (
              <button onClick={() => setEditing(true)} className="btn-primary text-sm py-2 px-4">Editar</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
