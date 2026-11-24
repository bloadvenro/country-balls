import { useId } from 'react'
import { accessoryArt, eyeArt, faceAccessoryShift, faceArt, faceX, glaze, mouthArt, isBehindProp } from './art'
import { type Ball } from './model'
import { useBallFlag } from './ballFlag'
import type { Eyes, Face, Item, Mouth } from './toys'


export function BallDrawing({ ball, look = 0, face }: { ball: Ball; look?: number; face?: Face }) {
  const flag = useBallFlag(ball.code)
  const clip = useId(), shade = useId()
  const x = faceX(1, look)
  const pieces = ball.accessories.map(a => <g key={a.id} transform={`translate(${a.x + faceAccessoryShift(a.kind, x)} ${a.y}) rotate(${a.angle}) scale(${a.scale})`} dangerouslySetInnerHTML={{ __html: accessoryArt[a.kind as Item] }}/>)
  return <>
    <defs><clipPath id={clip}><circle r="62"/></clipPath><radialGradient id={shade} cx=".36" cy=".24" r=".82"><stop offset=".58" stopColor="#292044" stopOpacity="0"/><stop offset="1" stopColor="#292044" stopOpacity=".16"/></radialGradient></defs>
    {pieces.filter((_, i) => isBehindProp(ball.accessories[i].kind as Item))}
    <circle r="62" fill="#fff"/>
    <g clipPath={`url(#${clip})`}><image href={flag?.url} width="124" height="124" x="-62" y="-62" preserveAspectRatio="none"/><circle r="62" fill={`url(#${shade})`}/></g>
    <g dangerouslySetInnerHTML={{ __html: glaze }}/>
    <g transform={`translate(${x} 0)`} dangerouslySetInnerHTML={{ __html: faceArt(face ?? ball.face, false, face ? undefined : ball.eyes, face ? undefined : ball.mouth) }}/>
    {pieces.filter((_, i) => !isBehindProp(ball.accessories[i].kind as Item))}
  </>
}

export function BallIcon({ ball }: { ball: Ball }) {
  return <svg viewBox="-99 -89 198 174" aria-hidden="true"><BallDrawing ball={ball}/></svg>
}
export function PropIcon({ kind }: { kind: Item }) {
  return <svg viewBox={kind === 'wings' ? '-104 -56 208 112' : '-60 -58 120 116'} aria-hidden="true"><g dangerouslySetInnerHTML={{ __html: accessoryArt[kind] }}/></svg>
}
export function FaceIcon({ face }: { face: Face }) {
  return <svg viewBox={face === 'queasy' ? '-48 -40 96 90' : '-48 -40 96 82'} aria-hidden="true"><ellipse rx="43" ry="36" fill="#ffdf97" stroke="#29263b" strokeWidth="2"/><g dangerouslySetInnerHTML={{ __html: faceArt(face) }}/></svg>
}

export function EyeIcon({ eyes }: { eyes: Eyes }) {
  return <svg viewBox={eyes === 'streams' ? '-42 -21 84 63' : '-42 -28 84 47'} aria-hidden="true"
    dangerouslySetInnerHTML={{ __html: eyeArt(eyes) }}/>
}

export function MouthIcon({ mouth }: { mouth: Mouth }) {
  const empty = '<circle r="9" fill="none" stroke="#aaa2b9"/><path d="m-6 6 12-12" stroke="#aaa2b9"/>'
  return <svg viewBox={mouth === 'greenDrip' ? '-25 -10 50 42' : '-25 -16 50 32'} aria-hidden="true"
    dangerouslySetInnerHTML={{ __html: mouth === 'none' ? empty : mouthArt(mouth) }}/>
}
