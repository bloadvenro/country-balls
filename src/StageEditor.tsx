import { useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { Check, Eye, Flag, FlipHorizontal2, Minus, Plus, RotateCw, Shirt, Smile, Sparkles, Trash2 } from 'lucide-react'
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
type Point = { x: number; y: number }
const gap = 10

function positionDialog(element: HTMLDialogElement, bounds: DOMRect, position: Point, width: number, height: number) {
  const x = clamp(position.x, gap, bounds.width - gap - width)
  const y = clamp(position.y, gap, bounds.height - gap - height)
  element.style.left = bounds.left + x + 'px'
  element.style.top = bounds.top + y + 'px'
  return { x, y }
}

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
  flip: () => void
  flipLabel: string
  resize: (step: number) => void
}

export function StageEditor({ actor, ball, mood, canPair, close, toggleItem, chooseFeature, chooseFlag, chooseMood, run, remove, rotate, flip, flipLabel, resize }: Props) {
  const [tab, setTab] = useState<Tab>('outfits')
  const dialog = useRef<HTMLDialogElement>(null)
  const pressedBackdrop = useRef(false)
  const manualPosition = useRef<Point | null>(null)
  const drag = useRef<{ pointer: number; start: Point; offset: Point } | null>(null)
  const dragged = useRef(false)
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
      const radius = 62 * scale
      const right = width - cx - radius - 2 * gap, left = cx - radius - 2 * gap
      let menuWidth = Math.min(354, width - 2 * gap), menuHeight = Math.min(484, height - 2 * gap)
      let x = cx - menuWidth / 2, y = cy - menuHeight * .55
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
      element.style.width = menuWidth + 'px'
      element.style.height = menuHeight + 'px'
      const position = positionDialog(element, bounds, manualPosition.current ?? { x, y }, menuWidth, menuHeight)
      if (manualPosition.current) manualPosition.current = position
    }
    place()
    const observer = new ResizeObserver(place)
    observer.observe(page)
    return () => observer.disconnect()
  }, [actor.x, actor.y, actor.scale])

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0 || drag.current) return
    const box = dialog.current!.getBoundingClientRect()
    drag.current = {
      pointer: event.pointerId, start: { x: event.clientX, y: event.clientY },
      offset: { x: event.clientX - box.left, y: event.clientY - box.top },
    }
    dragged.current = false
    // A stationary press still belongs to the tab beneath the finger.
    const target = (event.target as Element).closest('button') ?? event.currentTarget
    target.setPointerCapture(event.pointerId)
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const gesture = drag.current
    if (!gesture || gesture.pointer !== event.pointerId) return
    if (!dragged.current && Math.hypot(event.clientX - gesture.start.x, event.clientY - gesture.start.y) < 6) return
    dragged.current = true
    const element = dialog.current!
    const bounds = element.closest('main')!.getBoundingClientRect()
    manualPosition.current = positionDialog(element, bounds, {
      x: event.clientX - gesture.offset.x - bounds.left, y: event.clientY - gesture.offset.y - bounds.top,
    }, element.offsetWidth, element.offsetHeight)
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.pointer === event.pointerId) drag.current = null
  }

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
    <div className="stage-editor-tabs" role="group" aria-label="Разделы редактора"
      aria-description="Потяни за эту полоску, чтобы передвинуть редактор"
      onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={finishDrag}
      onPointerCancel={finishDrag} onLostPointerCapture={finishDrag}
      onContextMenu={event => event.preventDefault()}
      onClickCapture={event => {
        if (dragged.current && event.detail > 0) event.stopPropagation()
        dragged.current = false
      }}>
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
      <button aria-label={flipLabel} title={flipLabel} onClick={flip}><FlipHorizontal2/></button>
      <button aria-label="Увеличить шарика" title="Увеличить" disabled={actor.scale >= actorScaleLimits[1]} onClick={() => resize(.15)}><Plus/></button>
      <button aria-label="Уменьшить шарика" title="Уменьшить" disabled={actor.scale <= actorScaleLimits[0]} onClick={() => resize(-.15)}><Minus/></button>
    </footer>
  </dialog>
}
