import { useState } from 'react'
import EditProfileModal from '../components/EditProfileModal'

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-amber-400">
    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
  </svg>
)

export default function ProfilePage({ user, profile, movies, onSaveProfile, onUpdateEmail, onVerifyEmailOtp, onResendEmailOtp, onBack }) {
  const [showEdit, setShowEdit] = useState(false)

  const displayName = profile.displayName || user.username
  const topMovies = (profile.topFavorites || [])
    .map((id) => movies.find((m) => m.id === id))
    .filter(Boolean)

  function handleSave(data) {
    onSaveProfile(data)
    // O modal chama onClose() diretamente quando terminar (inclusive após OTP)
  }

  return (
    <div className="min-h-screen bg-zinc-950">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button onClick={onBack}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
            </svg>
            <span className="text-sm font-medium">Voltar</span>
          </button>
          <div className="w-px h-5 bg-zinc-800" />
          <span className="text-white font-semibold text-sm">Perfil</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Profile card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-8 animate-fade-in-up">

          {/* Banner */}
          <div className="h-36 relative overflow-hidden">
            {profile.banner ? (
              <img src={profile.banner} alt="banner" className="w-full h-full object-cover"/>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/50 via-red-950/20 to-zinc-900"/>
                <div className="absolute inset-0"
                  style={{ backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 30px, rgba(255,255,255,0.015) 30px, rgba(255,255,255,0.015) 60px)' }}
                />
              </>
            )}
          </div>

          {/* Content below banner */}
          <div className="px-6 pt-0 pb-6 relative z-10">
            {/* Row: avatar (half outside banner) + edit button */}
            <div className="flex items-start justify-between">
              {/* Avatar — pulled up by half its height (48px = half of 96px) */}
              <div
                className="w-24 h-24 rounded-full overflow-hidden border-4 border-zinc-900 bg-zinc-800 shadow-2xl shrink-0"
                style={{ marginTop: '-48px' }}
              >
                {profile.photo ? (
                  <img
                    src={profile.photo}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-700 to-red-950">
                    <span className="text-white text-3xl font-black select-none">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Edit button — aligned to top of this row */}
              <button
                onClick={() => setShowEdit(true)}
                className="btn-secondary flex items-center gap-2 text-sm py-2 px-4 mt-3"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/>
                </svg>
                Editar perfil
              </button>
            </div>

            {/* Name + handle + email */}
            <div className="mt-3">
              <h1 className="text-2xl font-bold text-white leading-tight">{displayName}</h1>
              <p className="text-zinc-500 text-sm mt-0.5">@{user.username}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5 text-zinc-600 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                </svg>
                {profile.email ? (
                  <span className="text-zinc-400 text-sm">{profile.email}</span>
                ) : (
                  <button
                    onClick={() => setShowEdit(true)}
                    className="text-zinc-600 hover:text-red-400 text-sm transition-colors underline-offset-2 hover:underline"
                  >
                    Adicionar e-mail
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-5 pt-5 border-t border-zinc-800">
              {[
                { label: 'Filmes',     value: movies.length },
                { label: 'Favoritos',  value: movies.filter((m) => m.favorito).length },
                { label: 'Assistidos', value: movies.filter((m) => m.status === 'assistido').length },
                { label: 'Watchlist',  value: movies.filter((m) => m.status === 'watchlist').length },
              ].map((stat, i, arr) => (
                <div key={stat.label} className="flex items-center gap-6">
                  <div>
                    <p className="text-white font-bold text-xl leading-none">{stat.value}</p>
                    <p className="text-zinc-500 text-xs mt-1">{stat.label}</p>
                  </div>
                  {i < arr.length - 1 && <div className="w-px h-8 bg-zinc-800" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 3 */}
        <div className="animate-fade-in-up" style={{ animationDelay: '80ms' }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center gap-1">
              <StarIcon />
              <StarIcon />
              <StarIcon />
            </div>
            <h2 className="text-white font-bold text-lg tracking-wide">Top 3 Favoritos</h2>
          </div>

          {topMovies.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-zinc-800 rounded-xl flex items-center justify-center mb-3 text-2xl">⭐</div>
              <p className="text-white font-medium mb-1">Nenhum favorito definido</p>
              <p className="text-zinc-500 text-sm mb-4">Edite seu perfil para escolher seus 3 filmes favoritos</p>
              <button onClick={() => setShowEdit(true)} className="btn-primary text-sm py-2 px-5">
                Escolher favoritos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {topMovies.map((movie, i) => {
                const ranks = [
                  { border: 'border-amber-400/60', shadow: 'hover:shadow-amber-500/25', badge: 'from-amber-400 to-yellow-600', label: 'text-amber-300', ring: 'ring-amber-400/30' },
                  { border: 'border-slate-400/50', shadow: 'hover:shadow-slate-400/20', badge: 'from-slate-300 to-slate-500', label: 'text-slate-300', ring: 'ring-slate-400/30' },
                  { border: 'border-orange-700/50', shadow: 'hover:shadow-orange-700/20', badge: 'from-orange-500 to-orange-800', label: 'text-orange-400', ring: 'ring-orange-700/30' },
                ]
                const rank = ranks[i]
                return (
                  <div key={movie.id}
                    className={`relative rounded-xl sm:rounded-2xl overflow-hidden border ${rank.border} hover:shadow-xl ${rank.shadow} transition-all duration-500 group aspect-[2/3] bg-zinc-900 ring-1 ${rank.ring}`}>

                    {/* Poster */}
                    {movie.imagem ? (
                      <img src={movie.imagem} alt={movie.nome}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => e.target.style.display = 'none'}/>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-zinc-700 opacity-30">
                          <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2z"/>
                        </svg>
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3">
                      <h3 className="text-white font-bold text-xs sm:text-sm leading-tight line-clamp-2 drop-shadow-lg">{movie.nome}</h3>
                      {movie.genero && (
                        <p className={`${rank.label} text-[10px] sm:text-xs mt-0.5 font-medium truncate`}>{movie.genero}</p>
                      )}
                    </div>
                  </div>
                )
              })}

              {Array.from({ length: 3 - topMovies.length }).map((_, i) => (
                <button key={`empty-${i}`} onClick={() => setShowEdit(true)}
                  className="aspect-[2/3] bg-zinc-900/50 border-2 border-dashed border-zinc-800 hover:border-red-600/40 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-2 text-zinc-700 hover:text-zinc-500 transition-all group">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 group-hover:scale-110 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                  </svg>
                  <span className="text-[10px] sm:text-xs">Adicionar</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showEdit && (
        <EditProfileModal
          profile={profile}
          username={user.username}
          movies={movies}
          onSave={handleSave}
          onUpdateEmail={onUpdateEmail}
          onVerifyEmailOtp={onVerifyEmailOtp}
          onResendEmailOtp={onResendEmailOtp}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  )
}
