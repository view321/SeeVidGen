import { useEffect, useRef, useState } from 'react'
import { submitVideo, pollVideo } from '../utils/api.js'

const POLL_INTERVAL = 5000
const TERMINAL = new Set(['completed', 'failed', 'cancelled', 'expired'])

export function useVideoJob({
  apiKey,
  model,
  params,
  prompt,
  refs,
  initialJobId = null,
  initialStatus = 'idle',
  initialVideoUrl = null,
  initialCost = null,
  onUpdate,
}) {
  const isTerminal = TERMINAL.has(initialStatus)

  const [status, setStatus]     = useState(initialStatus)
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl)
  const [cost, setCost]         = useState(initialCost)
  const [error, setError]       = useState(null)
  const intervalRef = useRef(null)
  const jobIdRef    = useRef(initialJobId)

  function notify(updates) {
    if (updates.status   !== undefined) setStatus(updates.status)
    if (updates.videoUrl !== undefined) setVideoUrl(updates.videoUrl)
    if (updates.cost     !== undefined) setCost(updates.cost)
    if (updates.error    !== undefined) setError(updates.error)
    onUpdate?.({ jobId: jobIdRef.current, ...updates })
  }

  useEffect(() => {
    // Already finished — nothing to do
    if (isTerminal) return

    // Can't resume without jobId and no way to resubmit (no refs after restore)
    if (initialJobId === null && !params) {
      notify({ status: 'failed', error: 'Lost on refresh — please regenerate' })
      return
    }

    let cancelled = false

    async function start() {
      try {
        let jobId = jobIdRef.current

        if (!jobId) {
          notify({ status: 'submitting' })
          const data = await submitVideo(apiKey, model.id, params, prompt, refs)
          if (cancelled) return
          jobId = data.id
          jobIdRef.current = jobId
          notify({ jobId, status: data.status ?? 'pending' })
        }

        intervalRef.current = setInterval(async () => {
          try {
            const poll = await pollVideo(apiKey, jobId)
            if (cancelled) return

            const updates = { status: poll.status }
            if (poll.usage?.cost != null) updates.cost = poll.usage.cost

            if (poll.status === 'completed') {
              clearInterval(intervalRef.current)
              updates.videoUrl = poll.unsigned_urls?.[0] ?? null
            } else if (TERMINAL.has(poll.status)) {
              clearInterval(intervalRef.current)
              updates.error = `Generation ${poll.status}`
            }

            notify(updates)
          } catch (e) {
            if (!cancelled) notify({ error: e.message })
            clearInterval(intervalRef.current)
          }
        }, POLL_INTERVAL)
      } catch (e) {
        if (!cancelled) notify({ status: 'failed', error: e.message })
      }
    }

    start()

    return () => {
      cancelled = true
      clearInterval(intervalRef.current)
    }
  }, []) // intentionally empty — args are captured at mount time

  return { status, videoUrl, cost, error }
}
