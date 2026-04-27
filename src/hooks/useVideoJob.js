import { useEffect, useRef, useState } from 'react'
import { submitVideo, pollVideo } from '../utils/api.js'

const POLL_INTERVAL = 5000

export function useVideoJob(apiKey, model, params, prompt, refs, enabled) {
  const [status, setStatus] = useState('idle')
  const [videoUrl, setVideoUrl] = useState(null)
  const [cost, setCost] = useState(null)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)
  const jobIdRef = useRef(null)

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    async function start() {
      setStatus('submitting')
      setError(null)
      try {
        const data = await submitVideo(apiKey, model.id, params, prompt, refs)
        if (cancelled) return
        jobIdRef.current = data.id
        setStatus(data.status ?? 'pending')

        intervalRef.current = setInterval(async () => {
          try {
            const poll = await pollVideo(apiKey, jobIdRef.current)
            if (cancelled) return
            setStatus(poll.status)
            if (poll.usage?.cost != null) setCost(poll.usage.cost)
            if (poll.status === 'completed') {
              clearInterval(intervalRef.current)
              const url = poll.unsigned_urls?.[0] ?? null
              setVideoUrl(url)
            } else if (poll.status === 'failed' || poll.status === 'cancelled' || poll.status === 'expired') {
              clearInterval(intervalRef.current)
              setError(`Generation ${poll.status}`)
            }
          } catch (e) {
            if (!cancelled) setError(e.message)
            clearInterval(intervalRef.current)
          }
        }, POLL_INTERVAL)
      } catch (e) {
        if (!cancelled) {
          setError(e.message)
          setStatus('failed')
        }
      }
    }

    start()

    return () => {
      cancelled = true
      clearInterval(intervalRef.current)
    }
  }, [enabled])

  return { status, videoUrl, cost, error }
}
