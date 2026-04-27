// refs capability shape:
// {
//   images:     null | { max: number }  → input_references (OpenRouter unified)
//   firstFrame: boolean                  → frame_images[first_frame]
//   lastFrame:  boolean                  → frame_images[last_frame]
//   video:      null | { max: number }  → video_urls (Seedance) / video (Kling) — URL only
//   audio:      null | { max: number }  → audio_urls (Seedance) — URL only
// }

export const MODELS = [
  {
    id: 'bytedance/seedance-2.0',
    label: 'Seedance 2.0',
    badge: 'ByteDance',
    refs: {
      images:     { max: 9 },
      firstFrame: true,
      lastFrame:  true,
      video:      { max: 3 },
      audio:      { max: 3 },
    },
    params: [
      { key: 'duration', label: 'Duration', type: 'slider', min: 4, max: 15, step: 1, default: 5, unit: 's' },
      { key: 'resolution', label: 'Resolution', type: 'select', options: ['480p', '720p', '2K'], default: '720p' },
      { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'], default: '16:9' },
      { key: 'generate_audio', label: 'Audio', type: 'toggle', default: false },
      { key: 'seed', label: 'Seed', type: 'number', placeholder: 'Random', default: '' },
    ],
  },
  {
    id: 'bytedance/seedance-2.0:fast',
    label: 'Seedance 2.0 Fast',
    badge: 'ByteDance',
    refs: {
      images:     { max: 9 },
      firstFrame: true,
      lastFrame:  true,
      video:      { max: 3 },
      audio:      { max: 3 },
    },
    params: [
      { key: 'duration', label: 'Duration', type: 'slider', min: 4, max: 15, step: 1, default: 5, unit: 's' },
      { key: 'resolution', label: 'Resolution', type: 'select', options: ['480p', '720p', '2K'], default: '720p' },
      { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'], default: '16:9' },
      { key: 'generate_audio', label: 'Audio', type: 'toggle', default: false },
      { key: 'seed', label: 'Seed', type: 'number', placeholder: 'Random', default: '' },
    ],
  },
  {
    id: 'minimax/hailuo-2.3',
    label: 'Hailuo 2.3',
    badge: 'MiniMax',
    refs: {
      images:     null,
      firstFrame: true,
      lastFrame:  true,
      video:      null,
      audio:      null,
    },
    params: [
      { key: 'resolution', label: 'Resolution', type: 'select', options: ['768p', '1080p'], default: '768p' },
      {
        key: 'duration', label: 'Duration', type: 'select', options: ['6', '10'], default: '6',
        disabledWhen: { resolution: '1080p', value: '10' },
      },
      { key: 'seed', label: 'Seed', type: 'number', placeholder: 'Random', default: '' },
    ],
  },
  {
    id: 'kwaivgi/kling-video-o1',
    label: 'Kling Video O1',
    badge: 'Kuaishou',
    refs: {
      images:     { max: 7 },  // reduces to 4 when video reference is present
      firstFrame: true,
      lastFrame:  true,
      video:      { max: 1 },
      audio:      null,
    },
    params: [
      { key: 'duration', label: 'Duration', type: 'slider', min: 5, max: 10, step: 1, default: 5, unit: 's' },
      { key: 'resolution', label: 'Resolution', type: 'select', options: ['720p', '1080p'], default: '720p' },
      { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['16:9', '9:16', '1:1'], default: '16:9' },
      { key: 'keep_audio', label: 'Keep Audio', type: 'toggle', default: false },
      { key: 'seed', label: 'Seed', type: 'number', placeholder: 'Random', default: '' },
    ],
  },
  {
    id: 'google/veo-3.1-lite',
    label: 'Veo 3.1 Lite',
    badge: 'Google',
    refs: {
      images:     null,
      firstFrame: true,
      lastFrame:  false,
      video:      null,
      audio:      null,
    },
    params: [
      { key: 'duration', label: 'Duration', type: 'select', options: ['4', '6', '8'], default: '6', unit: 's' },
      { key: 'resolution', label: 'Resolution', type: 'select', options: ['720p', '1080p'], default: '720p' },
      { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['16:9', '9:16'], default: '16:9' },
      { key: 'generate_audio', label: 'Audio', type: 'toggle', default: true },
      { key: 'seed', label: 'Seed', type: 'number', placeholder: 'Random', default: '' },
    ],
  },
  {
    id: 'google/veo-3.1',
    label: 'Veo 3.1 Fast',
    badge: 'Google',
    refs: {
      images:     { max: 3 },
      firstFrame: true,
      lastFrame:  true,
      video:      null,
      audio:      null,
    },
    params: [
      { key: 'duration', label: 'Duration', type: 'select', options: ['4', '6', '8'], default: '6', unit: 's' },
      { key: 'resolution', label: 'Resolution', type: 'select', options: ['720p', '1080p'], default: '720p' },
      { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['16:9', '9:16'], default: '16:9' },
      { key: 'generate_audio', label: 'Audio', type: 'toggle', default: true },
      { key: 'personGeneration', label: 'Persons', type: 'select', options: ['allow_adult', 'disallow'], default: 'allow_adult' },
      { key: 'seed', label: 'Seed', type: 'number', placeholder: 'Random', default: '' },
    ],
  },
]

export function getModel(id) {
  return MODELS.find((m) => m.id === id) ?? MODELS[0]
}

export function defaultParams(model) {
  return Object.fromEntries(model.params.map((p) => [p.key, p.default]))
}
