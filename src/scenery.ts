import { clamp, type BackgroundId, type SceneryFlag } from './model'

const kitchenPivots = { oven: [415, 320], sink: [852, 311], fridge: [1170, 492] } as const
type KitchenUnit = keyof typeof kitchenPivots

type Target = {
  unit?: KitchenUnit
  key: SceneryFlag
  label: string
  cx: number
  cy: number
  w: number
  h: number
}

const targets: Partial<Record<BackgroundId, Target[]>> = {
  park: [{ key: 'night', label: 'Небо в парке', cx: 1160, cy: 145, w: 145, h: 145 }],
  playground: [{ key: 'night', label: 'Небо над аттракционами', cx: 205, cy: 145, w: 138, h: 138 }],
  beach: [{ key: 'night', label: 'Небо над пляжем', cx: 958, cy: 119, w: 102, h: 102 }],
  ice: [{ key: 'night', label: 'Небо в Ледяной бухте', cx: 866, cy: 276, w: 104, h: 104 }],
  maternity: [
    { key: 'night', label: 'Небо за окном палаты', cx: 1120, cy: 153, w: 87, h: 87 },
    { key: 'doorOpen', label: 'Дверь в коридор', cx: 143, cy: 336, w: 182, h: 348 },
    { key: 'tapRunning', label: 'Кран в палате', cx: 289, cy: 386, w: 65, h: 64 },
  ],
  kitchen: [
    { unit: 'oven', key: 'ovenOpen', label: 'Духовка', cx: 415, cy: 418, w: 222, h: 174 },
    { unit: 'fridge', key: 'fridgeOpen', label: 'Холодильник', cx: 1179, cy: 300, w: 203, h: 384 },
    { unit: 'sink', key: 'night', label: 'Окно кухни', cx: 852, cy: 132, w: 208, h: 169 },
    { unit: 'sink', key: 'tapRunning', label: 'Кухонный кран', cx: 866, cy: 281, w: 62, h: 69 },
  ],
  apartment: [
    { key: 'night', label: 'Окно гостиной', cx: 473, cy: 182, w: 456, h: 256 },
    { key: 'lampOff', label: 'Ночник в гостиной', cx: 280, cy: 337, w: 82, h: 60 },
    { key: 'tvOff', label: 'Телевизор', cx: 489, cy: 351, w: 160, h: 92 },
  ],
  bathroom: [
    { key: 'showerRunning', label: 'Душ', cx: 627, cy: 246, w: 87, h: 67 },
    { key: 'tapRunning', label: 'Кран у раковины', cx: 342, cy: 299, w: 61, h: 61 },
  ],
  ocean: [{ key: 'chestClosed', label: 'Сундук с сокровищами', cx: 718, cy: 646, w: 135, h: 110 }],
}

// Keep the doorway, basin and window on the visible stretch of wall. On a
// phone the window sits higher than the wash station so both still fit.
function wardFixtures(width: number, scale: number) {
  const wall = width / scale
  const size = clamp((wall - 100) / 960, .66, 1)
  const left = (1440 - wall) / 2
  const washX = Math.max(45 * (1 - size), left + 10 / scale - 45 * size)
  const washY = 510 * (1 - size)
  const windowX = Math.min(1120 * (1 - size), left + wall - 102 / scale - 1164 * size)
  const windowY = 85 * (1 - size)
  const washRight = washX + 334 * size, windowLeft = windowX + 880 * size
  const decorSize = clamp((windowLeft - washRight + 54) / 510, 0, 1)
  const decorX = clamp(0, washRight - 334 * decorSize, windowLeft - 780 * decorSize)
  const matrix = (s: number, x: number, y: number) => `matrix(${s},0,0,${s},${x},${y})`
  return {
    size, washX, washY, windowX, windowY,
    style: {
      '--ward-wash': matrix(size, washX, washY),
      '--ward-window': matrix(size, windowX, windowY),
      '--ward-decor': matrix(decorSize, decorX, 76 * (1 - decorSize)),
      '--ward-decor-display': decorSize < .36 ? 'none' : 'inline',
      '--ward-monitor': decorSize < .36
        ? matrix(.7 * size, washX + (252 - 449 * .7) * size, washY + (225 - 224 * .7) * size)
        : matrix(decorSize, decorX, 76 * (1 - decorSize)),
    },
  }
}

// Use one camera for the painting and its touch targets. Keep windows, taps
// and the chest in the crop when a tablet rotates or the viewport is narrow.
export function sceneryLayout(scene: BackgroundId, width: number, height: number) {
  const scale = Math.max(width / 1440, height / 900)
  // Slide the basin and its mirror along the wall to fit beside the shower.
  const basinX = scene === 'bathroom' ? clamp(408 - (width - 108) / scale, 0, 110) : 0
  // On a narrow wall bring the kitchen fixtures together, scaling about the
  // countertop or floor line. The same matrix places the drawing and its target.
  const wallWidth = (width - 20) / scale
  const kitchenSize = clamp(wallWidth / 590, .4, 1)
  const kitchenSpacing = clamp((wallWidth - 201 * kitchenSize) / 755, .14, 1)
  const sceneStyle: Record<string, string> = {}
  const ward = scene === 'maternity' ? wardFixtures(width, scale) : null
  // Keep the sun in the visible part of the living-room window beside the lamp.
  const livingSunX = scene === 'apartment' ? clamp((width - 108) / scale - 374, -212, 0) : 0
  if (livingSunX) sceneStyle['--living-sun-x'] = livingSunX + 'px'
  const objects = (targets[scene] ?? []).map(object => {
    if (ward) {
      const sky = object.key === 'night'
      return { ...object, cx: object.cx * ward.size + (sky ? ward.windowX : ward.washX),
        cy: object.cy * ward.size + (sky ? ward.windowY : ward.washY), w: object.w * ward.size, h: object.h * ward.size }
    }
    if (object.unit) {
      const [x, y] = kitchenPivots[object.unit]
      // In short landscape the first starting hero otherwise covers the oven door.
      const offset = object.unit === 'oven' && width > height && height <= 500 ? -165 : 0
      const dx = 780 + (x - 780) * kitchenSpacing - x * kitchenSize + offset
      const dy = y * (1 - kitchenSize)
      sceneStyle['--kitchen-' + object.unit] = `matrix(${kitchenSize},0,0,${kitchenSize},${dx},${dy})`
      return { ...object, cx: object.cx * kitchenSize + dx, cy: object.cy * kitchenSize + dy,
        w: object.w * kitchenSize, h: object.h * kitchenSize }
    }
    if (basinX && object.key === 'tapRunning') return { ...object, cx: object.cx + basinX }
    return object
  })
  const artWidth = 1440 * scale, artHeight = 900 * scale
  let left = (width - artWidth) / 2, top = (height - artHeight) / 2
  // Keep the beacon above the horizon and below the top bar on a wide, short screen.
  if (scene === 'beach') top = Math.max(top, Math.min(0, 78 - 161 * scale))
  const looseSun = scene === 'beach' || scene === 'park' || scene === 'playground' || scene === 'ice'
  let sunX = 0, sunY = 0
  if (objects.length) {
    const anchors = objects.map(object => {
      // Frame the sun inside each window, while the whole pane responds to touch.
      if (object.key === 'night' && scene === 'apartment') return { x: 582 + livingSunX, y: 128, rx: 31 }
      if (object.key === 'night' && object.unit === 'sink') return { x: object.cx + 42 * kitchenSize, y: object.cy - 33 * kitchenSize, rx: 23 * kitchenSize }
      return { x: object.cx, y: object.cy, rx: object.w / 2 }
    })
    // The living room screen sits directly above a starting hero in landscape.
    const topLimit = scene === 'apartment' && height <= 500 ? 22 : Math.min(80, height * .22)
    const bottomLimit = height - Math.min(105, height * .25)
    const minTop = Math.max(...anchors.map(p => topLimit - p.y * scale))
    const maxTop = Math.min(...anchors.map(p => bottomLimit - p.y * scale))
    const framedTop = clamp(top, minTop, maxTop)
    if (looseSun) sunY = (framedTop - top) / scale
    else top = clamp(framedTop, height - artHeight, 0)

    const minLeft = Math.max(...anchors.map(p => 8 + p.rx * scale - p.x * scale))
    const maxLeft = Math.min(...anchors.map(p => {
      const nearMenu = top + (p.y + sunY) * scale - p.rx * scale < 236
      const rightMargin = nearMenu ? 100 : 8
      return width - rightMargin - (p.x + p.rx) * scale
    }))
    const framedLeft = minLeft <= maxLeft ? clamp(left, minLeft, maxLeft) : (minLeft + maxLeft) / 2
    if (looseSun) sunX = (framedLeft - left) / scale
    else left = clamp(framedLeft, width - artWidth, 0)
  }

  const switches = objects.map(({ key, label, cx, cy, w, h }) => {
    const hitWidth = Math.max(44, w * scale), hitHeight = Math.max(44, h * scale)
    const x = left + (cx + sunX) * scale - hitWidth / 2
    const y = top + (cy + sunY) * scale - hitHeight / 2
    // Keep the focus ring and keyboard button inside the visible canvas.
    const box = { x: Math.max(0, x), y: Math.max(0, y),
      width: Math.min(width, x + hitWidth) - Math.max(0, x), height: Math.min(height, y + hitHeight) - Math.max(0, y) }
    return { key, label, box }
  })
  if (scene === 'beach') sceneStyle['--beach-headland-x'] = Math.max(0, -left / scale - 135) + 'px'
  return { frame: { left, top, width: artWidth, height: artHeight, ...sceneStyle, ...ward?.style }, sunX, sunY, basinX, switches }
}
