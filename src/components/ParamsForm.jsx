export default function ParamsForm({ model, values, onChange }) {
  function set(key, value) {
    const next = { ...values, [key]: value }
    // Hailuo 1080p can't do 10s
    if (model.id === 'minimax/hailuo-2.3') {
      if (next.resolution === '1080p' && next.duration === '10') next.duration = '6'
    }
    onChange(next)
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-3">
      {model.params.map((p) => {
        const isWide = p.type === 'toggle' || p.type === 'slider'
        return (
          <div key={p.key} className={isWide ? 'col-span-2' : ''}>
            <label className="block text-[11px] font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">
              {p.label}
            </label>

            {p.type === 'select' && (
              <select
                value={values[p.key]}
                onChange={(e) => set(p.key, e.target.value)}
                className="input-dark w-full px-3 py-2 text-sm min-h-[44px] rounded-lg"
              >
                {p.options.map((opt) => {
                  let disabled = false
                  if (p.disabledWhen) {
                    const { value: dv, ...conds } = p.disabledWhen
                    disabled = opt === dv && Object.entries(conds).every(([k, v]) => values[k] === v)
                  }
                  return (
                    <option key={opt} value={opt} disabled={disabled}>
                      {opt}{p.unit ? ` ${p.unit}` : ''}
                    </option>
                  )
                })}
              </select>
            )}

            {p.type === 'slider' && (
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={p.min}
                  max={p.max}
                  step={p.step}
                  value={values[p.key]}
                  onChange={(e) => set(p.key, Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-mono text-indigo-300 w-10 text-right shrink-0">
                  {values[p.key]}{p.unit ?? ''}
                </span>
              </div>
            )}

            {p.type === 'number' && (
              <input
                type="number"
                value={values[p.key]}
                onChange={(e) => set(p.key, e.target.value)}
                placeholder={p.placeholder}
                className="input-dark w-full px-3 py-2 text-sm min-h-[44px] rounded-lg"
              />
            )}

            {p.type === 'toggle' && (
              <button
                type="button"
                onClick={() => set(p.key, !values[p.key])}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-sm min-h-[44px] w-full transition-all ${
                  values[p.key]
                    ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                    : 'bg-white/[0.03] border-white/[0.08] text-zinc-500 hover:text-zinc-400'
                }`}
              >
                {/* pill toggle */}
                <span className={`relative inline-flex w-9 h-5 rounded-full transition-colors shrink-0 ${values[p.key] ? 'bg-indigo-500' : 'bg-zinc-700'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${values[p.key] ? 'left-4' : 'left-0.5'}`} />
                </span>
                <span className="text-xs font-medium">{values[p.key] ? 'On' : 'Off'}</span>
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
