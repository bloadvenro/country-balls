import { useEffect } from 'react'
import type { BackgroundId } from './model'

export function useSceneMusic(scene: BackgroundId, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    const track = new Audio(`./music/${scene}.mp3`)
    track.volume = .42
    track.loop = true
    let pending = false
    const play = () => {
      if (document.hidden || !track.paused || pending) return
      pending = true
      // Browsers may require a user gesture before the first note.
      void track.play().catch(() => {}).finally(() => { pending = false })
    }
    const visibility = () => { if (document.hidden) track.pause(); else play() }
    play()
    document.addEventListener('click', play)
    document.addEventListener('keydown', play)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      document.removeEventListener('click', play)
      document.removeEventListener('keydown', play)
      document.removeEventListener('visibilitychange', visibility)
      track.pause()
      track.removeAttribute('src')
      track.load()
    }
  }, [scene, enabled])
}
