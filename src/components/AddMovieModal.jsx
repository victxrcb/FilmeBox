import { useState, useRef } from 'react'

const STATUS_OPTIONS = [
  { value: null,         label: 'Nenhum',    icon: '—',  cls: 'text-zinc-400' },
  { value: 'watchlist',  label: 'Watchlist', icon: '🕐', cls: 'text-blue-400' },
  { value: 'assistido',  label: 'Assistido', icon: '✓',  cls: 'text-emerald-400' },
]

export default function AddMovieModal({ onClose, onSave, initial }) {
  const isEditing = !!initial
  const [nome, setNome]             = useState(initial?.nome || '')
  const [genero, setGenero]         = useState(initial?.genero || '')
  const [sinopse, setSinopse]       = useState(initial?.sinopse || '')
  const [observacao, setObservacao] = useState(initial?.observacao || '')
  const [imagem, setImagem]         = useState(initial?.imagem || '')
  const [status, setStatus]         = useState(initial?.status || null)
  const [imagemMode, setImagemMode] = useState('url')
  const [preview, setPreview]       = useState(initial?.imagem || '')
  const [urlInput, setUrlInput]     = useState(
    initial?.imagem?.startsWith('data:') ? '' : (initial?.imagem || '')
  )
  const fileRef = useRef(null)

  function handleUrlChange(e) {
    const val = e.target.value
    setUrlInput(val); setImagem(val); setPreview(val)
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const url = ev.target.result
      setImagem(url); setPreview(url)
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!nome.trim()) return
    onSave({ nome: nome.trim(), genero: genero.trim(), sinopse: sinopse.trim(), observacao: observacao.trim(), imagem, status })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-h-[90vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xl">{isEditing ? '✏️' : '🎬'}</span>
            {isEditing ? 'Editar filme' : 'Adicionar filme'}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Nome do filme <span className="text-red-500">*</span>
            </label>
            <input className="input-field" type="text" placeholder="Ex: Interestelar" value={nome} onChange={(e) => setNome(e.target.value)} required autoFocus/>
          </div>

          {/* Genero */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Gênero</label>
            <input className="input-field" type="text" placeholder="Ex: Ficção científica, Drama..." value={genero} onChange={(e) => setGenero(e.target.value)}/>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Status</label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                    status === opt.value
                      ? 'border-red-600 bg-red-600/10 text-white'
                      : 'border-zinc-700 bg-zinc-900 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Imagem */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Imagem (poster)</label>
            <div className="flex bg-zinc-800 rounded-lg p-1 mb-3 w-fit">
              {['url', 'upload'].map((m) => (
                <button key={m} type="button" onClick={() => setImagemMode(m)}
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${imagemMode === m ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-white'}`}>
                  {m === 'url' ? 'URL' : 'Upload'}
                </button>
              ))}
            </div>

            {imagemMode === 'url' ? (
              <input className="input-field" type="url" placeholder="https://exemplo.com/poster.jpg" value={urlInput} onChange={handleUrlChange}/>
            ) : (
              <div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange}/>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-zinc-700 hover:border-red-600/50 rounded-lg py-6 flex flex-col items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-all duration-200">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                  </svg>
                  <span className="text-sm">Clique para selecionar uma imagem</span>
                  <span className="text-xs text-zinc-600">JPG, PNG, WEBP...</span>
                </button>
              </div>
            )}

            {preview && (
              <div className="mt-3 flex items-center gap-3">
                <div className="w-14 h-20 rounded-lg overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'}/>
                </div>
                <div>
                  <p className="text-xs text-zinc-400 mb-1">Preview do poster</p>
                  <button type="button" onClick={() => { setImagem(''); setPreview(''); setUrlInput('') }}
                    className="text-xs text-red-500 hover:text-red-400 transition-colors">
                    Remover imagem
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sinopse */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Sinopse</label>
            <textarea className="input-field resize-none" rows={3} placeholder="Escreva uma breve sinopse do filme..." value={sinopse} onChange={(e) => setSinopse(e.target.value)}/>
          </div>

          {/* Observacao */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Minhas observações
              <span className="text-zinc-600 font-normal ml-1">(notas pessoais)</span>
            </label>
            <textarea className="input-field resize-none" rows={3} placeholder="O que você achou? Alguma cena favorita?" value={observacao} onChange={(e) => setObservacao(e.target.value)}/>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary" disabled={!nome.trim()}>
              {isEditing ? 'Salvar alterações' : 'Adicionar filme'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
