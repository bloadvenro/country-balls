import {
  countries, favoriteCodes, flagOf, nameOf, type Code,
} from './countries'
import {
  eyeStyles, mouthStyles, type Eyes, type Mouth, faces, itemAnchor, items, type Face, type Item,
} from './toys'

export { countries, favoriteCodes, faces, flagOf, items, nameOf, type Code, type Face, type Item }

export const backgrounds = ['park', 'playground', 'party', 'space', 'ocean', 'ice', 'apartment', 'kitchen', 'bathroom', 'bedroom', 'maternity'] as const
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
  bedroomNight: boolean
  bedroomLampOn: boolean
}

export const id = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
export const actorScaleLimits = [.4, 1.6] as const
export function accessory(kind: Item): Accessory {
  const [x, y] = itemAnchor(kind)
  return { id: id(), kind, x, y, scale: 1, angle: 0 }
}
export const newBall = (code: Code = favoriteCodes[0] ?? countries[0][0]): Ball => ({
  id: id(), code, face: 'smile', eyes: 'classic', mouth: 'none', accessories: [], personalityId: 'cheerful',
})
const starterBalls: Ball[] = [
  { id: 'friend-jp', code: 'jp' as Code, face: 'smile' as Face, accessories: [], personalityId: 'cheerful' },
  { id: 'friend-br', code: 'br' as Code, face: 'laugh' as Face, accessories: [], personalityId: 'mischievous' },
]
export const makeActor = (ballId: string, x: number, y: number): Actor =>
  ({ id: id(), ballId, x, y, scale: 1, angle: 0 })
export function initialGame(): Game {
  return {
    version: 1, collection: [...starterBalls],
    actors: [makeActor('friend-jp', .32, .62), makeActor('friend-br', .68, .62)],
    voice: true, sounds: true, music: true, backgroundId: 'park',
    bedroomNight: true, bedroomLampOn: true,
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

// Keep one record per design. Older installations can still write a whole v1
// scene, but cannot remove a design created or edited by the updated game.
export const ballKeyPrefix = 'sharomir.ball.v1.'

function parseRecord(value: string | null) {
  try { return value ? JSON.parse(value) : null } catch { return null }
}

function restoreBall(raw: Partial<Ball> | null): Ball | undefined {
  if (!raw || typeof raw.id !== 'string' || !codeOK(raw.code)) return
  return {
    ...raw, id: raw.id, code: raw.code, face: faceOK(raw.face) ? raw.face : 'smile',
    personalityId: personalityOK(raw.personalityId) ? raw.personalityId : undefined,
    eyes: raw.eyes && Object.hasOwn(eyeStyles, raw.eyes) ? raw.eyes : undefined,
    mouth: raw.mouth && Object.hasOwn(mouthStyles, raw.mouth) ? raw.mouth : undefined,
    accessories: Array.isArray(raw.accessories) ? raw.accessories.filter(part =>
      poseOK(part) && typeof part.id === 'string' && itemOK(part.kind)) : [],
  }
}

export function loadGame(fallback: Game): Game {
  const raw = parseRecord(localStorage.getItem(storageKey)) as Partial<Game> | null
  const old = raw?.version === 1 ? raw : fallback
  const balls = new Map(starterBalls.map(ball => [ball.id, ball]))
  for (const record of Array.isArray(old.collection) ? old.collection : []) {
    const ball = restoreBall(record)
    if (ball) balls.set(ball.id, ball)
  }
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(ballKeyPrefix)) continue
    const ball = restoreBall(parseRecord(localStorage.getItem(key)))
    if (ball && key === ballKeyPrefix + ball.id) balls.set(ball.id, ball)
  }
  const actors: Actor[] = []
  for (const actor of Array.isArray(old.actors) ? old.actors : []) {
    if (!poseOK(actor) || typeof actor.id !== 'string' || typeof actor.ballId !== 'string') continue
    if (!balls.has(actor.ballId)) {
      // Named friends carry a country code. A random design ID alone has no flag to recover.
      const code = actor.ballId.startsWith('friend-') ? actor.ballId.slice('friend-'.length) : undefined
      if (!codeOK(code)) continue
      balls.set(actor.ballId, { id: actor.ballId, code, face: 'smile', accessories: [] })
    }
    actors.push(actor)
  }
  return {
    version: 1, collection: [...balls.values()], actors,
    voice: old.voice !== false, sounds: old.sounds !== false,
    music: old.music ?? (old.sounds !== false),
    backgroundId: backgrounds.includes(old.backgroundId as BackgroundId) ? old.backgroundId as BackgroundId : 'park',
    bedroomNight: old.bedroomNight !== false, bedroomLampOn: old.bedroomLampOn !== false,
  }
}

export function rememberBalls(balls: Ball[], previous: Ball[]) {
  const previousById = new Map(previous.map(ball => [ball.id, ball]))
  for (const ball of balls) {
    const key = ballKeyPrefix + ball.id
    if (previousById.get(ball.id) !== ball || localStorage.getItem(key) === null) {
      localStorage.setItem(key, JSON.stringify(ball))
    }
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
