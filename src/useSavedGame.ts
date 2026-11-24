import { useCallback, useEffect, useRef, useState } from 'react'
import { ballKeyPrefix, deletedBallKeyPrefix, initialGame, loadGame, rememberBalls, storageKey, type Game } from './model'

export function useSavedGame() {
  const [game, renderGame] = useState(() => {
    const initial = initialGame()
    try { return loadGame(initial) } catch { return initial }
  })
  const [storageError, setStorageError] = useState(false)
  const current = useRef(game)
  const unsaved = useRef(false)

  const setGame = useCallback((change: (base: Game) => Game) => {
    let base = current.current
    if (!unsaved.current) {
      try { base = loadGame(base) } catch { /* Keep playing with the in-memory scene. */ }
    }
    const next = change(base)
    try {
      rememberBalls(next, unsaved.current ? [] : base.collection)
      localStorage.setItem(storageKey, JSON.stringify(next))
      unsaved.current = false
    } catch { unsaved.current = true }
    setStorageError(unsaved.current)
    current.current = next
    renderGame(next)
    return next
  }, [])

  useEffect(() => {
    setGame(value => value)
    const refresh = () => {
      if (unsaved.current) return
      try {
        const next = loadGame(current.current)
        rememberBalls(next, next.collection)
        current.current = next
        renderGame(next)
      } catch { setStorageError(true) }
    }
    const storage = (event: StorageEvent) => {
      if (event.key === storageKey || event.key?.startsWith(ballKeyPrefix) || event.key?.startsWith(deletedBallKeyPrefix)) refresh()
    }
    const visible = () => { if (!document.hidden) refresh() }
    window.addEventListener('storage', storage)
    document.addEventListener('visibilitychange', visible)
    window.addEventListener('pageshow', refresh)
    return () => {
      window.removeEventListener('storage', storage)
      document.removeEventListener('visibilitychange', visible)
      window.removeEventListener('pageshow', refresh)
    }
  }, [setGame])
  return { game, setGame, storageError }
}
