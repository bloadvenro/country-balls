import { type Code } from './countries'

let player: HTMLAudioElement | undefined
let generation = 0
let context: AudioContext | undefined
export function stopVoice() {
  generation++
  player?.pause()
  if (player) player.currentTime = 0
  player = undefined
}
export function pronounce(code: Code, enabled: boolean, onUnavailable?: () => void) {
  stopVoice()
  if (!enabled) return
  const token = generation
  player = new Audio(`./voice/${code}.mp3`)
  let failed = false
  const unavailable = () => {
    if (failed || generation !== token) return
    failed = true
    player = undefined
    onUnavailable?.()
  }
  player.addEventListener('error', unavailable, { once: true })
  player.addEventListener('ended', () => {
    if (generation === token) player = undefined
  }, { once: true })
  void player.play().catch(unavailable)
}
export function chime(enabled: boolean, pair = false) {
  if (!enabled) return
  try {
    context ??= new AudioContext()
    if (context.state === 'suspended') void context.resume().catch(() => {})
    const t = context.currentTime
    ;(pair ? [493.88, 659.25] : [587.33]).forEach((hz, i) => {
      const osc = context!.createOscillator(), gain = context!.createGain(), start = t + i * .16
      osc.type = 'sine'; osc.frequency.setValueAtTime(hz, start)
      gain.gain.setValueAtTime(.0001, start); gain.gain.exponentialRampToValueAtTime(.09, start + .018)
      gain.gain.exponentialRampToValueAtTime(.0001, start + .24)
      osc.connect(gain); gain.connect(context!.destination); osc.start(start); osc.stop(start + .25)
    })
  } catch { /* Silent play still works on devices without Web Audio. */ }
}
