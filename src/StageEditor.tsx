import { useLayoutEffect, useRef, useState } from 'react'
import { Check, Eye, Flag, Minus, Plus, RotateCw, Shirt, Smile, Sparkles, Trash2, X } from 'lucide-react'
import { actions, type ActionId } from './actions'
import { EyeIcon, FaceIcon, MouthIcon, PropIcon } from './Illustrations'
import { actorScaleLimits, clamp, countries, faces, flagOf, items, nameOf, type Actor, type Ball, type Code, type Face, type Item } from './model'
import { expressions, eyeStyles, mouthStyles, type Eyes, type Mouth } from './toys'
import './stage-editor.css'

const tabs = [
  ['outfits', 'Наряды', Shirt], ['features', 'Глаза и рот', Eye], ['flags', 'Флаги', Flag],
  ['moods', 'Мордочки', Smile], ['actions', 'Действия', Sparkles],
] as const
type Tab = typeof tabs[number][0]
type Props = {
  actor: Actor
  ball: Ball
  mood?: Face
  canPair: boolean
  close: () => void
  toggleItem: (kind: Item) => void
  chooseFeature: (patch: Pick<Ball, 'eyes' | 'mouth'>) => void
  chooseFlag: (code: Code) => void
  chooseMood: (face: Face) => void
  run: (action: ActionId) => void
  remove: () => void
  rotate: () => void
  resize: (step: number) => void
}

export function StageEditor({ actor, ball, mood, canPair, close, toggleItem, chooseFeature, chooseFlag, chooseMood, run, remove, rotate, resize }: Props) {
  const [tab, setTab] = useState<Tab>('outfits')
  const dialog = useRef<HTMLDialogElement>(null)
  const pressedBackdrop = useRef(false)
  const shown = mood ? expressions[mood] : {
    eyes: ball.eyes ?? expressions[ball.face].eyes, mouth: ball.mouth ?? expressions[ball.face].mouth,
  }
  const worn = new Set(ball.accessories.map(part => part.kind))
  const orderedItems = (Object.keys(items) as Item[]).sort((a, b) => Number(worn.has(b)) - Number(worn.has(a)))

  useLayoutEffect(() => {
    const element = dialog.current!
    element.showModal()
    return () => element.close()
  }, [])
  useLayoutEffect(() => {
    const element = dialog.current!
    const page = element.closest('main')!
    function place() {
      const bounds = page.getBoundingClientRect()
      const { width, height } = bounds
      const scale = Math.min(width / 580, height / 330, 1.35) * actor.scale
      const edgeX = Math.min(width * .45, 64 * scale + 2), edgeY = Math.min(height * .45, 70 * scale)
      const cx = clamp(actor.x * width, edgeX, width - edgeX), cy = clamp(actor.y * height, edgeY, height - edgeY)
      const gap = 10, radius = 62 * scale
      const right = width - cx - radius - 2 * gap, left = cx - radius - 2 * gap
      let menuWidth = Math.min(354, width - 2 * gap), menuHeight = Math.min(432, height - 2 * gap)
      let x = cx - menuWidth / 2, y = cy - menuHeight / 2
      if (right >= 266 || left >= 266) {
        const onRight = right >= 266
        menuWidth = Math.min(menuWidth, onRight ? right : left)
        x = onRight ? cx + radius + gap : cx - radius - gap - menuWidth
      } else {
        const above = cy - radius - 2 * gap, below = height - cy - radius - 2 * gap
        const room = Math.max(above, below)
        if (room >= 220) menuHeight = Math.min(menuHeight, room)
        y = above >= below ? cy - radius - gap - menuHeight : cy + radius + gap
      }
      Object.assign(element.style, {
        width: menuWidth + 'px', height: menuHeight + 'px',
        left: bounds.left + clamp(x, gap, width - gap - menuWidth) + 'px',
        top: bounds.top + clamp(y, gap, height - gap - menuHeight) + 'px',
      })
    }
    place()
    const observer = new ResizeObserver(place)
    observer.observe(page)
    return () => observer.disconnect()
  }, [actor.x, actor.y, actor.scale])

  return <dialog ref={dialog} className="stage-editor" aria-label={'Быстрый редактор: ' + nameOf(ball.code)}
    onCancel={event => { event.preventDefault(); close() }}
    onPointerDown={event => { pressedBackdrop.current = event.target === event.currentTarget }}
    onClick={event => {
      const backdrop = pressedBackdrop.current
      pressedBackdrop.current = false
      if (!backdrop || event.target !== event.currentTarget) return
      const box = event.currentTarget.getBoundingClientRect()
      if (event.clientX < box.left || event.clientX >= box.right || event.clientY < box.top || event.clientY >= box.bottom) close()
    }}>
    <header className="stage-editor-head">
      <img src={flagOf(ball.code)} alt=""/><strong>{nameOf(ball.code)}</strong>
      <button aria-label="Закрыть редактор" title="Закрыть" onClick={close}><X/></button>
    </header>
    <div className="stage-editor-tabs" role="group" aria-label="Разделы редактора">
      {tabs.map(([key, label, Icon]) => <button key={key} aria-pressed={tab === key} onClick={() => setTab(key)}>
        <Icon/><span>{label}</span>
      </button>)}
    </div>
    <div key={tab} className="stage-editor-scroll">
      {tab === 'outfits' && <div className="stage-editor-grid">{orderedItems.map(kind =>
        <button key={kind} aria-pressed={worn.has(kind)} disabled={!worn.has(kind) && ball.accessories.length >= 20} onClick={() => toggleItem(kind)}>
          <PropIcon kind={kind}/><span>{items[kind]}</span>{worn.has(kind) && <Check className="outfit-check" aria-hidden="true"/>}
        </button>)}</div>}
      {tab === 'features' && <>
        <h3>Глаза</h3><div className="stage-editor-grid">{(Object.keys(eyeStyles) as Eyes[]).map(eyes =>
          <button key={eyes} aria-pressed={shown.eyes === eyes} onClick={() => chooseFeature({eyes})}>
            <EyeIcon eyes={eyes}/><span>{eyeStyles[eyes]}</span>
          </button>)}</div>
        <h3>Рот</h3><div className="stage-editor-grid">{(Object.keys(mouthStyles) as Mouth[]).map(mouth =>
          <button key={mouth} aria-pressed={shown.mouth === mouth} onClick={() => chooseFeature({mouth})}>
            <MouthIcon mouth={mouth}/><span>{mouthStyles[mouth]}</span>
          </button>)}</div>
      </>}
      {tab === 'flags' && <div className="stage-editor-grid">{countries.map(([code, label]) =>
        <button key={code} aria-pressed={ball.code === code} onClick={() => chooseFlag(code)}>
          <img src={flagOf(code)} alt="" loading="lazy"/><span>{label}</span>
        </button>)}</div>}
      {tab === 'moods' && <div className="stage-editor-grid">{(Object.keys(faces) as Face[]).map(face =>
        <button key={face} aria-pressed={(mood ?? ball.face) === face} onClick={() => chooseMood(face)}>
          <FaceIcon face={face}/><span>{faces[face]}</span>
        </button>)}</div>}
      {tab === 'actions' && <div className="stage-editor-grid stage-editor-actions">{(Object.keys(actions) as ActionId[]).map(key => {
        const action = actions[key], Icon = action.icon
        return <button key={key} disabled={action.kind === 'pair' && !canPair} onClick={() => run(key)}>
          <Icon/><span>{action.label}</span>
        </button>
      })}</div>}
    </div>
    <footer className="stage-editor-tools">
      <button className="stage-remove" aria-label="Убрать шарика со сцены" title="Убрать со сцены" onClick={remove}><Trash2/></button>
      <button aria-label="Повернуть шарика" title="Повернуть" onClick={rotate}><RotateCw/></button>
      <button aria-label="Увеличить шарика" title="Увеличить" disabled={actor.scale >= actorScaleLimits[1]} onClick={() => resize(.15)}><Plus/></button>
      <button aria-label="Уменьшить шарика" title="Уменьшить" disabled={actor.scale <= actorScaleLimits[0]} onClick={() => resize(-.15)}><Minus/></button>
    </footer>
  </dialog>
}
