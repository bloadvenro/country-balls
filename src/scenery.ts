import { clamp, type BackgroundId, type SceneryFlag } from './model'

type Target = {
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
  ice: [{ key: 'night', label: 'Небо в Ледяной бухте', cx: 866, cy: 276, w: 104, h: 104 }],
  maternity: [{ key: 'night', label: 'Небо за окном палаты', cx: 1120, cy: 153, w: 87, h: 87 }],
  kitchen: [
    { key: 'night', label: 'Окно кухни', cx: 852, cy: 132, w: 208, h: 169 },
    { key: 'tapRunning', label: 'Кухонный кран', cx: 866, cy: 281, w: 62, h: 69 },
  ],
  apartment: [
    { key: 'night', label: 'Окно гостиной', cx: 473, cy: 182, w: 456, h: 256 },
    { key: 'tvOff', label: 'Телевизор', cx: 489, cy: 351, w: 160, h: 92 },
  ],
  bathroom: [
    { key: 'showerRunning', label: 'Душ', cx: 627, cy: 246, w: 87, h: 67 },
    { key: 'tapRunning', label: 'Кран у раковины', cx: 342, cy: 299, w: 61, h: 61 },
  ],
  ocean: [{ key: 'chestClosed', label: 'Сундук с сокровищами', cx: 718, cy: 646, w: 135, h: 110 }],
}

// Use one camera for the painting and its touch targets. Keep windows, taps
// and the chest in the crop when a tablet rotates or the viewport is narrow.
export function sceneryLayout(scene: BackgroundId, width: number, height: number) {
  const scale = Math.max(width / 1440, height / 900)
  // Slide the basin and its mirror along the wall to fit beside the shower.
  const basinX = scene === 'bathroom' ? clamp(408 - (width - 108) / scale, 0, 110) : 0
  const objects = (targets[scene] ?? []).map(object => basinX && object.key === 'tapRunning'
    ? { ...object, cx: object.cx + basinX } : object)
  const artWidth = 1440 * scale, artHeight = 900 * scale
  let left = (width - artWidth) / 2, top = (height - artHeight) / 2
  const looseSun = scene === 'park' || scene === 'playground' || scene === 'ice'
  let sunX = 0, sunY = 0
  if (objects.length) {
    const anchors = objects.map(object => {
      // Frame the sun inside each window, while the whole pane responds to touch.
      if (object.key === 'night' && scene === 'apartment') return { x: 582, y: 128, rx: 31 }
      if (object.key === 'night' && scene === 'kitchen') return { x: 894, y: 99, rx: 23 }
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
  return { frame: { left, top, width: artWidth, height: artHeight }, sunX, sunY, basinX, switches }
}
