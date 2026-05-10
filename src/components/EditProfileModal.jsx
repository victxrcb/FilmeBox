import { useState, useRef } from 'react'
import BannerCropModal from './BannerCropModal'

function OtpInput({ value, onChange }) {
  return (
    <input
      className="input-field text-center text-2xl tracking-[0.4em] font-bold placeholder-zinc-700"
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      placeholder="00000000"
      maxLength={8}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
      autoFocus
      required
    />
  )
}

export default function EditProfileModal({ profile, username, movies, onSave, onUpdateEmail, onVerifyEmailOtp, onResendEmailOtp, onClose }) {
  const [step, setStep]               = useState('form') // 'form' | 'verify_email'
  const [displayName, setDisplayName] = useState(profile.displayName || username)
  const [email, setEmail]             = useState(profile.email || '')
  const [emailError, setEmailError]   = useState('')
  const [photo, setPhoto]             = useState(profile.photo || '')
  const [photoMode, setPhotoMode]     = useState('url')
  const [urlInput, setUrlInput]       = useState(profile.photo?.startsWith('data:') ? '' : (profile.photo || ''))
  const [banner, setBanner]           = useState(profile.banner || '')
  const [cropSrc, setCropSrc]         = useState(null)
  const [selected, setSelected]       = useState(profile.topFavorites || [])
  const [search, setSearch]           = useState('')
  // OTP step state
  const [pendingEmail, setPendingEmail]     = useState('')
  const [otp, setOtp]                       = useState('')
  const [otpError, setOtpError]             = useState('')
  const [otpLoading, setOtpLoading]         = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendLoading, setResendLoading]   = useState(false)

  const fileRef   = useRef(null)
  const bannerRef = useRef(null)

  function handleBannerChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setCropSrc(ev.target.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const filtered = movies.filter((m) =>
    !search || m.nome.toLowerCase().includes(search.toLowerCase())
  )

  function toggleMovie(id) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  function handleUrlChange(e) {
    const val = e.target.value
    setUrlInput(val)
    setPhoto(val)
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPhoto(ev.target.result)
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmedEmail = email.trim().toLowerCase()

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('E-mail inválido.')
      return
    }
    setEmailError('')

    const emailChanged = trimmedEmail !== '' && trimmedEmail !== (profile.email || '')

    // Salva campos não-email (displayName, photo, banner, topFavorites)
    onSave({ displayName: displayName.trim() || username, photo, banner, topFavorites: selected })

    if (emailChanged) {
      // Inicia verificação de email
      const result = await onUpdateEmail(trimmedEmail)
      if (!result.ok) {
        setEmailError(result.error)
        return
      }
      setPendingEmail(trimmedEmail)
      setStep('verify_email')
    } else {
      // Sem mudança de email: salva email vazio se necessário e fecha
      if (!trimmedEmail && profile.email) {
        onSave({ email: '' })
      }
      onClose()
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault()
    setOtpError('')
    setOtpLoading(true)
    const result = await onVerifyEmailOtp(pendingEmail, otp.trim())
    setOtpLoading(false)
    if (!result.ok) { setOtpError(result.error); return }
    onClose()
  }

  async function handleResend() {
    if (resendCooldown > 0 || resendLoading) return
    setResendLoading(true)
    const result = await onResendEmailOtp(pendingEmail)
    setResendLoading(false)
    if (!result.ok) { setOtpError(result.error); return }
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  // ── Passo de verificação de email ──────────────────────────────────────────
  if (step === 'verify_email') {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-5 border-b border-zinc-800">
            <button onClick={() => setStep('form')} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
              </svg>
              Voltar
            </button>
            <button onClick={onClose} className="text-zinc-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-all">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Ícone e texto */}
            <div className="text-center">
              <div className="w-14 h-14 bg-red-600/10 border border-red-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7 text-red-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Verifique seu e-mail</h3>
              <p className="text-zinc-400 text-sm">Enviamos um código de verificação para</p>
              <p className="text-white text-sm font-medium mt-0.5 truncate">{pendingEmail}</p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <OtpInput value={otp} onChange={setOtp} />

              {otpError && (
                <div className="bg-red-600/10 border border-red-600/30 text-red-400 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
                    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd"/>
                  </svg>
                  {otpError}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                disabled={otpLoading || otp.length < 6}
              >
                {otpLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Confirmar e-mail
              </button>
            </form>

            <div className="text-center">
              <p className="text-zinc-500 text-sm">
                Não recebeu o código?{' '}
                <button
                  className="text-white hover:text-red-400 font-medium transition-colors disabled:opacity-40"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || resendLoading}
                >
                  {resendCooldown > 0 ? `Reenviar em ${resendCooldown}s` : 'Reenviar'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Formulário principal ───────────────────────────────────────────────────
  return (
    <>
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-h-[90vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">Editar perfil</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">

          {/* Banner */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Banner</label>
            <div className="relative h-28 rounded-xl overflow-hidden bg-gradient-to-br from-red-900/50 via-red-950/20 to-zinc-900 border border-zinc-700 mb-2">
              {banner && (
                <img src={banner} alt="banner" className="w-full h-full object-cover"/>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-3">
                <button type="button" onClick={() => bannerRef.current?.click()}
                  className="flex items-center gap-2 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white text-xs font-medium px-3 py-2 rounded-lg border border-white/10 transition-all">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                  </svg>
                  {banner ? 'Trocar banner' : 'Adicionar banner'}
                </button>
                {banner && (
                  <button type="button" onClick={() => setBanner('')}
                    className="flex items-center gap-1.5 bg-black/60 hover:bg-red-900/60 backdrop-blur-sm text-zinc-300 hover:text-white text-xs font-medium px-3 py-2 rounded-lg border border-white/10 transition-all">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    Remover
                  </button>
                )}
              </div>
            </div>
            <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange}/>
          </div>

          {/* Photo */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-3">Foto de perfil</label>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 shrink-0 flex items-center justify-center">
                {photo ? (
                  <img src={photo} alt="perfil" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'}/>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-zinc-600">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd"/>
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className="flex bg-zinc-800 rounded-lg p-1 w-fit mb-2">
                  {['url', 'upload'].map((m) => (
                    <button key={m} type="button" onClick={() => setPhotoMode(m)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${photoMode === m ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-white'}`}>
                      {m === 'url' ? 'URL' : 'Upload'}
                    </button>
                  ))}
                </div>
                {photo && (
                  <button type="button" onClick={() => { setPhoto(''); setUrlInput('') }}
                    className="text-xs text-red-500 hover:text-red-400 transition-colors">
                    Remover foto
                  </button>
                )}
              </div>
            </div>
            {photoMode === 'url' ? (
              <input className="input-field" type="url" placeholder="https://exemplo.com/foto.jpg" value={urlInput} onChange={handleUrlChange}/>
            ) : (
              <>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange}/>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-zinc-700 hover:border-red-600/50 rounded-lg py-4 flex items-center justify-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm transition-all">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                  </svg>
                  Selecionar imagem
                </button>
              </>
            )}
          </div>

          {/* Display name */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Nome de exibição</label>
            <input className="input-field" type="text" placeholder={username} value={displayName}
              onChange={(e) => setDisplayName(e.target.value)} maxLength={30}/>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">E-mail</label>
            <input
              className="input-field"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
            />
            {emailError && (
              <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd"/>
                </svg>
                {emailError}
              </p>
            )}
            {email && email.trim() !== (profile.email || '') && email.trim() !== '' && (
              <p className="text-amber-500/80 text-xs mt-1.5 flex items-center gap-1">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd"/>
                </svg>
                Um código de verificação será enviado para este e-mail
              </p>
            )}
          </div>

          {/* Top 3 favorites */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-zinc-400">Top 3 filmes favoritos</label>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${selected.length === 3 ? 'bg-red-600/20 text-red-400' : 'bg-zinc-800 text-zinc-500'}`}>
                {selected.length}/3
              </span>
            </div>

            {selected.length > 0 && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {selected.map((id, i) => {
                  const m = movies.find((mv) => mv.id === id)
                  if (!m) return null
                  return (
                    <div key={id} className="flex items-center gap-1.5 bg-red-600/10 border border-red-600/30 text-red-300 text-xs px-2.5 py-1 rounded-full">
                      <span className="font-medium">#{i + 1}</span>
                      <span className="max-w-[100px] truncate">{m.nome}</span>
                      <button type="button" onClick={() => toggleMovie(id)} className="text-red-400 hover:text-red-200 ml-0.5">✕</button>
                    </div>
                  )
                })}
              </div>
            )}

            {movies.length === 0 ? (
              <p className="text-zinc-600 text-sm text-center py-4 border border-zinc-800 rounded-lg">
                Adicione filmes à sua biblioteca primeiro
              </p>
            ) : (
              <>
                <div className="relative mb-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                    className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
                  </svg>
                  <input type="text" placeholder="Buscar filme..." value={search} onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-red-600/60 transition-all"/>
                </div>

                <div className="border border-zinc-800 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                  {filtered.map((m) => {
                    const isSelected = selected.includes(m.id)
                    const rank = selected.indexOf(m.id) + 1
                    const disabled = !isSelected && selected.length >= 3
                    return (
                      <button key={m.id} type="button" onClick={() => !disabled && toggleMovie(m.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all border-b border-zinc-800/50 last:border-0 ${
                          isSelected
                            ? 'bg-red-600/10 hover:bg-red-600/15'
                            : disabled
                            ? 'opacity-40 cursor-not-allowed'
                            : 'hover:bg-zinc-800/60'
                        }`}>
                        <div className="w-8 h-11 rounded bg-zinc-800 overflow-hidden shrink-0">
                          {m.imagem
                            ? <img src={m.imagem} alt={m.nome} className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'}/>
                            : <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 opacity-40">
                                  <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2z"/>
                                </svg>
                              </div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{m.nome}</p>
                          {m.genero && <p className="text-xs text-zinc-500 truncate">{m.genero}</p>}
                        </div>
                        {isSelected && (
                          <span className="shrink-0 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {rank}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Salvar perfil</button>
          </div>
        </form>
      </div>
    </div>
    {cropSrc && (
      <BannerCropModal
        src={cropSrc}
        onConfirm={(cropped) => { setBanner(cropped); setCropSrc(null) }}
        onClose={() => setCropSrc(null)}
      />
    )}
    </>
  )
}
