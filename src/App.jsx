import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useMovies } from './hooks/useMovies'
import { useProfile } from './hooks/useProfile'
import { useFriends } from './hooks/useFriends'
import { useShares } from './hooks/useShares'
import Login from './pages/Login'
import Home from './pages/Home'
import ProfilePage from './pages/ProfilePage'
import FriendsPage from './pages/FriendsPage'
import ChatPage from './pages/ChatPage'

function AuthenticatedApp({ user, onLogout }) {
  const [page, setPage] = useState('home')
  const [chatInitialMovie, setChatInitialMovie] = useState(null)
  const [chatInitialFriend, setChatInitialFriend] = useState(null)
  const { movies, addMovie, updateMovie, deleteMovie, toggleFavorite } = useMovies(user.id)
  const { profile, saveProfile, updateEmail, verifyEmailOtp, resendEmailOtp } = useProfile(user.id)
  const {
    friends, pendingReceived, pendingSent, loading: friendsLoading,
    getFriendshipWith, sendRequest, acceptRequest, rejectRequest, removeFriend,
    searchUsers,
  } = useFriends(user.id)

  const { allShares, unreadCount, sendShare, getConversation, getUnreadFromFriend, markSeenFromFriend } = useShares(user.id)

  function handleOpenChat(movie = null, friend = null) {
    setChatInitialMovie(movie)
    setChatInitialFriend(friend)
    setPage('chat')
  }

  if (page === 'profile') {
    return (
      <ProfilePage
        user={user}
        profile={profile}
        movies={movies}
        onSaveProfile={saveProfile}
        onUpdateEmail={updateEmail}
        onVerifyEmailOtp={verifyEmailOtp}
        onResendEmailOtp={resendEmailOtp}
        onBack={() => setPage('home')}
      />
    )
  }

  if (page === 'friends') {
    return (
      <FriendsPage
        friends={friends}
        pendingReceived={pendingReceived}
        pendingSent={pendingSent}
        loading={friendsLoading}
        getFriendshipWith={getFriendshipWith}
        sendRequest={sendRequest}
        acceptRequest={acceptRequest}
        rejectRequest={rejectRequest}
        removeFriend={removeFriend}
        searchUsers={searchUsers}
        onBack={() => setPage('home')}
        onOpenChat={handleOpenChat}
      />
    )
  }

  if (page === 'chat') {
    return (
      <ChatPage
        userId={user.id}
        friends={friends}
        movies={movies}
        allShares={allShares}
        getConversation={getConversation}
        getUnreadFromFriend={getUnreadFromFriend}
        onSendShare={sendShare}
        onMarkSeen={markSeenFromFriend}
        onAddMovie={addMovie}
        onBack={() => { setChatInitialMovie(null); setChatInitialFriend(null); setPage('home') }}
        initialMovie={chatInitialMovie}
        initialFriend={chatInitialFriend}
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
      onOpenFriends={() => setPage('friends')}
      onOpenChat={handleOpenChat}
      pendingFriendsCount={pendingReceived.length}
      friends={friends}
      allShares={allShares}
      onShareMovie={sendShare}
      unreadSharesCount={unreadCount}
      onMarkSeenFromFriend={markSeenFromFriend}
      getConversation={getConversation}
      getUnreadFromFriend={getUnreadFromFriend}
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
