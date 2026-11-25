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
  const cribX = Math.min(0, (width - left) / scale - 983)
  return { dx, dy, cribX, sky: hitBox(763, 123, 76, 74), lamp: hitBox(352 + dx, 357 + dy, 94, 108) }
}

export function BedroomArt({ night, lampOn, dx, dy, cribX }: Pick<BedroomLighting, 'night' | 'lampOn'> & { dx: number; dy: number; cribX: number }) {
  const file = './backgrounds/bedroom.svg#'
  // On a narrow screen the movable nightstand and its string of lights share a wall.
  const lightsX = Math.max(0, dx)
  const lightsY = -Math.min(88, lightsX * .45)
  return <svg className="bedroom-art" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
    <use href={file + 'walls'}/>
    <use href={file + (night ? 'moon-sky' : 'sun-sky')}/>
    <use href={file + 'garland'} x={lightsX} y={lightsY}/>
    <use href={file + 'floor-and-shelves'}/>
    <use href={file + 'crib'} x={cribX}/>
    <use href={file + 'furniture'}/>
    <use href={file + 'nightstand'} x={dx} y={dy}/>
    {night && <use href={file + 'night-shadows'}/>}
    <g transform={`translate(${cribX} 0)`}>
      <g className="bedroom-mobile">
        <use href={file + 'mobile-charms'} x="897" y="310" style={{filter: night && !lampOn ? 'brightness(.6)' : undefined}}/>
        {night && lampOn && <use href={file + 'mobile-glow'} x="897" y="310"/>}
      </g>
    </g>
    {night && lampOn && <>
      <use href={file + 'garland-glow'} x={lightsX} y={lightsY}/>
      <use href={file + 'lamp-glow'} x={dx} y={dy}/>
    </>}
  </svg>
}
