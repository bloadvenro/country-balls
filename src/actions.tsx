import {
  Flower2, Hand, HandHeart, Handshake, Laugh, MessageCircleWarning, Music2,
  Speech, type LucideIcon, type LucideProps,
} from 'lucide-react'
import { forwardRef } from 'react'

const Pictogram = (children: React.ReactNode) => forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, color = 'currentColor', strokeWidth = 2, ...props }, ref) =>
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>{children}</svg>
)
const WaveIcon = Pictogram(<><path d="M8 13V7a2 2 0 0 1 4 0v3-5a2 2 0 0 1 4 0v5-3a2 2 0 0 1 4 0v7c0 5-3 8-8 8-4 0-6-2-8-6l-1-2a2 2 0 0 1 3-2l2 1Z"/><path d="M3 4 1 2m4 0V0m-4 7H0"/></>)
const TongueIcon = Pictogram(<><circle cx="12" cy="12" r="9"/><path d="M8 10h.01M16 10h.01M8 15h8"/><path d="M11 15v3a2 2 0 0 0 4 0v-3"/></>)
const BumpIcon = Pictogram(<><circle cx="7" cy="13" r="5"/><circle cx="17" cy="13" r="5"/><path d="m11 4 1-2 1 2m-1 2v2"/></>)

// Paired actions show the two participants in the main picture, even on a small screen.
const TwoFriends = Pictogram(<><path d="M12 11 6.7 6.2C4 3 8 0 10.5 3L12 4.7 13.5 3C16 .2 20 3 17.3 6.2Z" fill="#ff91ae"/><circle cx="5.5" cy="17" r="4.4"/><circle cx="18.5" cy="17" r="4.4"/></>)
const Duet = Pictogram(<><path d="M8 13V5l12-3v9M8 8l12-3"/><ellipse cx="5.5" cy="15.5" rx="3" ry="3.5" fill="#a89be9"/><ellipse cx="17.5" cy="13.5" rx="3" ry="3.5" fill="#ed9fc0"/><path d="m2 21 3 1 3-1m7-2 3 1 3-1"/></>)
const DoubleLaugh = Pictogram(<><circle cx="8" cy="14" r="6.6"/><path d="M12 5a6 6 0 1 1 3 10M4 13l2-1m3 0 2 1m-6 2q3 5 6-1m4-6 1-1m2 2 1-1m-3 3q2 2 4-1"/></>)
const JumpPair = Pictogram(<><circle cx="6" cy="16" r="4"/><circle cx="18" cy="16" r="4"/><path d="M6 10V3m-3 3 3-3 3 3m9 4V3m-3 3 3-3 3 3M3 22h6m6 0h6"/></>)

export type Action = {
  label: string
  kind: 'pair' | 'solo'
  icon: LucideIcon
  duration: number
  animationKey: 'greet' | 'friend' | 'laugh' | 'argue' | 'sulk' | 'reconcile' | 'dance' | 'bump' | 'flower' | 'tongue' | 'jump' | 'hug' | 'wave'
  fxKey?: 'heart' | 'spark' | 'puff' | 'note' | 'impact' | 'flower'
}

export const actions = {
  greet: { label: 'Поздороваться', kind: 'pair', icon: Hand, duration: 1250, animationKey: 'greet' },
  friend: { label: 'Подружиться', kind: 'pair', icon: TwoFriends, duration: 2050, animationKey: 'friend', fxKey: 'heart' },
  laugh: { label: 'Посмеяться', kind: 'solo', icon: Laugh, duration: 1450, animationKey: 'laugh', fxKey: 'spark' },
  laughTogether: { label: 'Посмеяться вместе', kind: 'pair', icon: DoubleLaugh, duration: 1450, animationKey: 'laugh', fxKey: 'spark' },
  argue: { label: 'Поспорить', kind: 'pair', icon: MessageCircleWarning, duration: 2000, animationKey: 'argue', fxKey: 'puff' },
  sulk: { label: 'Надуться', kind: 'solo', icon: Speech, duration: 1250, animationKey: 'sulk', fxKey: 'puff' },
  reconcile: { label: 'Помириться', kind: 'pair', icon: Handshake, duration: 1700, animationKey: 'reconcile', fxKey: 'heart' },
  dance: { label: 'Танцевать', kind: 'solo', icon: Music2, duration: 2500, animationKey: 'dance', fxKey: 'note' },
  danceTogether: { label: 'Танцевать вместе', kind: 'pair', icon: Duet, duration: 2800, animationKey: 'dance', fxKey: 'note' },
  bump: { label: 'Столкнуться', kind: 'pair', icon: BumpIcon, duration: 1200, animationKey: 'bump', fxKey: 'impact' },
  flower: { label: 'Подарить цветок', kind: 'pair', icon: Flower2, duration: 1900, animationKey: 'flower', fxKey: 'flower' },
  tongue: { label: 'Показать язык', kind: 'solo', icon: TongueIcon, duration: 1300, animationKey: 'tongue' },
  jump: { label: 'Прыгнуть вместе', kind: 'pair', icon: JumpPair, duration: 1500, animationKey: 'jump', fxKey: 'spark' },
  hug: { label: 'Обняться', kind: 'pair', icon: HandHeart, duration: 1850, animationKey: 'hug', fxKey: 'heart' },
  wave: { label: 'Помахать', kind: 'solo', icon: WaveIcon, duration: 1300, animationKey: 'wave' },
} as const satisfies Record<string, Action>

export type ActionId = keyof typeof actions
export type Performance = { action: ActionId; from: string; to?: string; start: number }

let audio: AudioContext | undefined
let lastSound = 0
const playing = new Set<OscillatorNode>()
export function soundAction(action: ActionId, enabled: boolean) {
  if (!enabled || typeof AudioContext === 'undefined' || performance.now() - lastSound < 70) return
  lastSound = performance.now()
  try {
    audio ??= new AudioContext()
    if (audio.state === 'suspended') void audio.resume().catch(() => {})
    playing.forEach(node => { try { node.stop() } catch { /* already stopped */ } })
    playing.clear()
    const now = audio.currentTime
    const signature: Record<Action['animationKey'], [number, number, OscillatorType]> = {
      greet: [420, 620, 'sine'], friend: [660, 880, 'sine'], laugh: [520, 760, 'triangle'],
      argue: [170, 130, 'sawtooth'], sulk: [230, 150, 'triangle'], reconcile: [440, 700, 'sine'],
      dance: [330, 660, 'triangle'], bump: [150, 95, 'sine'], flower: [590, 790, 'sine'],
      tongue: [310, 470, 'square'], jump: [280, 560, 'sine'], hug: [390, 585, 'sine'],
      wave: [480, 540, 'triangle'],
    }
    const [a, b, type] = signature[actions[action].animationKey]
    ;[a, b].forEach((frequency, i) => {
      const oscillator = audio!.createOscillator(), gain = audio!.createGain()
      playing.add(oscillator)
      oscillator.type = type
      oscillator.frequency.setValueAtTime(frequency, now + i * .09)
      gain.gain.setValueAtTime(.0001, now + i * .09)
      gain.gain.exponentialRampToValueAtTime(.035, now + i * .09 + .015)
      gain.gain.exponentialRampToValueAtTime(.0001, now + i * .09 + .13)
      oscillator.connect(gain).connect(audio!.destination)
      oscillator.addEventListener('ended', () => playing.delete(oscillator), { once:true })
      oscillator.start(now + i * .09); oscillator.stop(now + i * .09 + .14)
    })
  } catch {
    audio = undefined
    playing.clear()
  }
}
