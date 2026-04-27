import { useVideoJob } from '../hooks/useVideoJob.js'

const STATUS_META = {
  idle:        { label: 'Idle',         color: 'text-zinc-500',    dot: 'bg-zinc-600' },
  submitting:  { label: 'Submitting…',  color: 'text-yellow-400',  dot: 'bg-yellow-400', pulse: true },
  pending:     { label: 'Pending…',     color: 'text-yellow-400',  dot: 'bg-yellow-400', pulse: true },
  in_progress: { label: 'Generating…',  color: 'text-indigo-400',  dot: 'bg-indigo-400', pulse: true },
  completed:   { label: 'Completed',    color: 'text-emerald-400', dot: 'bg-emerald-400' },
  failed:      { label: 'Failed',       color: 'text-red-400',     dot: 'bg-red-500' },
  cancelled:   { label: 'Cancelled',    color: 'text-red-400',     dot: 'bg-red-500' },
  expired:     { label: 'Expired',      color: 'text-red-400',     dot: 'bg-red-500' },
}

const ACTIVE = new Set(['submitting', 'pending', 'in_progress'])

export default function VideoCard({ job, apiKey, onUpdate }) {
  const { status, videoUrl, cost, error } = useVideoJob({
    apiKey,
    model:           job.model,
    params:          job.params,
    prompt:          job.prompt,
    refs:            job.refs,
    initialJobId:    job.jobId,
    initialStatus:   job.status,
    initialVideoUrl: job.videoUrl,
    initialCost:     job.cost,
    onUpdate:        (updates) => onUpdate(job.id, updates),
  })

  const meta    = STATUS_META[status] ?? STATUS_META.idle
  const isActive = ACTIVE.has(status)
  const isDone   = status === 'completed'

  return (
    <div className={`card overflow-hidden transition-all duration-500 ${isDone ? 'ring-1 ring-emerald-500/20' : ''}`}>
      {videoUrl ? (
        <video
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          controls
          className="w-full aspect-video object-cover bg-black"
        />
      ) : (
        <div className="w-full aspect-video bg-black/40 flex flex-col items-center justify-center gap-3">
          {isActive ? (
            <>
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-400 animate-spin" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs text-zinc-400 font-medium">{meta.label}</p>
                <p className="text-[11px] text-zinc-600">This may take a minute or two</p>
              </div>
            </>
          ) : (
            <div className="text-center space-y-1 px-4">
              <p className={`text-sm font-medium ${meta.color}`}>{meta.label}</p>
              {error && <p className="text-xs text-red-400/80 break-words">{error}</p>}
            </div>
          )}
        </div>
      )}

      <div className="px-3 py-2.5 flex items-start gap-2">
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot} ${meta.pulse ? 'animate-pulse2' : ''}`} />
            <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
            {cost != null && (
              <span className="text-[10px] text-zinc-600 ml-auto">${cost.toFixed(3)}</span>
            )}
          </div>
          <p className="text-xs text-zinc-400 font-medium truncate">{job.model.label}</p>
          <p className="text-[11px] text-zinc-600 truncate">{job.prompt}</p>
        </div>

        {videoUrl && (
          <a
            href={videoUrl}
            download
            className="shrink-0 flex items-center gap-1 text-[11px] font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg px-2.5 py-1.5 transition-colors"
          >
            ⬇ Save
          </a>
        )}
      </div>
    </div>
  )
}
