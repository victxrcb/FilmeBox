import { useState } from 'react'

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await (
      mode === 'login'
        ? onLogin.login(username, password)
        : onLogin.register(username, password)
    )
    if (!result.ok) {
      setError(result.error)
      setLoading(false)
    }
    // Se ok: onAuthStateChange atualiza currentUser e desmonta este componente
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/login-bg.jpg')" }}
      />
      {/* Overlays */}
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

      {/* Top nav bar */}
      <nav className="relative z-10 px-8 sm:px-16 py-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/50">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
              <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
            </svg>
          </div>
          <span className="text-white font-bold text-2xl tracking-tight">
            Filme<span className="text-red-500">Box</span>
          </span>
        </div>
      </nav>

      {/* Center content */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-4">
        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="login-card rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-1">
              {mode === 'login' ? 'Entrar' : 'Criar conta'}
            </h2>
            <p className="text-zinc-400 text-sm mb-6">
              {mode === 'login'
                ? 'Acesse sua biblioteca de filmes'
                : 'Comece sua coleção pessoal'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  className="input-field"
                  type="text"
                  placeholder="Usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div>
                <input
                  className="input-field"
                  type="password"
                  placeholder={mode === 'register' ? 'Senha (mín. 4 caracteres)' : 'Senha'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-600/10 border border-red-600/30 text-red-400 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
                    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd"/>
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base mt-1"
                disabled={loading}
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : null}
                {mode === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            </form>

            <div className="mt-5 text-center">
              {mode === 'login' ? (
                <p className="text-zinc-500 text-sm">
                  Novo aqui?{' '}
                  <button
                    className="text-white hover:text-red-400 font-medium transition-colors underline-offset-2 hover:underline"
                    onClick={() => { setMode('register'); setError('') }}
                  >
                    Criar conta gratuita
                  </button>
                </p>
              ) : (
                <p className="text-zinc-500 text-sm">
                  Já tem conta?{' '}
                  <button
                    className="text-white hover:text-red-400 font-medium transition-colors underline-offset-2 hover:underline"
                    onClick={() => { setMode('login'); setError('') }}
                  >
                    Entrar
                  </button>
                </p>
              )}
            </div>
          </div>

          <p className="text-center text-zinc-600 text-xs mt-4">
            Dados salvos localmente no seu navegador
          </p>
        </div>
      </div>
    </div>
  )
}
