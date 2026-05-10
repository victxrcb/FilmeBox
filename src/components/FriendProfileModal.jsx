import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function MoviePoster({ movie }) {
  return (
    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700/50">
      {movie.imagem ? (
        <img
          src={movie.imagem}
          alt={movie.nome}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.style.display = 'none' }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-zinc-700">
            <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2z"/>
          </svg>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"/>
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <p className="text-white text-[10px] font-semibold line-clamp-2 leading-tight">{movie.nome}</p>
      </div>
    </div>
  )
}

function ProfileAvatar({ photo, name }) {
  const [error, setError] = useState(false)
  return (
    <div className="w-20 h-20">
      {photo && !error ? (
        <img
          src={photo}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-700 to-red-950">
          <span className="text-white text-3xl font-black select-none">
            {(name || '?').charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  )
}

export default function FriendProfileModal({ friend, onClose }) {
  const [profile, setProfile] = useState(null)
  const [movies,  setMovies]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: p }, { data: m }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', friend.userId).single(),
        supabase.from('movies').select('*').eq('user_id', friend.userId).order('created_at', { ascending: false }),
      ])
      if (p) setProfile({
        displayName:  p.display_name  || '',
        photo:        p.photo         || '',
        banner:       p.banner        || '',
        topFavorites: p.top_favorites || [],
      })
      setMovies(m || [])
      setLoading(false)
    }
    load()
  }, [friend.userId])

  const displayName = profile?.displayName || friend.displayName || friend.username
  const topMovies   = (profile?.topFavorites || [])
    .map((id) => movies.find((m) => m.id === id))
    .filter(Boolean)

  const stats = [
    { label: 'Filmes',     value: movies.length },
    { label: 'Favoritos',  value: movies.filter((m) => m.favorito).length },
    { label: 'Assistidos', value: movies.filter((m) => m.status === 'assistido').length },
    { label: 'Watchlist',  value: movies.filter((m) => m.status === 'watchlist').length },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}/>

      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <span className="w-8 h-8 border-2 border-zinc-700 border-t-red-600 rounded-full animate-spin"/>
          </div>
        ) : (
          <>
            {/* Banner + avatar wrapper */}
            <div className="relative">
              {/* Banner */}
              <div className="h-32 overflow-hidden rounded-t-2xl">
                {profile?.banner ? (
                  <img src={profile.banner} alt="" className="w-full h-full object-cover"/>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-red-900/50 via-red-950/20 to-zinc-900"/>
                    <div className="absolute inset-0"
                      style={{ backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 30px, rgba(255,255,255,0.015) 30px, rgba(255,255,255,0.015) 60px)' }}/>
                  </>
                )}
              </div>

              {/* Close — dentro do banner, sem afetar o fluxo do layout */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-20 p-1.5 text-white/60 hover:text-white hover:bg-black/40 rounded-xl transition-all"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>

              {/* Avatar — absolute no canto inferior, traduzido para baixo 50% do próprio tamanho */}
              <div className="absolute left-6 bottom-0 translate-y-1/2 z-10">
                <div className="rounded-full border-4 border-zinc-900 shadow-xl overflow-hidden">
                  <ProfileAvatar photo={profile?.photo} name={displayName}/>
                </div>
              </div>
            </div>

            {/* Conteúdo — pt-14 para dar espaço ao avatar que transborda */}
            <div className="px-6 pt-14 pb-6">
              <h2 className="text-xl font-bold text-white leading-tight">{displayName}</h2>
              <p className="text-zinc-500 text-sm mt-0.5">@{friend.username}</p>

              {/* Stats */}
              <div className="flex gap-5 mt-5 pt-5 border-t border-zinc-800">
                {stats.map((s, i, arr) => (
                  <div key={s.label} className="flex items-center gap-5">
                    <div>
                      <p className="text-white font-bold text-lg leading-none">{s.value}</p>
                      <p className="text-zinc-500 text-xs mt-1">{s.label}</p>
                    </div>
                    {i < arr.length - 1 && <div className="w-px h-7 bg-zinc-800"/>}
                  </div>
                ))}
              </div>

              {/* Top favoritos */}
              {topMovies.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-1.5">
                    <span className="text-amber-400 text-base">★</span>
                    Top Favoritos
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {topMovies.map((m) => <MoviePoster key={m.id} movie={m}/>)}
                  </div>
                </div>
              )}

              {/* Biblioteca */}
              {movies.length > 0 ? (
                <div className="mt-6">
                  <h3 className="text-white font-semibold text-sm mb-3">
                    Biblioteca ({movies.length})
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {movies.slice(0, 8).map((m) => <MoviePoster key={m.id} movie={m}/>)}
                  </div>
                  {movies.length > 8 && (
                    <p className="text-zinc-600 text-xs text-center mt-3">
                      +{movies.length - 8} filmes
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-6 bg-zinc-800/40 border border-zinc-800 rounded-xl p-5 text-center">
                  <p className="text-zinc-500 text-sm">Biblioteca não disponível</p>
                  <p className="text-zinc-600 text-xs mt-1">
                    Configure as permissões no Supabase para ver os filmes de amigos
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
