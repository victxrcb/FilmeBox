import { useState } from 'react'
import { useIMDbSearch } from '../hooks/useIMDbSearch'
import IMDbMovieModal from './IMDbMovieModal'

const IMG_BASE = 'https://image.tmdb.org/t/p/w500'

/* ── Card de resultado ────────────────────────────────────── */
function ResultCard({ item, local, onClick }) {
  const [imgError, setImgError] = useState(false)
  const posterUrl = item.poster_path ? `${IMG_BASE}${item.poster_path}` : null
  const year      = item.release_date ? item.release_date.slice(0, 4) : ''
  const status    = local?.status    ?? null
  const rating    = local?.avaliacao ?? 0

  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group hover:border-zinc-600 transition-all duration-200 flex flex-col"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] bg-zinc-800 shrink-0 overflow-hidden">
        {posterUrl && !imgError ? (
          <img
            src={posterUrl}
            alt={item.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-700">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 opacity-40">
              <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
            </svg>
            <span className="text-[11px] opacity-40">Sem poster</span>
          </div>
        )}

        {/* Badge de status */}
        {status && (
          <div className="absolute top-2 left-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${
              status === 'watchlist'
                ? 'bg-blue-600/90 text-white'
                : 'bg-emerald-600/90 text-white'
            }`}>
              {status === 'watchlist' ? '🕐 Watchlist' : '✓ Assistido'}
            </span>
          </div>
        )}

        {/* "Na biblioteca" sem status */}
        {local && !status && (
          <div className="absolute top-2 left-2">
            <span className="bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Na biblioteca
            </span>
          </div>
        )}

        {/* Overlay hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <span className="text-white text-xs font-medium bg-black/60 px-3 py-1.5 rounded-lg border border-white/10">
            Ver detalhes
          </span>
        </div>

        {/* Gradiente inferior */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Info */}
      <div className="p-2.5 space-y-1">
        <p className="text-white text-xs font-semibold leading-snug line-clamp-2">{item.title}</p>
        {year && <p className="text-zinc-600 text-[11px]">{year}</p>}

        {/* Pipocas (somente leitura) — aparece se o filme foi avaliado */}
        {rating > 0 && (
          <div className="flex gap-0.5 pt-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={`text-sm transition-all ${n <= rating ? 'opacity-100' : 'opacity-20 grayscale'}`}>🍿</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Skeleton ─────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-[2/3] bg-zinc-800" />
      <div className="p-2.5 space-y-2">
        <div className="h-3 bg-zinc-800 rounded w-4/5" />
        <div className="h-3 bg-zinc-800 rounded w-3/5" />
        <div className="h-2.5 bg-zinc-800 rounded w-1/4" />
      </div>
    </div>
  )
}

/* ── View principal ───────────────────────────────────────── */
export default function IMDbSearchView({ query, movies, addMovie, updateMovie }) {
  const { results, loading, error } = useIMDbSearch(query)
  const [selected, setSelected] = useState(null)

  function findLocal(tmdbID) {
    return movies.find((m) => m.tmdbID === String(tmdbID)) ?? null
  }

  function toMovieData(item, extra = {}) {
    return {
      nome:       item.title,
      imagem:     item.poster_path ? `${IMG_BASE}${item.poster_path}` : '',
      tmdbID:     String(item.id),
      genero:     '',
      sinopse:    item.overview || '',
      observacao: '',
      status:     null,
      avaliacao:  null,
      ...extra,
    }
  }

  function handleStatus(item, newStatus) {
    const local = findLocal(item.id)
    if (local) {
      updateMovie(local.id, { status: local.status === newStatus ? null : newStatus })
    } else {
      addMovie(toMovieData(item, { status: newStatus }))
    }
  }

  function handleRate(item, rating) {
    const local = findLocal(item.id)
    if (local) {
      updateMovie(local.id, { avaliacao: rating || null })
    } else if (rating > 0) {
      addMovie(toMovieData(item, { avaliacao: rating }))
    }
  }

  /* ── Estados de erro ── */
  if (error === 'no_key') {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center animate-fade-in-up">
        <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-4 text-3xl">🔑</div>
        <h3 className="text-white font-semibold text-lg mb-2">Chave da API não configurada</h3>
        <p className="text-zinc-500 text-sm max-w-sm leading-relaxed">
          Crie o arquivo <code className="text-amber-400 bg-zinc-900 px-1.5 py-0.5 rounded font-mono text-xs">filme-web/.env</code> com:
        </p>
        <code className="text-amber-400 bg-zinc-900/80 border border-zinc-800 px-3 py-2 rounded-lg font-mono text-xs mt-3 block">
          VITE_TMDB_KEY=sua_chave_aqui
        </code>
        <p className="text-zinc-600 text-xs mt-3">Chave gratuita em themoviedb.org</p>
      </div>
    )
  }

  if (error === 'invalid_key') {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center animate-fade-in-up">
        <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-4 text-3xl">❌</div>
        <h3 className="text-white font-semibold text-lg mb-2">Chave da API inválida</h3>
        <p className="text-zinc-500 text-sm">
          Verifique o valor de <code className="text-amber-400 text-xs">VITE_TMDB_KEY</code> no arquivo <code className="text-amber-400 text-xs">.env</code>
        </p>
      </div>
    )
  }

  return (
    <>
      <div>
        {/* Contagem */}
        {!loading && results.length > 0 && (
          <div className="flex items-center gap-3 mb-5 animate-fade-in-up">
            <p className="text-zinc-400 text-sm">
              <span className="text-white font-semibold">{results.length}</span>{' '}
              resultado{results.length !== 1 ? 's' : ''} para{' '}
              <span className="text-white">"{query}"</span>
            </p>
            <span className="text-zinc-700 text-xs">• via TMDB</span>
          </div>
        )}

        {/* Skeletons */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        )}

        {/* Sem resultado */}
        {!loading && error === 'not_found' && (
          <div className="flex flex-col items-center justify-center py-28 text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-4 text-4xl">🎬</div>
            <h3 className="text-white font-semibold text-lg mb-2">Nenhum resultado</h3>
            <p className="text-zinc-600 text-sm">Nenhum filme encontrado para "{query}"</p>
          </div>
        )}

        {/* Erro genérico */}
        {!loading && error && !['not_found', 'no_key', 'invalid_key'].includes(error) && (
          <div className="flex flex-col items-center justify-center py-28 text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-4 text-3xl">⚠️</div>
            <h3 className="text-white font-semibold mb-2">Erro ao buscar</h3>
            <p className="text-zinc-500 text-sm">{error}</p>
          </div>
        )}

        {/* Grid de resultados */}
        {!loading && !error && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 animate-fade-in-up">
            {results.map((item) => (
              <ResultCard
                key={item.id}
                item={item}
                local={findLocal(item.id)}
                onClick={() => setSelected(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalhes */}
      {selected && (
        <IMDbMovieModal
          item={selected}
          local={findLocal(selected.id)}
          onClose={() => setSelected(null)}
          onStatus={(s) => handleStatus(selected, s)}
          onRate={(r) => handleRate(selected, r)}
        />
      )}
    </>
  )
}
