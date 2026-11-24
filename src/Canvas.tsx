import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Konva from 'konva'
import { Circle, Ellipse, Group, Image as KImage, Layer, Line, Rect, Stage } from 'react-konva'
import { actions, type Action, type Performance } from './actions'
import { accessoryArt, faceAccessoryShift, faceArt, faceX, glaze, isBehindProp, svgUri } from './art'
import { useBallFlag } from './ballFlag'
import { clamp, type Accessory, type Actor, type Ball } from './model'
import type { Face } from './toys'

// A second finger must be able to hit another actor while the first actor is moving.
Konva.hitOnDragEnabled = true

type PinchTarget = { scale: number; angle: number }
function usePinch(container: React.RefObject<HTMLDivElement|null>, stage: React.RefObject<Konva.Stage|null>,
  find: (id:string)=>PinchTarget|undefined, select: (id:string)=>void,
  apply: (id:string, patch:PinchTarget)=>void, limits: [number,number]) {
  const latest = useRef({find,select,apply,limits})
  latest.current = {find,select,apply,limits}
  useEffect(() => {
    const el = container.current!
    let gesture: { id:string; base:PinchTarget; dist:number; angle:number } | null = null
    let suppress = false
    const geometry = (a:Touch,b:Touch) => ({dist:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),angle:Math.atan2(b.clientY-a.clientY,b.clientX-a.clientX)*180/Math.PI})
    const block = (e:TouchEvent) => { if (e.cancelable) e.preventDefault(); e.stopPropagation() }
    const start = (e:TouchEvent) => {
      if (e.touches.length !== 2 || !stage.current) return
      const [a,b] = Array.from(e.touches), rect = el.getBoundingClientRect()
      const hit = (t:Touch) => stage.current!.getIntersection({x:t.clientX-rect.left,y:t.clientY-rect.top})?.findAncestor('.gesture-object',true)
      const first = hit(a), second = hit(b)
      if (!first || first !== second) return
      const base = latest.current.find(first.id()), g = geometry(a,b)
      if (!base || g.dist < 4) return
      if (first.isDragging()) first.stopDrag()
      latest.current.select(first.id()); gesture = {id:first.id(),base:{...base},...g}; suppress=true; block(e)
    }
    const move = (e:TouchEvent) => {
      if (!suppress) return
      block(e)
      if (!gesture || e.touches.length!==2) return
      const g = geometry(e.touches[0],e.touches[1]), {id,base,dist,angle} = gesture
      latest.current.apply(id,{scale:clamp(base.scale*g.dist/dist,...latest.current.limits),angle:base.angle+g.angle-angle})
    }
    const end = (e:TouchEvent) => {
      if (!suppress) return
      gesture=null
      if (e.touches.length) block(e)
      else suppress=false
    }
    const opts = {capture:true,passive:false}
    el.addEventListener('touchstart',start,opts); el.addEventListener('touchmove',move,opts)
    el.addEventListener('touchend',end,opts); el.addEventListener('touchcancel',end,opts)
    return () => { el.removeEventListener('touchstart',start,true); el.removeEventListener('touchmove',move,true); el.removeEventListener('touchend',end,true); el.removeEventListener('touchcancel',end,true) }
  },[container,stage])
}

const bitmaps = new Map<string, HTMLImageElement>()
function useBitmap(src: string) {
  const [, ready] = useState(0)
  useEffect(() => {
    let image = bitmaps.get(src)
    if (!image) { image = new Image(); bitmaps.set(src, image); image.src = src }
    const redraw = () => ready(v => v + 1)
    if (image.complete) redraw()
    else image.addEventListener('load', redraw)
    return () => image.removeEventListener('load', redraw)
  }, [src])
  const img = bitmaps.get(src)
  return img?.naturalWidth ? img : undefined
}
function useFrame() {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 1, height: 1 })
  useLayoutEffect(() => {
    const el = ref.current!
    const measure = () => setSize({ width: el.clientWidth, height: el.clientHeight })
    measure(); const observer = new ResizeObserver(measure); observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return { ref, ...size }
}
function useReducedMotion() {
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => setReduced(query.matches)
    query.addEventListener('change', change)
    return () => query.removeEventListener('change', change)
  }, [])
  return reduced
}

type Editing = { selected: string | null; select: (id: string) => void; move: (id: string, x: number, y: number) => void; startPinch: (id:string)=>void; transform:(id:string,p:PinchTarget)=>void }
function Prop({ a, editing }: { a: Accessory; editing?: Editing }) {
  const wings = a.kind === 'wings'
  const box = wings ? 208 : 120
  const bitmap = useBitmap(svgUri(accessoryArt[a.kind], box))
  const tail = a.kind === 'tail'
  return <Group id={a.id} name="gesture-object" x={a.x} y={a.y} rotation={a.angle} scaleX={a.scale} scaleY={a.scale}
    draggable={!!editing} listening={!!editing}
    onClick={() => editing?.select(a.id)} onTap={() => editing?.select(a.id)}
    onDragStart={() => editing?.select(a.id)} onDragEnd={e => {
      const node = e.currentTarget, x = clamp(node.x(), -85, 85), y = clamp(node.y(), -83, 83)
      node.position({ x, y }); editing?.move(a.id, x, y)
    }}>
    {wings ? [-98, 48].map(x => <Rect key={x} x={x} y={-40} width={50} height={75}
      fill="transparent" cornerRadius={8} stroke={editing?.selected === a.id ? '#8462db' : undefined} strokeWidth={1.6} dash={[4, 3]}/>) : <Rect x={tail ? -20 : -48} y={tail ? -48 : -40} width={tail ? 55 : 96} height={tail ? 100 : 80}
      fill="transparent" cornerRadius={8} stroke={editing?.selected === a.id ? '#8462db' : undefined} strokeWidth={1.6} dash={[4, 3]}/>}
    <KImage image={bitmap} x={-box/2} y={-box/2} width={box} height={box} listening={false}/>
  </Group>
}
function Puppet({ ball, look = 0, editing, face, blink = false, facing = 1 }: { ball: Ball; look?: number; editing?: Editing; face?: Face; blink?: boolean; facing?: -1 | 1 }) {
  const flag = useBallFlag(ball.code), expression = useBitmap(svgUri(faceArt(face ?? ball.face, blink, face ? undefined : ball.eyes, face ? undefined : ball.mouth), 104))
  const x = faceX(facing, look)
  const finish = useBitmap(svgUri(glaze, 130))
  return <>
    {ball.accessories.filter(a => isBehindProp(a.kind)).map(a => <Prop key={a.id} a={a} editing={editing}/>)}
    <Group listening={false}>
      <Circle radius={62} fill="#fffaf6"/>
      <Group clipFunc={ctx => ctx.arc(0,0,62,0,Math.PI*2)}>
        <KImage image={flag?.canvas} x={-62} y={-62} width={124} height={124}/>
        <Circle radius={62} fillRadialGradientStartPoint={{ x:-12, y:-20 }} fillRadialGradientEndPoint={{ x:0,y:0 }} fillRadialGradientStartRadius={24} fillRadialGradientEndRadius={63} fillRadialGradientColorStops={[0,'rgba(45,39,67,0)',1,'rgba(45,39,67,.14)']}/>
      </Group>
      <KImage image={finish} x={-65} y={-65} width={130} height={130}/>
      <KImage image={expression} x={-52 + x} y={-52} width={104} height={104}/>
    </Group>
    {ball.accessories.filter(a => !isBehindProp(a.kind)).map(a =>
      <Group key={a.id} x={faceAccessoryShift(a.kind, x)}><Prop a={a} editing={editing}/></Group>)}
  </>
}

export function EditorCanvas({ ball, look, editing }: { ball: Ball; look: number; editing: Editing }) {
  const { ref, width, height } = useFrame(), scale = Math.min(width/245,height/213,1.9)
  const stage = useRef<Konva.Stage>(null)
  usePinch(ref,stage,id=>ball.accessories.find(a=>a.id===id),editing.startPinch,editing.transform,[.4,1.8])
  return <div ref={ref} className="edit-canvas" role="img" aria-label="Предпросмотр шарика с аксессуарами">
    <Stage ref={stage} width={width} height={height}><Layer><Group x={width/2} y={height*.53} scaleX={scale} scaleY={scale}>
      <Ellipse y={69} radiusX={54} radiusY={6} fill="#a594c7" opacity={.25}/>
      <Puppet ball={ball} look={look} editing={editing}/>
    </Group></Layer></Stage>
  </div>
}

type ActorMotion = { x:number; y:number; jump:number; rotation:number; scaleX:number; scaleY:number; face?:Face; fx:number }
const smooth = (p:number) => (1-Math.cos(Math.PI*clamp(p,0,1)))/2
const pulse = (p:number, start=0, end=1) => p <= start || p >= end ? 0 : Math.sin(Math.PI*(p-start)/(end-start))

/** Pure choreography: every path is zero at p=0 and p=1, so interruption never alters saved poses. */
export function performanceMotion(key: keyof typeof actions, p: number, side: -1|1, pairVector: {x:number;y:number}, reduced=false): ActorMotion {
  if (reduced) return {x:0,y:0,jump:0,rotation:0,scaleX:1,scaleY:1,fx:p > .25 && p < .75 ? 1 : 0}
  const approach = pulse(p,.06,.92), contact = pulse(p,.32,.76)
  let x=0,y=0,jump=0,rotation=0,scaleX=1,scaleY=1,fx=0
  switch ((actions[key] as Action).animationKey) {
    case 'greet': x=pairVector.x*approach; y=pairVector.y*approach; jump=12*pulse(p,.28,.62); rotation=side*5*Math.sin(p*8*Math.PI); break
    case 'friend': {
      const beat = Math.sin(p*4*Math.PI)**2 * contact
      x=pairVector.x*approach; y=pairVector.y*approach
      jump=12*beat; rotation=side*9*contact; scaleX=1+.07*beat; scaleY=1-.05*beat
      fx=pulse(p,.18,.95); break
    }
    case 'laugh': jump=5*Math.abs(Math.sin(p*5*Math.PI))*Math.sin(Math.PI*p); rotation=7*Math.sin(p*8*Math.PI)*Math.sin(Math.PI*p); scaleY=1-.06*pulse(p,.15,.85); fx=pulse(p,.2,.82); break
    case 'argue': x=pairVector.x*approach*.72; y=pairVector.y*approach*.72; rotation=side*9*Math.sin(p*12*Math.PI)*contact; fx=pulse(p,.15,.88); break
    case 'sulk': x=side*8*pulse(p,.12,.9); rotation=side*12*pulse(p,.08,.94); scaleX=1+.07*pulse(p,.25,.8); scaleY=1-.06*pulse(p,.25,.8); fx=pulse(p,.34,.75); break
    case 'reconcile': x=pairVector.x*approach; y=pairVector.y*approach; rotation=side*8*pulse(p,.05,.38)-side*3*contact; fx=pulse(p,.45,.86); break
    case 'dance': {
      const together = key === 'danceTogether'
      const sway = Math.sin(p*6*Math.PI)*Math.sin(Math.PI*p)
      const step = Math.sin(p*4*Math.PI + (together && side < 0 ? Math.PI/2 : 0))
      jump=(together ? 24 : 12)*Math.abs(step)*Math.sin(Math.PI*p)
      rotation=side*16*sway
      x=(together ? pairVector.x*approach*.86 : 0)+side*13*sway
      y=together ? pairVector.y*approach*.86 : 0
      fx=pulse(p,.08,.92); break
    }
    case 'bump': x=pairVector.x*pulse(p,.03,.72)*1.18; y=pairVector.y*pulse(p,.03,.72)*1.18; rotation=-side*10*pulse(p,.55,.95); fx=pulse(p,.42,.72); break
    case 'flower': x=pairVector.x*approach*.9; y=pairVector.y*approach*.9; rotation=side*5*pulse(p,.15,.82); fx=pulse(p,.35,.84); break
    case 'tongue': rotation=5*Math.sin(p*4*Math.PI)*Math.sin(Math.PI*p); scaleX=1+.04*pulse(p,.2,.82); fx=0; break
    case 'jump': x=pairVector.x*approach*.65; y=pairVector.y*approach*.65; jump=24*Math.sin(Math.PI*clamp((p-.18)/.56,0,1)); fx=pulse(p,.25,.78); break
    case 'hug': x=pairVector.x*approach*1.08; y=pairVector.y*approach*1.08; rotation=side*8*contact; scaleX=1-.08*contact; scaleY=1+.05*contact; fx=contact; break
    case 'wave': jump=4*pulse(p,.2,.75); rotation=side*5*Math.sin(p*6*Math.PI)*Math.sin(Math.PI*p); break
  }
  return {x,y,jump,rotation,scaleX,scaleY,fx}
}

function Fx({ kind, amount, side, source }: { kind: Action['fxKey']; amount:number; side:-1|1; source:boolean }) {
  if (!kind || amount <= .01) return null
  if (kind === 'heart') return <Group x={side*20*amount} y={-68-22*amount} opacity={amount} scaleX={.7+.85*amount} scaleY={.7+.85*amount}><Line points={[0,8,-12,-3,-10,-13,0,-9,10,-13,12,-3,0,8]} closed fill="#f47f9b" stroke="#7d405d" strokeWidth={2}/></Group>
  if (kind === 'note') return <Group x={side*30} y={-72} opacity={amount}><Line points={[0,12,0,-12,13,-16,13,7]} stroke="#5d4b8c" strokeWidth={4}/><Circle y={13} radius={6} fill="#8771cf"/><Circle x={13} y={8} radius={6} fill="#8771cf"/></Group>
  if (kind === 'flower') return source ? <Group x={side*72} y={-8} opacity={amount} scaleX={.72+.28*amount} scaleY={.72+.28*amount}>
    <Line points={[0,7,-side*3,45]} stroke="#4c9d6c" strokeWidth={4}/>
    {[0,72,144,216,288].map(d => {
      const angle=d*Math.PI/180
      return <Ellipse key={d} x={Math.cos(angle)*10} y={Math.sin(angle)*10} rotation={d} radiusX={8} radiusY={5} fill="#f68fab" stroke="#8b4761" strokeWidth={1.5}/>
    })}
    <Circle radius={6} fill="#ffd15d" stroke="#8b6940" strokeWidth={1.5}/>
  </Group> : null
  if (kind === 'impact') return <Group opacity={amount}>{[0,60,120,180,240,300].map(d=><Line key={d} rotation={d} points={[0,-70,0,-87]} stroke="#f3bd4e" strokeWidth={4}/>)}</Group>
  if (kind === 'puff') return <Group x={side*30} y={-74} opacity={amount}><Circle radius={9} fill="#ede9f4"/><Circle x={10} y={3} radius={7} fill="#ede9f4"/><Circle x={16} y={10} radius={4} fill="#ede9f4"/></Group>
  return <Group opacity={amount}>{[0,120,240].map(d=><Line key={d} rotation={d} points={[0,-73,0,-87]} stroke="#fff1a6" strokeWidth={4}/>)}</Group>
}

function Gesture({ kind, side, phase, reduced }: { kind:string|undefined; side:-1|1; phase:number; reduced:boolean }) {
  const visible = kind === 'greet' || kind === 'wave' || kind === 'hug'
  if (!visible) return null
  const amount = reduced ? (phase > .2 && phase < .8 ? 1 : 0) : pulse(phase,.08,.9)
  if (amount <= .01) return null
  if (kind === 'hug') return <Group opacity={amount}>
    <Line points={[side*31,18,side*54,25,side*70,12]} tension={.55} stroke="#29263b" strokeWidth={8}/>
    <Line points={[side*31,18,side*54,25,side*70,12]} tension={.55} stroke="#f7d09c" strokeWidth={5}/>
  </Group>
  const rotation = reduced ? side*12 : side*(12+20*Math.sin(phase*8*Math.PI))
  return <Group x={side*61} y={-5} rotation={rotation} opacity={amount} scaleX={side} scaleY={1}>
    <Line points={[0,22,0,2,4,-7,9,-5,10,3,14,-3,19,0,17,8,22,5,26,10,22,23,13,29]} closed
      fill="#f7d09c" stroke="#29263b" strokeWidth={3} lineJoin="round"/>
    <Line points={[4,-12,1,-19,-3,-14]} stroke="#6b55a3" strokeWidth={2.5}/>
    <Line points={[12,-13,13,-21,17,-15]} stroke="#6b55a3" strokeWidth={2.5}/>
  </Group>
}

type ParkProps = {
  actors: Actor[]; balls: Ball[]; selected: string | null; target: boolean; performance: Performance | null
  tap: (id: string) => void; clear: () => void; grab: (id: string) => void
  move: (id: string, x: number, y: number) => void; finish: () => void
  transform:(id:string,p:PinchTarget)=>void
}
export function ParkCanvas({ actors, balls, selected, target, performance: show, tap, clear, grab, move, finish,transform }: ParkProps) {
  const { ref, width, height } = useFrame()
  const stage = useRef<Konva.Stage>(null), reduced = useReducedMotion()
  usePinch(ref,stage,id=>actors.find(a=>a.id===id),grab,transform,[.55,1.6])
  const zoom = Math.min(width/580,height/330,1.35)
  const [phase, setPhase] = useState(0), [look, setLook] = useState(0), [blink,setBlink] = useState(false)
  const [dragging, setDragging] = useState<string[]>([])
  useEffect(() => {
    if (!show) { setPhase(0); return }
    let frame = 0
    const duration = reduced ? Math.min(500,actions[show.action].duration) : actions[show.action].duration
    const tick = () => {
      const p = clamp((window.performance.now()-show.start)/duration,0,1)
      setPhase(p)
      if (p < 1) frame = requestAnimationFrame(tick)
      else finish()
    }
    tick(); return () => cancelAnimationFrame(frame)
  }, [show, finish, reduced])
  useEffect(() => {
    if (reduced || show || dragging.length) { setLook(0); return }
    let second = 0, third = 0
    const interval = window.setInterval(() => {
      setLook(-1); second = window.setTimeout(() => setLook(1),650); third = window.setTimeout(() => setLook(0),1350)
    }, 5300)
    return () => { clearInterval(interval); clearTimeout(second); clearTimeout(third); setLook(0) }
  }, [reduced,show,dragging.length])
  useEffect(() => {
    if (reduced || show || dragging.length) { setBlink(false); return }
    let close = 0
    const interval = window.setInterval(() => {
      setBlink(true)
      close = window.setTimeout(() => setBlink(false), 140)
    }, 3700)
    return () => { clearInterval(interval); clearTimeout(close); setBlink(false) }
  }, [reduced,show,dragging.length])

  return <div ref={ref} className="park-canvas" role="img" aria-label="Игровая сцена">
    <Stage ref={stage} width={width} height={height} onClick={e => { if (e.target === e.target.getStage()) clear() }} onTap={e => { if (e.target === e.target.getStage()) clear() }}>
      <Layer>{actors.map((a,i) => {
        const ball = balls.find(b => b.id === a.ballId)
        if (!ball) return null
        const active = a.id === selected, eligible = target && !active
        const participant = show && (show.from === a.id || show.to === a.id)
        const source = !!show && show.from === a.id
        const otherId = participant ? (a.id === show.from ? show.to : show.from) : undefined
        const other = actors.find(candidate => candidate.id === otherId)
        const side: -1|1 = other ? (other.x >= a.x ? 1 : -1) : (i%2 ? -1 : 1)
        const s = zoom*a.scale
        const edgeX = Math.min(width*.45, 64*s+2), edgeY = Math.min(height*.45,70*s)
        const baseX = clamp(a.x*width,edgeX,width-edgeX), baseY = clamp(a.y*height,edgeY,height-edgeY)
        const dx = other ? (clamp(other.x*width,edgeX,width-edgeX)-baseX) : 0
        const dy = other ? (clamp(other.y*height,edgeY,height-edgeY)-baseY) : 0
        const distance = Math.hypot(dx,dy) || 1, travel = Math.max(0,Math.min(distance*.5-58*s, distance*.38))
        const vector = {x:dx/distance*travel,y:dy/distance*travel}
        const motion = participant ? performanceMotion(show.action,phase,side,vector,reduced) : {x:0,y:0,jump:0,rotation:0,scaleX:1,scaleY:1,fx:0}
        const spec = participant ? actions[show.action] as Action : undefined
        const key = spec?.animationKey
        const temporaryFace: Face|undefined = key === 'friend' ? 'adoring' : show?.action === 'danceTogether' && participant ? 'dazzled' : key === 'laugh' ? 'laugh' : key === 'argue' ? 'angry' : key === 'sulk' ? 'sad'
          : key === 'bump' ? 'surprise' : key === 'tongue' ? 'cheeky' : key === 'reconcile' && phase < .42 ? 'angry'
          : participant && ['friend','reconcile','flower','hug','jump','greet'].includes(key!) ? 'happy' : undefined
        return <Group key={a.id} id={a.id} name="gesture-object" x={baseX+motion.x} y={baseY+motion.y-motion.jump}
          scaleX={s} scaleY={s} draggable
          onClick={() => tap(a.id)} onTap={() => tap(a.id)}
          onDragStart={e => { e.currentTarget.position({x:baseX,y:baseY}); setDragging(ids => [...ids, a.id]); grab(a.id) }}
          dragBoundFunc={pos => ({x:clamp(pos.x,edgeX,width-edgeX),y:clamp(pos.y,edgeY,height-edgeY)})}
          onDragEnd={e => { setDragging(ids => ids.filter(id => id !== a.id)); move(a.id,e.currentTarget.x()/width,e.currentTarget.y()/height) }}>
          <Circle radius={72} fill="transparent"/>
          <Ellipse y={65+motion.jump} radiusX={53} radiusY={7} fill="#305c49" opacity={.2} listening={false}/>
          {(active || eligible) && <Circle radius={70} stroke={eligible ? '#6040b8' : '#fff'} shadowColor="#7960b7" shadowBlur={3} strokeWidth={eligible ? 4 : 3} dash={eligible ? [8,5] : undefined} listening={false}/>}
          <Group rotation={a.angle+motion.rotation} scaleX={motion.scaleX} scaleY={motion.scaleY} listening={false}>
            <Puppet ball={ball} face={temporaryFace} facing={a.facing === -1 ? -1 : 1} blink={!participant && blink} look={dragging.includes(a.id) || participant ? 0 : (i%2 ? -look : look)}/>
            {participant && <Fx kind={spec?.fxKey} amount={motion.fx} side={side} source={source}/>}
            {participant && <Gesture kind={key} side={side} phase={phase} reduced={reduced}/>}
          </Group>
        </Group>
      })}</Layer>
    </Stage>
  </div>
}
