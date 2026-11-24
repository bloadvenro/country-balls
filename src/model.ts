import {
  countries, favoriteCodes, flagOf, nameOf, type Code,
} from './countries'
import {
  eyeStyles, mouthStyles, type Eyes, type Mouth, faces, itemAnchor, items, type Face, type Item,
} from './toys'

export { countries, favoriteCodes, faces, flagOf, items, nameOf, type Code, type Face, type Item }

export const backgrounds = ['park', 'playground', 'party', 'space', 'ocean', 'ice'] as const
export type BackgroundId = typeof backgrounds[number]
export type PersonalityId = 'cheerful' | 'shy' | 'mischievous' | 'calm'
export type Pose = { x: number; y: number; scale: number; angle: number }
export type Accessory = Pose & { id: string; kind: Item }
export type Ball = {
  id: string
  code: Code
  eyes?: Eyes
  mouth?: Mouth
  face: Face
  accessories: Accessory[]
  personalityId?: PersonalityId
}
export type Actor = Pose & { id: string; ballId: string; facing?: -1 | 1 }
export type Game = {
  version: 1
  collection: Ball[]
  actors: Actor[]
  voice: boolean
  music: boolean
  sounds: boolean
  backgroundId: BackgroundId
}

export const id = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
export function accessory(kind: Item): Accessory {
  const [x, y] = itemAnchor(kind)
  return { id: id(), kind, x, y, scale: 1, angle: 0 }
}
export const newBall = (code: Code = favoriteCodes[0] ?? countries[0][0]): Ball => ({
  id: id(), code, face: 'smile', eyes: 'classic', mouth: 'none', accessories: [], personalityId: 'cheerful',
})
export const starterBalls: Ball[] = [
  { id: 'friend-jp', code: 'jp' as Code, face: 'smile' as Face, accessories: [], personalityId: 'cheerful' },
  { id: 'friend-br', code: 'br' as Code, face: 'laugh' as Face, accessories: [], personalityId: 'mischievous' },
]
export const makeActor = (ballId: string, x: number, y: number): Actor =>
  ({ id: id(), ballId, x, y, scale: 1, angle: 0 })
export function initialGame(): Game {
  return {
    version: 1, collection: [],
    actors: [makeActor('friend-jp', .32, .62), makeActor('friend-br', .68, .62)],
    voice: true, sounds: true, music: true, backgroundId: 'park',
  }
}

// Keep the v1 key and shape additive so existing browser saves migrate in place.
export const storageKey = 'sharomir.game.v1'
const finite = (n: unknown) => typeof n === 'number' && Number.isFinite(n)
const poseOK = (p: Pose) => p && [p.x, p.y, p.scale, p.angle].every(finite) && p.scale > 0
const codeOK = (code: unknown): code is Code => countries.some(([candidate]) => candidate === code)
const faceOK = (face: unknown): face is Face => typeof face === 'string' && Object.hasOwn(faces, face)
const itemOK = (item: unknown): item is Item => typeof item === 'string' && Object.hasOwn(items, item)
const personalityOK = (value: unknown): value is PersonalityId =>
  value === 'cheerful' || value === 'shy' || value === 'mischievous' || value === 'calm'

export function loadGame(): Game {
  try {
    const raw = JSON.parse(localStorage.getItem(storageKey) || 'null') as Partial<Game> | null
    if (!raw || raw.version !== 1 || !Array.isArray(raw.collection) || !Array.isArray(raw.actors)) return initialGame()
    const collection = raw.collection.filter((ball): ball is Ball =>
      !!ball && typeof ball.id === 'string' && codeOK(ball.code) && faceOK(ball.face) &&
      (!ball.personalityId || personalityOK(ball.personalityId)) && Array.isArray(ball.accessories) &&
      ball.accessories.every(part => poseOK(part) && typeof part.id === 'string' && itemOK(part.kind)))
      .map(ball => ({ ...ball, eyes: ball.eyes && Object.hasOwn(eyeStyles, ball.eyes) ? ball.eyes : undefined,
        mouth: ball.mouth && Object.hasOwn(mouthStyles, ball.mouth) ? ball.mouth : undefined }))
    const ids = new Set([...starterBalls, ...collection].map(ball => ball.id))
    return {
      version: 1,
      collection,
      actors: raw.actors.filter(actor =>
        poseOK(actor) && typeof actor.id === 'string' && typeof actor.ballId === 'string' && ids.has(actor.ballId)),
      voice: raw.voice !== false,
      sounds: raw.sounds !== false,
      music: raw.music ?? (raw.sounds !== false),
      backgroundId: backgrounds.includes(raw.backgroundId as BackgroundId) ? raw.backgroundId as BackgroundId : 'park',
    }
  } catch {
    return initialGame()
  }
}

/** Stage positions are fractions; accessory coordinates are local to a radius-62 ball. */
export function addToStage(game: Game, ball: Ball, fresh: boolean): Game {
  const collection = fresh
    ? [...game.collection.filter(saved => saved.id !== ball.id), ball]
    : game.collection
  const spots = [[.32, .62], [.68, .62], [.5, .42], [.18, .39], [.82, .4], [.5, .76], [.22, .8], [.78, .78]]
  const [x, y] = spots.find(([sx, sy]) => game.actors.every(actor => Math.hypot(actor.x - sx, actor.y - sy) > .14))
    ?? [.12 + .73 * ((game.actors.length * .618034) % 1), .30 + .48 * ((game.actors.length * .414214) % 1)]
  return { ...game, collection, actors: [...game.actors, makeActor(ball.id, x, y)] }
}
