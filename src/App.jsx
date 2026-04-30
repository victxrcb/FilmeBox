import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useMovies } from './hooks/useMovies'
import { useProfile } from './hooks/useProfile'
import Login from './pages/Login'
import Home from './pages/Home'
import ProfilePage from './pages/ProfilePage'

function AuthenticatedApp({ user, onLogout }) {
  const [page, setPage] = useState('home')
  const { movies, addMovie, updateMovie, deleteMovie, toggleFavorite } = useMovies(user.id)
  const { profile, saveProfile } = useProfile(user.id)

  if (page === 'profile') {
    return (
      <ProfilePage
        user={user}
        profile={profile}
        movies={movies}
        onSaveProfile={saveProfile}
        onBack={() => setPage('home')}
      />
    )
  }

  return (
    <Home
      user={user}
      profile={profile}
      movies={movies}
      addMovie={addMovie}
      updateMovie={updateMovie}
      deleteMovie={deleteMovie}
      toggleFavorite={toggleFavorite}
      onLogout={onLogout}
      onOpenProfile={() => setPage('profile')}
    />
  )
}

export default function App() {
  const auth = useAuth()

  // Verificando sessão com o Supabase
  if (auth.currentUser === undefined) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-zinc-700 border-t-red-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!auth.currentUser) {
    return <Login onLogin={auth} />
  }

  return <AuthenticatedApp user={auth.currentUser} onLogout={auth.logout} />
}
