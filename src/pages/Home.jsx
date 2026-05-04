import { useState, useMemo, useRef } from 'react'
import MovieCard from '../components/MovieCard'
import MovieDetailModal from '../components/MovieDetailModal'
import AddMovieModal from '../components/AddMovieModal'
import IMDbSearchView from '../components/IMDbSearchView'
import PopularMoviesView from '../components/PopularMoviesView'

const NAV_TABS = [
  { id: 'all',       label: 'Todos',      icon: '🎬' },
  { id: 'watchlist', label: 'Watchlist',  icon: '🕐' },
  { id: 'assistido', label: 'Assistidos', icon: '✓'  },
  { id: 'fav',       label: 'Favoritos',  icon: '⭐' },
  { id: 'popular',   label: 'Populares',  icon: '🔥' },
]

const EXAMPLE_SEARCHES = [
  'Avengers', 'Batman', 'Spider-Man', 'Star Wars',
  'Marvel', 'Transformers', 'Deadpool', 'Disney',
]

function Avatar({ profile, username, onClick }) {
  const display = profile.displayName || username
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 hover:bg-zinc-800/60 rounded-xl px-2 py-1.5 transition-all group"
      title="Ver perfil"
    >
      <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 group-hover:border-red-600/50 transition-colors shrink-0">
        {profile.photo ? (
          <img src={profile.photo} alt={display} className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'}/>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-800 to-red-950">
            <span className="text-white text-xs font-bold select-none">
              {display.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <span className="text-zinc-300 text-sm font-medium hidden md:block group-hover:text-white transition-colors">
        {display}
      </span>
    </button>
  )
}

export default function Home({
  user, profile, movies,
  addMovie, updateMovie, deleteMovie, toggleFavorite,
  onLogout, onOpenProfile,
}) {
  const [search, setSearch]               = useState('')
  const [tab, setTab]                     = useState('all')
  const [popularKey, setPopularKey]       = useState(0)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [showAdd, setShowAdd]             = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef(null)

  const counts = useMemo(() => ({
    all:       movies.length,
    watchlist: movies.filter((m) => m.status === 'watchlist').length,
    assistido: movies.filter((m) => m.status === 'assistido').length,
    fav:       movies.filter((m) => m.favorito).length,
  }), [movies])

  const filtered = useMemo(() => {
    return movies.filter((m) => {
      const matchSearch =
        !search ||
        m.nome.toLowerCase().includes(search.toLowerCase()) ||
        (m.genero || '').toLowerCase().includes(search.toLowerCase())
      const matchTab =
        tab === 'all' ||
        (tab === 'fav'       && m.favorito) ||
        (tab === 'watchlist' && m.status === 'watchlist') ||
        (tab === 'assistido' && m.status === 'assistido')
      return matchSearch && matchTab
    })
  }, [movies, search, tab])

  function handleSaveMovie(data) {
    addMovie(data)
    setShowAdd(false)
  }

  function handleUpdateMovie(id, data) {
    updateMovie(id, data)
    setSelectedMovie((prev) => prev ? { ...prev, ...data } : null)
  }

  function handleAddFirstFilm() {
    setShowSuggestions(true)
    setTimeout(() => searchRef.current?.focus(), 50)
  }

  function handleSearchChange(e) {
    setSearch(e.target.value)
    if (e.target.value) setShowSuggestions(false)
  }

  const emptyTitle = {
    all:       'Sua biblioteca está vazia',
    watchlist: 'Nenhum filme na watchlist',
    assistido: 'Nenhum filme marcado como assistido',
    fav:       'Nenhum favorito ainda',
  }

  const emptyHint = {
    all:       'Adicione seu primeiro filme para começar',
    watchlist: 'Adicione filmes e marque como "Watchlist"',
    assistido: 'Marque filmes que já assistiu',
    fav:       'Clique na estrela em qualquer filme',
  }

  const showSuggestionsView = !search && showSuggestions && movies.length === 0
  const showPopularView     = !search && tab === 'popular'

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          {/* Logo */}
          <button
            onClick={() => { setSearch(''); setTab('all'); setShowSuggestions(false) }}
            className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
            title="Voltar para início"
          >
            <div className="w-7 h-7 bg-red-600 rounded-md flex items-center justify-center shadow-md shadow-red-900/60">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
              </svg>
            </div>
            <span className="font-bold text-white text-lg hidden sm:block tracking-tight">
              Filme<span className="text-red-500">Box</span>
            </span>
          </button>

          {/* Search */}
          <div className="flex-1 max-w-xs">
            <div className="relative">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
              </svg>
              <input
                ref={searchRef}
                type="text"
                placeholder="Buscar no IMDb..."
                value={search}
                onChange={handleSearchChange}
                className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-red-600/60 focus:ring-1 focus:ring-red-600/20 transition-all"
              />
            </div>
          </div>

          {/* Right side: avatar + logout */}
          <div className="ml-auto flex items-center gap-1 shrink-0">
            <Avatar profile={profile} username={user.username} onClick={onOpenProfile} />
            <button onClick={onLogout}
              className="p-2 text-zinc-600 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
              title="Sair">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Sub-nav tabs ── */}
      <div className="border-b border-zinc-900 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto">
          {NAV_TABS.map((t) => (
            <button key={t.id} onClick={() => { if (t.id === 'popular') setPopularKey((k) => k + 1); setTab(t.id); setShowSuggestions(false) }}
              className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                tab === t.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}>
              <span className="text-base leading-none">{t.icon}</span>
              {t.label}
              {counts[t.id] > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.id ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {counts[t.id]}
                </span>
              )}
              {tab === t.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-t-full" />
              )}
            </button>
          ))}

          <div className="ml-auto pl-4 py-2 shrink-0">
            <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-1.5 text-sm py-1.5 px-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
              </svg>
              <span className="hidden sm:inline">Adicionar</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* IMDb search mode */}
        {search ? (
          <IMDbSearchView
            query={search}
            movies={movies}
            addMovie={addMovie}
            updateMovie={updateMovie}
          />
        ) : showPopularView ? (
          <PopularMoviesView
            key={popularKey}
            movies={movies}
            addMovie={addMovie}
            updateMovie={updateMovie}
          />
        ) : showSuggestionsView ? (
          /* Sugestões de busca */
          <div className="animate-fade-in-up">
            <div className="mb-6">
              <h2 className="text-white font-semibold text-lg mb-1">Pesquise um filme</h2>
              <p className="text-zinc-500 text-sm">Use a barra de pesquisa acima ou experimente uma dessas sugestões</p>
            </div>
            <div className="flex flex-wrap gap-2 mb-8">
              {EXAMPLE_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => setSearch(term)}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-red-600/50 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-sm transition-all duration-200"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
                  </svg>
                  {term}
                </button>
              ))}
            </div>
            <p className="text-zinc-700 text-xs">Também é possível adicionar um filme manualmente pelo botão <span className="text-zinc-500">+ Adicionar</span></p>
          </div>
        ) : (
          <>
            {tab === 'watchlist' && counts.watchlist > 0 && (
              <div className="mb-5 bg-blue-600/5 border border-blue-600/20 rounded-xl px-5 py-3 flex items-center gap-3 animate-fade-in-up">
                <span className="text-2xl">🕐</span>
                <div>
                  <p className="text-blue-300 font-medium text-sm">Sua Watchlist</p>
                  <p className="text-zinc-500 text-xs">{counts.watchlist} {counts.watchlist === 1 ? 'filme para assistir' : 'filmes para assistir'}</p>
                </div>
              </div>
            )}

            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filtered.map((movie, i) => (
                  <MovieCard key={movie.id} movie={movie} index={i} onClick={setSelectedMovie} onToggleFavorite={toggleFavorite}/>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-28 text-center animate-fade-in-up">
                <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-4 text-4xl">
                  {NAV_TABS.find((t) => t.id === tab)?.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{emptyTitle[tab]}</h3>
                <p className="text-zinc-600 text-sm mb-5 max-w-xs">{emptyHint[tab]}</p>
                {tab === 'all' && (
                  <button onClick={handleAddFirstFilm} className="btn-primary">Adicionar primeiro filme</button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {showAdd && <AddMovieModal onClose={() => setShowAdd(false)} onSave={handleSaveMovie}/>}

      {selectedMovie && (
        <MovieDetailModal
          movie={movies.find((m) => m.id === selectedMovie.id) || selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onToggleFavorite={toggleFavorite}
          onUpdate={handleUpdateMovie}
          onDelete={(id) => { deleteMovie(id); setSelectedMovie(null) }}
        />
      )}
    </div>
  )
}
