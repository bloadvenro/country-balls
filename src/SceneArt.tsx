import { memo } from 'react'
import type { BackgroundId } from './model'
import './scene-motion.css'

// Inline the same local illustrations used for the picker so CSS can animate
// individual objects on stage and follow the device's motion preference.
const drawings = import.meta.glob<string>(['../public/backgrounds/*.svg', '!../public/backgrounds/bedroom.svg'], {
  eager: true, import: 'default', query: '?raw',
})

export const SceneArt = memo(function SceneArt({ scene }: { scene: BackgroundId }) {
  const svg = drawings[`../public/backgrounds/${scene}.svg`]
  return <div className="scene-art" aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }}/>
})
