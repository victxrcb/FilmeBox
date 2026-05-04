import { useState, useRef, useEffect } from 'react'

const OUT_W = 1200
const OUT_H = 270

export default function BannerCropModal({ src, onConfirm, onClose }) {
  const [ready, setReady]   = useState(false)
  const [scale, setScale]   = useState(1)
  const [minSc, setMinSc]   = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [drag, setDrag]     = useState(null)

  const containerRef = useRef(null)
  const nativeImg    = useRef(new Image())

  function clamp(ox, oy, s) {
    const { width: w, height: h } = containerRef.current.getBoundingClientRect()
    const img = nativeImg.current
    return {
      x: Math.min(0, Math.max(w - img.naturalWidth * s, ox)),
      y: Math.min(0, Math.max(h - img.naturalHeight * s, oy)),
    }
  }

  useEffect(() => {
    const img = nativeImg.current
    img.onload = () => {
      const { width: w, height: h } = containerRef.current.getBoundingClientRect()
      const min = Math.max(w / img.naturalWidth, h / img.naturalHeight)
      setMinSc(min)
      setScale(min)
      setOffset({ x: (w - img.naturalWidth * min) / 2, y: (h - img.naturalHeight * min) / 2 })
      setReady(true)
    }
    img.src = src
  }, [src])

  function onPointerDown(e) {
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrag({ startX: e.clientX, startY: e.clientY, ox: offset.x, oy: offset.y })
  }

  function onPointerMove(e) {
    if (!drag) return
    setOffset(clamp(drag.ox + (e.clientX - drag.startX), drag.oy + (e.clientY - drag.startY), scale))
  }

  function onPointerUp() { setDrag(null) }

  function handleZoom(e) {
    const s = Number(e.target.value)
    const { width: w, height: h } = containerRef.current.getBoundingClientRect()
    const imgX = (w / 2 - offset.x) / scale
    const imgY = (h / 2 - offset.y) / scale
    setScale(s)
    setOffset(clamp(w / 2 - imgX * s, h / 2 - imgY * s, s))
  }

  function confirm() {
    const { width: w, height: h } = containerRef.current.getBoundingClientRect()
    const canvas = document.createElement('canvas')
    canvas.width  = OUT_W
    canvas.height = OUT_H
    canvas.getContext('2d').drawImage(
      nativeImg.current,
      -offset.x / scale, -offset.y / scale,
      w / scale, h / scale,
      0, 0, OUT_W, OUT_H
    )
    onConfirm(canvas.toDataURL('image/jpeg', 0.9))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">Ajustar banner</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-zinc-500 text-sm">Arraste para reposicionar · use o slider para dar zoom</p>

          <div
            ref={containerRef}
            className="relative overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800"
            style={{ aspectRatio: `${OUT_W} / ${OUT_H}`, cursor: drag ? 'grabbing' : 'grab' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {ready ? (
              <img
                src={src}
                alt=""
                draggable={false}
                style={{
                  position: 'absolute',
                  left: offset.x,
                  top: offset.y,
                  width: nativeImg.current.naturalWidth * scale,
                  height: nativeImg.current.naturalHeight * scale,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-sm">
                Carregando…
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-zinc-500 shrink-0">
              <circle cx="11" cy="11" r="8"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 11h6"/>
            </svg>
            <input
              type="range"
              min={minSc}
              max={minSc * 3}
              step={0.001}
              value={scale}
              onChange={handleZoom}
              className="flex-1 accent-red-600"
            />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-zinc-400 shrink-0">
              <circle cx="11" cy="11" r="8"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 11h6M11 8v6"/>
            </svg>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="button" onClick={confirm} className="btn-primary">Aplicar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
