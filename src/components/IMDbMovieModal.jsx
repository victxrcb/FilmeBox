import { useState, useEffect } from 'react'

const KEY      = import.meta.env.VITE_TMDB_KEY
const IMG_BASE = 'https://image.tmdb.org/t/p/w500'

/* ── Popcorn rating interativo ────────────────────────────── */
function StarRating({ value = 0, onChange }) {
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

export default function IMDbMovieModal({ item, local, onClose, onStatus, onRate }) {
  const [detail, setDetail]   = useState(null)
  const [imgError, setImgError] = useState(false)

  const status    = local?.status    ?? null
  const rating    = local?.avaliacao ?? 0
  const posterUrl = item.poster_path ? `${IMG_BASE}${item.poster_path}` : null
  const year      = item.release_date?.slice(0, 4) || ''

  /* Busca detalhes completos do filme (gêneros, duração, tagline) */
  useEffect(() => {
    if (!KEY) return
    fetch(`https://api.themoviedb.org/3/movie/${item.id}?api_key=${KEY}&language=pt-BR`)
      .then((r) => r.json())
      .then(setDetail)
      .catch(() => {})
  }, [item.id])

  const genres  = detail?.genres?.map((g) => g.name).join(', ') || ''
  const runtime = detail?.runtime
    ? `${Math.floor(detail.runtime / 60)}h ${detail.runtime % 60}min`
    : ''
  const tagline = detail?.tagline || ''
  const overview = detail?.overview || item.overview || ''
  const voteAvg = detail?.vote_average ? detail.vote_average.toFixed(1) : null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between p-5 border-b border-zinc-800 gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-white leading-tight line-clamp-2">{item.title}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {year      && <span className="text-zinc-500 text-sm">{year}</span>}
              {runtime   && <><span className="text-zinc-700">·</span><span className="text-zinc-500 text-sm">{runtime}</span></>}
              {voteAvg   && (
                <span className="flex items-center gap-1 text-amber-400 text-sm font-medium">
                  <span>★</span> {voteAvg}
                  <span className="text-zinc-600 font-normal text-xs">IMDb</span>
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 text-zinc-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-5">
          <div className="flex flex-col sm:flex-row gap-5">

            {/* Poster */}
            <div className="shrink-0">
              <div className="aspect-[2/3] w-full sm:w-40 bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700">
                {posterUrl && !imgError ? (
                  <img
                    src={posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 gap-2">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 opacity-30">
                      <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
                    </svg>
                    <span className="text-xs opacity-40">Sem poster</span>
                  </div>
                )}
              </div>

              {/* Badge na biblioteca */}
              {local && (
                <div className="mt-2 text-center">
                  <span className="text-xs text-red-400 font-medium">✓ Na sua biblioteca</span>
                </div>
              )}
            </div>

            {/* Detalhes */}
            <div className="flex-1 space-y-5 min-w-0">

              {/* Gêneros + tagline */}
              {(genres || tagline) && (
                <div className="space-y-1">
                  {genres  && <p className="text-zinc-400 text-sm">{genres}</p>}
                  {tagline && <p className="text-zinc-600 text-sm italic">"{tagline}"</p>}
                </div>
              )}

              {/* Sinopse */}
              {overview && (
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Sinopse</p>
                  <p className="text-zinc-300 text-sm leading-relaxed">{overview}</p>
                </div>
              )}

              {/* Status */}
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Status</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onStatus('watchlist')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      status === 'watchlist'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-blue-600/20 hover:text-blue-300 border border-zinc-700 hover:border-blue-600/30'
                    }`}
                  >
                    🕐 Watchlist
                  </button>
                  <button
                    onClick={() => onStatus('assistido')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      status === 'assistido'
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-emerald-600/20 hover:text-emerald-300 border border-zinc-700 hover:border-emerald-600/30'
                    }`}
                  >
                    ✓ Assistido
                  </button>
                </div>
              </div>

              {/* Avaliação — só aparece quando status é 'assistido' */}
              {status === 'assistido' && (
                <div className="animate-fade-in-up">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Sua avaliação</p>
                  <StarRating value={rating} onChange={onRate} />
                  {rating === 0 && (
                    <p className="text-zinc-600 text-xs mt-2">Clique nas estrelas para avaliar</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex justify-end p-5 border-t border-zinc-800">
          <button onClick={onClose} className="btn-secondary text-sm py-2 px-5">Fechar</button>
        </div>
      </div>
    </div>
  )
}
