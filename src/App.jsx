import { useState } from 'react'
import { nanoid } from 'nanoid'
import { useLocalStorage } from './hooks/useLocalStorage.js'
import ApiKeyBanner from './components/ApiKeyBanner.jsx'
import GeneratorCard from './components/GeneratorCard.jsx'
import VideoCard from './components/VideoCard.jsx'

export default function App() {
  const [apiKey, setApiKey] = useLocalStorage('or_api_key', '')
  const [slots, setSlots] = useState([{ id: nanoid() }])
  const [jobs, setJobs] = useState([])

  function addSlot() {
    setSlots((s) => [...s, { id: nanoid() }])
  }

  function removeSlot(id) {
    setSlots((s) => s.filter((slot) => slot.id !== id))
  }

  function handleGenerate(slotId, model, params, prompt, refs) {
    if (!apiKey) {
      alert('Please set your OpenRouter API key first.')
      return
    }
    setJobs((prev) => [{ id: nanoid(), slotId, model, params, prompt, refs }, ...prev])
  }

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
        {jobs.length > 0 && (
          <section className="animate-fadeIn">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Generated</h2>
              <div className="flex-1 h-px bg-white/[0.05]" />
              <span className="text-xs text-zinc-600">{jobs.length} video{jobs.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <VideoCard key={job.id} job={job} apiKey={apiKey} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
