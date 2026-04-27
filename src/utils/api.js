const BASE = 'https://openrouter.ai/api/v1'

function headers(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }
}

function buildRefsFields(modelId, refs) {
  if (!refs) return {}
  const out = {}

  // frame_images — OpenRouter unified format
  const frames = []
  if (refs.firstFrame?.url) {
    frames.push({ type: 'image_url', image_url: { url: refs.firstFrame.url }, frame_type: 'first_frame' })
  }
  if (refs.lastFrame?.url) {
    frames.push({ type: 'image_url', image_url: { url: refs.lastFrame.url }, frame_type: 'last_frame' })
  }
  if (frames.length) out.frame_images = frames

  // input_references — OpenRouter unified format
  if (refs.images?.length) {
    out.input_references = refs.images.map((img) => ({
      type: 'image_url',
      image_url: { url: img.url },
    }))
  }

  // Seedance-specific: video_urls and audio_urls (passed through to provider)
  if (modelId.startsWith('bytedance/')) {
    if (refs.videos?.length) out.video_urls = refs.videos.map((v) => v.url)
    if (refs.audios?.length) out.audio_urls = refs.audios.map((a) => a.url)
  }

  // Kling-specific: reference video passed through
  if (modelId === 'kwaivgi/kling-video-o1' && refs.videos?.[0]?.url) {
    out.video = refs.videos[0].url
  }

  return out
}

export async function submitVideo(apiKey, modelId, params, prompt, refs) {
  const body = { model: modelId, prompt }

  for (const [k, v] of Object.entries(params)) {
    if (v === '' || v === null || v === undefined) continue
    if (k === 'duration') body.duration = Number(v)
    else if (k === 'seed') body.seed = Number(v)
    else body[k] = v
  }

  Object.assign(body, buildRefsFields(modelId, refs))

  const res = await fetch(`${BASE}/videos`, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `HTTP ${res.status}`)
  }

  return res.json()
}

export async function pollVideo(apiKey, jobId) {
  const res = await fetch(`${BASE}/videos/${jobId}`, {
    headers: headers(apiKey),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `HTTP ${res.status}`)
  }

  return res.json()
}
