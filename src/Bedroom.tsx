export type BedroomLighting = {
  night: boolean
  lampOn: boolean
  toggleSky: () => void
  toggleLamp: () => void
}

export function bedroomLayout(width: number, height: number) {
  // Match xMidYMin slice. Keep the nightstand inside the crop on portrait screens.
  const scale = Math.max(width / 1440, height / 900)
  const left = (width - 1440 * scale) / 2
  const lampX = left + 352 * scale
  // Leave the lamp clear of the starting heroes on short landscape screens.
  const shortLandscape = height <= 500 && width > height
  const visibleX = Math.max(65 * scale, shortLandscape ? Math.min(lampX, width * .17) : lampX)
  const dx = (visibleX - lampX) / scale
  const dy = Math.min(Math.max(0, dx / 2), 70)
  const hitBox = (cx: number, cy: number, w: number, h: number) => {
    const hitWidth = Math.max(44, w * scale), hitHeight = Math.max(44, h * scale)
    return { x: left + cx * scale - hitWidth / 2, y: cy * scale - hitHeight / 2, width: hitWidth, height: hitHeight }
  }
  return { dx, dy, sky: hitBox(763, 123, 76, 74), lamp: hitBox(352 + dx, 357 + dy, 94, 108) }
}

export function BedroomArt({ night, lampOn, dx, dy }: Pick<BedroomLighting, 'night' | 'lampOn'> & { dx: number; dy: number }) {
  const file = './backgrounds/bedroom.svg#'
  return <svg className="bedroom-art" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
    <use href={file + 'walls'}/>
    <use href={file + (night ? 'moon-sky' : 'sun-sky')}/>
    <use href={file + 'furniture'}/>
    <g className="bedroom-mobile"><use href={file + 'mobile-charms'} x="897" y="310"/></g>
    <use href={file + 'nightstand'} x={dx} y={dy}/>
    {night && <use href={file + 'night-shadows'}/>}
    {night && lampOn && <use href={file + 'lamp-glow'} x={dx} y={dy}/>}
  </svg>
}
