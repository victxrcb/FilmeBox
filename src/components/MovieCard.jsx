import { useState } from 'react'

const StarIcon = ({ filled }) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={filled ? 0 : 1.5}
    className={`w-5 h-5 transition-all duration-200 ${filled ? 'text-amber-400' : 'text-zinc-400'}`}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
  </svg>
)

const StatusBadge = ({ status }) => {
  if (!status) return null
  if (status === 'watchlist') {
    return (
      <span className="status-badge-watchlist">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Watchlist
      </span>
    )
  }
  return (
    <span className="status-badge-assistido">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
      </svg>
      Assistido
    </span>
  )
}

export default function MovieCard({ movie, onClick, onToggleFavorite, index = 0 }) {
  const [starAnim, setStarAnim] = useState(false)
  const [imgError, setImgError] = useState(false)

  function handleFavorite(e) {
    e.stopPropagation()
    setStarAnim(true)
    onToggleFavorite(movie.id)
    setTimeout(() => setStarAnim(false), 400)
  }

  return (
    <div
      className="card group relative animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
      onClick={() => onClick(movie)}
    >
      {/* Poster */}
      <div className="aspect-[2/3] w-full overflow-hidden bg-zinc-900 relative">
        {movie.imagem && !imgError ? (
          <img
            src={movie.imagem}
            alt={movie.nome}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 mb-2 opacity-30">
              <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
            </svg>
            <span className="text-xs opacity-30">Sem imagem</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Favorite button */}
        <button
          onClick={handleFavorite}
          className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/70 backdrop-blur-sm hover:bg-black/90 transition-all duration-200 ${
            movie.favorito ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          } ${starAnim ? 'animate-star-pop' : ''}`}
          title={movie.favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <StarIcon filled={movie.favorito} />
        </button>

        {/* Status badge on poster */}
        {movie.status && (
          <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <StatusBadge status={movie.status} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-white text-sm leading-tight line-clamp-1">
          {movie.nome}
        </h3>
        <div className="flex items-center justify-between mt-1 gap-1">
          {movie.genero && (
            <p className="text-zinc-500 text-xs line-clamp-1 flex-1">{movie.genero}</p>
          )}
          {movie.status && (
            <div className="shrink-0">
              <StatusBadge status={movie.status} />
            </div>
          )}
        </div>
        {movie.avaliacao > 0 && (
          <div className="flex gap-0.5 mt-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={`text-sm leading-none transition-all ${n <= movie.avaliacao ? 'opacity-100' : 'opacity-20 grayscale'}`}>
                🍿
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
