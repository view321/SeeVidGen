import { useRef, useState } from 'react'
import { fileToDataUrl } from '../utils/fileToDataUrl.js'

export function emptyRefs() {
  return { images: [], firstFrame: null, lastFrame: null, videos: [], audios: [] }
}

const TABS = [
  { key: 'frames', label: 'Frames',  icon: '⬛' },
  { key: 'images', label: 'Images',  icon: '🖼' },
  { key: 'video',  label: 'Video',   icon: '🎬' },
  { key: 'audio',  label: 'Audio',   icon: '🎵' },
]

function hasAnyRefs(refs) {
  return (
    refs.images.length > 0 ||
    refs.firstFrame ||
    refs.lastFrame ||
    refs.videos.length > 0 ||
    refs.audios.length > 0
  )
}

function countRefs(refs) {
  return (
    refs.images.length +
    (refs.firstFrame ? 1 : 0) +
    (refs.lastFrame ? 1 : 0) +
    refs.videos.length +
    refs.audios.length
  )
}

export default function ReferenceInput({ model, refs, onChange }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('frames')
  const imageRef = useRef()

  const { refs: cap } = model
  const supportsFrames = cap.firstFrame || cap.lastFrame
  const supportsImages = !!cap.images
  const supportsVideo  = !!cap.video
  const supportsAudio  = !!cap.audio

  const availableTabs = TABS.filter((t) => {
    if (t.key === 'frames') return supportsFrames
    if (t.key === 'images') return supportsImages
    if (t.key === 'video')  return supportsVideo
    if (t.key === 'audio')  return supportsAudio
    return false
  })

  // Auto-switch to a supported tab if current one becomes unavailable
  const activeTab = availableTabs.find((t) => t.key === tab) ? tab : availableTabs[0]?.key

  const totalCount = countRefs(refs)

  async function addImages(files) {
    const items = await Promise.all(
      Array.from(files).map(async (f) => ({ name: f.name, url: await fileToDataUrl(f) }))
    )
    const max = cap.images?.max ?? 0
    const next = [...refs.images, ...items].slice(0, max)
    onChange({ ...refs, images: next })
  }

  async function setFrame(slot, file) {
    const item = { name: file.name, url: await fileToDataUrl(file) }
    onChange({ ...refs, [slot]: item })
  }

  function addVideoUrl(url) {
    if (!url.trim()) return
    const max = cap.video?.max ?? 0
    if (refs.videos.length >= max) return
    onChange({ ...refs, videos: [...refs.videos, { name: url, url }] })
  }

  function addAudioUrl(url) {
    if (!url.trim()) return
    const max = cap.audio?.max ?? 0
    if (refs.audios.length >= max) return
    onChange({ ...refs, audios: [...refs.audios, { name: url, url }] })
  }

  async function addVideoFile(file) {
    const max = cap.video?.max ?? 0
    if (refs.videos.length >= max) return
    const item = { name: file.name, url: await fileToDataUrl(file) }
    onChange({ ...refs, videos: [...refs.videos, item] })
  }

  async function addAudioFile(file) {
    const max = cap.audio?.max ?? 0
    if (refs.audios.length >= max) return
    const item = { name: file.name, url: await fileToDataUrl(file) }
    onChange({ ...refs, audios: [...refs.audios, item] })
  }

  if (!availableTabs.length) return null

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full py-1 group"
      >
        <span className="section-label flex-1 text-left group-hover:text-zinc-400 transition-colors">
          References
        </span>
        {totalCount > 0 && (
          <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full px-1.5 py-0.5">
            {totalCount}
          </span>
        )}
        <span className={`text-zinc-600 text-xs transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {open && (
        <div className="mt-3 animate-fadeIn">
          {/* Tabs */}
          <div className="flex gap-1 mb-3 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
            {availableTabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all duration-150 ${
                  activeTab === t.key
                    ? 'bg-indigo-600/80 text-white shadow'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Frames tab */}
          {activeTab === 'frames' && (
            <div className="grid grid-cols-2 gap-3 animate-fadeIn">
              {cap.firstFrame && (
                <FrameSlot
                  label="First Frame"
                  value={refs.firstFrame}
                  onSet={(f) => setFrame('firstFrame', f)}
                  onClear={() => onChange({ ...refs, firstFrame: null })}
                />
              )}
              {cap.lastFrame && (
                <FrameSlot
                  label="Last Frame"
                  value={refs.lastFrame}
                  onSet={(f) => setFrame('lastFrame', f)}
                  onClear={() => onChange({ ...refs, lastFrame: null })}
                />
              )}
            </div>
          )}

          {/* Images tab */}
          {activeTab === 'images' && supportsImages && (
            <div className="animate-fadeIn space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">
                  {refs.images.length} / {cap.images.max} images
                </span>
                {refs.images.length < cap.images.max && (
                  <label className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors">
                    + Add images
                    <input
                      ref={imageRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => addImages(e.target.files)}
                    />
                  </label>
                )}
              </div>
              {refs.images.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {refs.images.map((img, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-16 h-16 object-cover rounded-lg border border-white/10"
                      />
                      <button
                        type="button"
                        onClick={() => onChange({ ...refs, images: refs.images.filter((_, idx) => idx !== i) })}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-zinc-800 border border-white/10 text-zinc-400 hover:text-red-400 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {refs.images.length < cap.images.max && (
                    <label className="w-16 h-16 rounded-lg border border-dashed border-white/10 hover:border-indigo-500/50 cursor-pointer flex items-center justify-center text-zinc-600 hover:text-indigo-400 text-xl transition-colors">
                      +
                      <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addImages(e.target.files)} />
                    </label>
                  )}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-white/10 hover:border-indigo-500/40 rounded-xl cursor-pointer text-zinc-600 hover:text-zinc-400 transition-colors">
                  <span className="text-2xl mb-1">🖼</span>
                  <span className="text-xs">Tap to add up to {cap.images.max} images</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addImages(e.target.files)} />
                </label>
              )}
            </div>
          )}

          {/* Video tab */}
          {activeTab === 'video' && supportsVideo && (
            <MediaList
              items={refs.videos}
              max={cap.video.max}
              icon="🎬"
              accept="video/*"
              label="video"
              onAddFile={addVideoFile}
              onAddUrl={addVideoUrl}
              onRemove={(i) => onChange({ ...refs, videos: refs.videos.filter((_, idx) => idx !== i) })}
              extra={
                model.id === 'kwaivgi/kling-video-o1' && refs.videos.length > 0
                  ? `Note: image limit reduces to 4 when a reference video is used`
                  : null
              }
            />
          )}

          {/* Audio tab */}
          {activeTab === 'audio' && supportsAudio && (
            <MediaList
              items={refs.audios}
              max={cap.audio.max}
              icon="🎵"
              accept="audio/*"
              label="audio"
              onAddFile={addAudioFile}
              onAddUrl={addAudioUrl}
              onRemove={(i) => onChange({ ...refs, audios: refs.audios.filter((_, idx) => idx !== i) })}
              extra="MP3 or WAV, max 15 s combined"
            />
          )}
        </div>
      )}
    </div>
  )
}

function FrameSlot({ label, value, onSet, onClear }) {
  return (
    <div>
      <p className="text-[11px] text-zinc-500 mb-1.5">{label}</p>
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-white/10">
          <img src={value.url} alt={label} className="w-full h-24 object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={onClear}
              className="bg-red-600/80 text-white text-xs px-3 py-1 rounded-lg"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-white/10 hover:border-indigo-500/40 rounded-xl cursor-pointer text-zinc-600 hover:text-zinc-400 transition-colors">
          <span className="text-xl mb-1">+</span>
          <span className="text-[11px]">Image</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && onSet(e.target.files[0])} />
        </label>
      )}
    </div>
  )
}

function MediaList({ items, max, icon, accept, label, onAddFile, onAddUrl, onRemove, extra }) {
  const [urlDraft, setUrlDraft] = useState('')

  function submitUrl() {
    if (!urlDraft.trim()) return
    onAddUrl(urlDraft.trim())
    setUrlDraft('')
  }

  return (
    <div className="animate-fadeIn space-y-3">
      {extra && <p className="text-[11px] text-amber-400/70">{extra}</p>}

      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2">
          <span className="text-base">{icon}</span>
          <span className="text-xs text-zinc-300 truncate flex-1">{item.name}</span>
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="text-zinc-600 hover:text-red-400 text-xs transition-colors"
          >
            ✕
          </button>
        </div>
      ))}

      {items.length < max && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 input-dark px-3 py-2 cursor-pointer hover:border-white/20 transition-colors min-h-[44px] rounded-lg">
            <span className="text-sm">📎</span>
            <span className="text-xs text-zinc-400">Upload {label}</span>
            <input type="file" accept={accept} className="hidden" onChange={(e) => e.target.files[0] && onAddFile(e.target.files[0])} />
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitUrl()}
              placeholder={`Paste ${label} URL…`}
              className="input-dark flex-1 min-w-0 px-3 py-2 text-xs min-h-[44px] rounded-lg"
            />
            <button
              type="button"
              onClick={submitUrl}
              disabled={!urlDraft.trim()}
              className="text-xs bg-indigo-600/60 hover:bg-indigo-600/80 disabled:opacity-30 text-white px-3 py-2 rounded-lg transition-colors min-h-[44px]"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
