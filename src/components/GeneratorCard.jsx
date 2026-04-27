import { useState } from 'react'
import { MODELS, getModel, defaultParams } from '../constants/models.js'
import ParamsForm from './ParamsForm.jsx'
import ReferenceInput, { emptyRefs } from './ReferenceInput.jsx'

const BADGE_COLOR = {
  ByteDance: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  MiniMax:   'bg-purple-500/15 text-purple-400 border-purple-500/25',
  Kuaishou:  'bg-orange-500/15 text-orange-400 border-orange-500/25',
  Google:    'bg-green-500/15 text-green-400 border-green-500/25',
}

export default function GeneratorCard({ onGenerate, onRemove, index, canRemove }) {
  const [modelId, setModelId] = useState(MODELS[0].id)
  const [params, setParams] = useState(() => defaultParams(MODELS[0]))
  const [prompt, setPrompt] = useState('')
  const [refs, setRefs] = useState(emptyRefs)

  const model = getModel(modelId)

  function handleModelChange(id) {
    setModelId(id)
    setParams(defaultParams(getModel(id)))
    setRefs(emptyRefs())
  }

  function handleSubmit() {
    if (!prompt.trim()) return
    onGenerate(model, params, prompt.trim(), refs)
  }

  return (
    <div className="card card-hover flex flex-col gap-5 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-600 font-medium">Slot #{index + 1}</span>
        {canRemove && (
          <button
            onClick={onRemove}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/[0.04] hover:bg-red-500/20 text-zinc-600 hover:text-red-400 transition-all text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {/* Model selector */}
      <div>
        <label className="section-label block mb-2">Model</label>
        <div className="relative">
          <select
            value={modelId}
            onChange={(e) => handleModelChange(e.target.value)}
            className="input-dark w-full px-3 pr-8 py-2.5 text-sm min-h-[44px] rounded-xl appearance-none"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none text-xs">▾</span>
        </div>
        <div className="mt-2">
          <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${BADGE_COLOR[model.badge] ?? 'bg-zinc-700 text-zinc-400'}`}>
            {model.badge}
          </span>
        </div>
      </div>

      {/* Params */}
      <div>
        <label className="section-label block mb-2">Parameters</label>
        <ParamsForm model={model} values={params} onChange={setParams} />
      </div>

      {/* Prompt */}
      <div>
        <label className="section-label block mb-2">Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the video you want to generate…"
          rows={3}
          className="input-dark w-full px-3 py-2.5 text-sm rounded-xl resize-none"
        />
      </div>

      {/* References */}
      <div className="border-t border-white/[0.06] pt-4">
        <ReferenceInput model={model} refs={refs} onChange={setRefs} />
      </div>

      {/* Generate button */}
      <button
        onClick={handleSubmit}
        disabled={!prompt.trim()}
        className="btn-primary w-full rounded-xl py-3 text-sm"
      >
        ▶ Generate
      </button>
    </div>
  )
}
