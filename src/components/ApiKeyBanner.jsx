import { useState } from 'react'

export default function ApiKeyBanner({ apiKey, onSave }) {
  const [open, setOpen] = useState(!apiKey)
  const [draft, setDraft] = useState(apiKey)

  function save() {
    onSave(draft.trim())
    setOpen(false)
  }

  const masked = apiKey ? `${apiKey.slice(0, 8)}••••••` : null

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06]" style={{ background: 'rgba(7,7,11,0.85)', backdropFilter: 'blur(16px)' }}>
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Logo mark */}
        <div className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          ▶
        </div>

        <span className="font-semibold text-sm text-zinc-100 flex-1 truncate">
          AI Video Gen
        </span>

        {/* Key indicator / edit */}
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className={`flex items-center gap-1.5 text-xs border rounded-lg px-2.5 py-1.5 transition-colors ${
              apiKey
                ? 'text-zinc-400 border-white/[0.08] hover:border-white/20 hover:text-zinc-200'
                : 'text-amber-400 border-amber-500/30 hover:border-amber-400/50'
            }`}
          >
            🔑 {apiKey ? masked : 'Set API Key'}
          </button>
        )}

        {open && (
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <input
              type="password"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && save()}
              placeholder="sk-or-v1-…"
              className="input-dark flex-1 min-w-0 px-3 py-2 text-xs rounded-lg"
              autoFocus
            />
            <button
              onClick={save}
              className="btn-primary shrink-0 rounded-lg px-3 py-2 text-xs"
            >
              Save
            </button>
            {apiKey && (
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-600 hover:text-zinc-400 text-sm shrink-0 px-1"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
