import { useState } from 'react'
import { nanoid } from 'nanoid'
import { useLocalStorage } from './hooks/useLocalStorage.js'
import ApiKeyBanner from './components/ApiKeyBanner.jsx'
import GeneratorCard from './components/GeneratorCard.jsx'
import VideoCard from './components/VideoCard.jsx'

export default function App() {
  const [apiKey, setApiKey] = useLocalStorage('or_api_key', '')

  // Persisted jobs: stored without `refs` (refs can contain large base64 data).
  // `params` and `refs` are kept in ephemeral state for the current session only.
  const [persistedJobs, setPersistedJobs] = useLocalStorage('or_jobs', [])

  // Ephemeral per-job data (params + refs) needed for submission, lost on refresh.
  // Keyed by local job id.
  const [ephemeral, setEphemeral] = useState({})

  const [slots, setSlots] = useState([{ id: nanoid() }])

  function addSlot() { setSlots((s) => [...s, { id: nanoid() }]) }
  function removeSlot(id) { setSlots((s) => s.filter((s) => s.id !== id)) }

  function handleGenerate(slotId, model, params, prompt, refs) {
    if (!apiKey) {
      alert('Please set your OpenRouter API key first.')
      return
    }
    const id = nanoid()

    // Save ephemeral submission data (not persisted)
    setEphemeral((e) => ({ ...e, [id]: { params, refs } }))

    // Add persisted job record (no refs/params)
    setPersistedJobs((prev) => [
      {
        id,
        model: { id: model.id, label: model.label, badge: model.badge, refs: model.refs },
        prompt,
        jobId:    null,
        status:   'submitting',
        videoUrl: null,
        cost:     null,
      },
      ...prev,
    ])
  }

  function handleJobUpdate(id, updates) {
    setPersistedJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, ...updates } : j))
    )
  }

  function clearFinished() {
    setPersistedJobs((prev) =>
      prev.filter((j) => j.status !== 'completed' && j.status !== 'failed' && j.status !== 'cancelled' && j.status !== 'expired')
    )
  }

  const finishedCount = persistedJobs.filter(
    (j) => j.status === 'completed' || j.status === 'failed' || j.status === 'cancelled' || j.status === 'expired'
  ).length

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.12), transparent)' }}>
      <ApiKeyBanner apiKey={apiKey} onSave={setApiKey} />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">

        {/* Generator slots */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Generators</h2>
            <button
              onClick={addSlot}
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/25 hover:border-indigo-400/40 rounded-lg px-3 py-1.5 transition-all"
            >
              + Add slot
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {slots.map((slot, i) => (
              <GeneratorCard
                key={slot.id}
                index={i}
                canRemove={slots.length > 1}
                onRemove={() => removeSlot(slot.id)}
                onGenerate={(model, params, prompt, refs) =>
                  handleGenerate(slot.id, model, params, prompt, refs)
                }
              />
            ))}
          </div>
        </section>

        {/* Generated videos */}
        {persistedJobs.length > 0 && (
          <section className="animate-fadeIn">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Generated</h2>
              <div className="flex-1 h-px bg-white/[0.05]" />
              {finishedCount > 0 && (
                <button
                  onClick={clearFinished}
                  className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  Clear finished ({finishedCount})
                </button>
              )}
              <span className="text-xs text-zinc-600">{persistedJobs.length} total</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {persistedJobs.map((job) => (
                <VideoCard
                  key={job.id}
                  job={{ ...job, ...ephemeral[job.id] }}
                  apiKey={apiKey}
                  onUpdate={handleJobUpdate}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
