import { useState } from 'react'

export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? stored : initial
    } catch {
      return initial
    }
  })

  function set(v) {
    setValue(v)
    try {
      localStorage.setItem(key, v)
    } catch {}
  }

  return [value, set]
}
