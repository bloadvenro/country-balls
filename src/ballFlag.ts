import { useEffect, useState } from 'react'
import { flagOf, type Code } from './countries'

type BallFlag = { canvas: HTMLCanvasElement; url: string }
const cache = new Map<Code, Promise<BallFlag>>()

// Project the flat flag onto the front of the sphere. The central meridian
// curves down slightly, so horizontal stripes follow the volume of the ball.
function drawFlag(image: HTMLImageElement, code: Code): BallFlag {
  const canvas = document.createElement('canvas')
  const size = 384
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const texture = document.createElement('canvas')
  texture.width = 512
  texture.height = 384
  texture.getContext('2d')!.drawImage(image, 0, 0, texture.width, texture.height)
  // Keep emblems at the source aspect ratio. Extend the flag's edge colours
  // to cover the sphere, and bend the fabric only near its outer rim.
  const canton = code === 'cn' || code === 'us' || code === 'by'
  const height = size * (canton ? .76 : .86)
  const width = height * texture.width / texture.height
  const left = (size - width) / 2 + (canton ? size * .11 : 0)
  const top = (size - height) / 2
  for (let x = 0; x < size; x++) {
    const nx = (x + .5) / size * 2 - 1
    const sourceX = Math.max(0, Math.min(texture.width - 1, (x - left) / width * texture.width))
    const y = Math.round(top - size * .045 * nx ** 4)
    ctx.drawImage(texture, sourceX, 0, 1, 1, x, 0, 1, y + 1)
    ctx.drawImage(texture, sourceX, texture.height - 1, 1, 1, x, y + height - 1, 1, size - y - height + 1)
    ctx.drawImage(texture, sourceX, 0, 1, texture.height, x, y, 1, height)
  }
  return { canvas, url: canvas.toDataURL() }
}

export function useBallFlag(code: Code) {
  const [result, setResult] = useState<{ code: Code; flag: BallFlag }>()
  useEffect(() => {
    let active = true
    let pending = cache.get(code)
    if (!pending) {
      const image = new Image()
      image.src = flagOf(code)
      pending = image.decode().then(() => drawFlag(image, code))
      cache.set(code, pending)
    }
    pending.then(flag => { if (active) setResult({ code, flag }) })
      .catch(() => { if (cache.get(code) === pending) cache.delete(code) })
    return () => { active = false }
  }, [code])
  return result?.code === code ? result.flag : undefined
}
