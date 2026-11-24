import { useSceneMusic } from './sceneMusic'
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import {
  FlipHorizontal2, Check, ChevronLeft, Eye, Flag, Heart, Maximize2, Minimize2, Minus, Music2, Pencil, Plus, RotateCw,
  Settings2, Sparkles, Trash2, Undo2, UserRound, UsersRound, Volume2, VolumeX, WandSparkles, X,
} from 'lucide-react'
import { eyeArt, mouthArt } from './art'
import { expressions, eyeStyles, mouthStyles, type Eyes, type Mouth } from './toys'
import { BallIcon, FaceIcon, PropIcon } from './Illustrations'
import { actions, soundAction, type ActionId, type Performance } from './actions'
import { chime, pronounce, stopVoice } from './audio'
import {
  accessory, addToStage, backgrounds, clamp, countries, faces, favoriteCodes, flagOf, items,
  loadGame, nameOf, newBall, storageKey, type Accessory, type BackgroundId,
  type Ball, type Code, type Face, type Game, type Item,
} from './model'

type Page = 'park' | 'workshop'
type Tab = 'flags' | 'faces' | 'items'
const route = (): Page => location.hash.slice(1) === 'workshop' ? 'workshop' : 'park'
const tabs = [['flags', 'Флаги', Flag], ['faces', 'Мордочки', Heart], ['items', 'Наряды', Sparkles]] as const
const backgroundLabels: Record<BackgroundId, string> = { park: 'Парк', playground: 'Парк аттракционов', party: 'Праздник', space: 'Космос', ocean: 'Под водой', ice: 'Ледяная бухта', apartment: 'Гостиная', kitchen: 'Кухня', bathroom: 'Ванная', bedroom: 'Спальня' }
const EditorCanvas = lazy(() => import('./Canvas').then(module => ({ default: module.EditorCanvas })))
const ParkCanvas = lazy(() => import('./Canvas').then(module => ({ default: module.ParkCanvas })))

function App() {
  const [page, setPage] = useState<Page>(route)
  const [game, setGame] = useState<Game>(loadGame)
  useSceneMusic(game.backgroundId, game.music && page === 'park')
  const [draft, setDraft] = useState<Ball>(newBall)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('flags')
  const [selectedProp, setSelectedProp] = useState<string | null>(null)
  const [past, setPast] = useState<Ball[]>([])
  const [look, setLook] = useState(0)
  const [actor, setActor] = useState<string | null>(null)
  const [targetAction, setTargetAction] = useState<ActionId | null>(null)
  const [performance, setPerformance] = useState<Performance | null>(null)
  const [actorFaces, setActorFaces] = useState<Record<string, Face>>({})
  const [panel, setPanel] = useState<'friends' | 'backgrounds' | 'settings' | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fullscreenAvailable] = useState(() => document.fullscreenEnabled && !!document.documentElement.requestFullscreen)
  const [notice, setNotice] = useState('')
  const [voiceUnavailable, setVoiceUnavailable] = useState<Code | null>(null)
  const [storageError, setStorageError] = useState(false)
  const [cached, setCached] = useState(false)
  const timers = useRef<number[]>([])
  const balls = game.collection
  const currentActor = game.actors.find(item => item.id === actor)
  const currentBall = balls.find(ball => ball.id === currentActor?.ballId)
  const currentProp = draft.accessories.find(part => part.id === selectedProp)
  const finishPerformance = useCallback(() => setPerformance(null), [])
  const displayBalls = game.actors.map(instance => {
    const base = balls.find(ball => ball.id === instance.ballId)!
    return { ...base, id: `display-${instance.id}`, face: actorFaces[instance.id] ?? base.face, eyes: actorFaces[instance.id] ? undefined : base.eyes, mouth: actorFaces[instance.id] ? undefined : base.mouth }
  })
  const displayActors = game.actors.map(instance => ({ ...instance, ballId: `display-${instance.id}` }))

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(game))
      setStorageError(false)
    } catch {
      setStorageError(true)
    }
  }, [game])
  useEffect(() => {
    const hash = () => {
      setPage(route()); setPanel(null); setTargetAction(null); setPerformance(null); setVoiceUnavailable(null); stopVoice()
    }
    const hidden = () => { if (document.hidden) stopVoice() }
    window.addEventListener('hashchange', hash)
    document.addEventListener('visibilitychange', hidden)
    return () => {
      window.removeEventListener('hashchange', hash); document.removeEventListener('visibilitychange', hidden); stopVoice()
    }
  }, [])
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return
    void navigator.serviceWorker.ready.then(() => setCached(true)).catch(() => {})
  }, [])
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (panel) {
        setPanel(null); setConfirmReset(false); return
      }
      if (targetAction || performance) {
        setTargetAction(null); setPerformance(null); return
      }
      setActor(null)
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [panel, performance, targetAction])
  useEffect(() => {
    if (!fullscreenAvailable) return
    const update = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', update)
    update()
    return () => document.removeEventListener('fullscreenchange', update)
  }, [fullscreenAvailable])
  useEffect(() => {
    return () => timers.current.forEach(clearTimeout)
  }, [])
  useEffect(() => {
    if (panel !== 'settings') setConfirmReset(false)
  }, [panel])

  const go = (next: Page) => {
    if (next === page) setPage(next)
    else location.hash = next
  }
  const resetDraft = (ball = newBall()) => {
    setDraft(ball); setEditingId(null); setSelectedProp(null); setPast([]); setTab('flags'); setLook(0)
  }
  const create = () => { resetDraft(newBall()); go('workshop') }
  const edit = (ball: Ball) => {
    resetDraft({ ...ball, accessories: ball.accessories.map(part => ({ ...part })) })
    setEditingId(ball.id); go('workshop')
  }
  const change = (next: Ball) => {
    setPast(history => [...history.slice(-19), draft]); setDraft(next)
  }
  const choose = (code: Code) => {
    if (draft.code !== code) change({ ...draft, code })
    setVoiceUnavailable(null)
    pronounce(code, game.voice, () => setVoiceUnavailable(code))
  }
  const repeatName = () => {
    setVoiceUnavailable(null)
    pronounce(draft.code, game.voice, () => setVoiceUnavailable(draft.code))
  }
  const add = (kind: Item) => {
    if (draft.accessories.length >= 20) return setNotice('Шарик уже очень нарядный!')
    const part = accessory(kind), copies = draft.accessories.filter(item => item.kind === kind).length
    if (copies) { part.x += (copies % 3 - 1) * 12 - 6; part.y += 5 * (copies % 3) }
    change({ ...draft, accessories: [...draft.accessories, part] }); setSelectedProp(part.id); chime(game.sounds)
  }
  const editProp = (id: string, patch: Partial<Accessory>) =>
    change({ ...draft, accessories: draft.accessories.map(part => part.id === id ? { ...part, ...patch } : part) })
  const undo = () => {
    if (!past.length) return
    setDraft(past[past.length - 1]); setPast(history => history.slice(0, -1)); setSelectedProp(null)
  }
  const watch = () => {
    timers.current.forEach(clearTimeout)
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    setLook(-1)
    timers.current = [
      window.setTimeout(() => setLook(1), reduced ? 250 : 600),
      window.setTimeout(() => setLook(0), reduced ? 500 : 1250),
    ]
  }
  const done = () => {
    if (editingId) {
      setGame(value => ({ ...value, collection: value.collection.map(ball => ball.id === editingId ? draft : ball) }))
      setActor(game.actors.find(item => item.ballId === editingId)?.id ?? null)
      setNotice('Изменения сохранены в коллекции.')
      chime(game.sounds, true); resetDraft(); go('park'); return
    }
    const next = addToStage(game, draft, true)
    setGame(next)
    setActor(next.actors[next.actors.length - 1]?.id ?? null)
    chime(game.sounds, true); resetDraft(); go('park')
  }
  const perform = (action: ActionId, from: string, to?: string) => {
    setTargetAction(null)
    setPerformance({ action, from, to, start: window.performance.now() })
    soundAction(action, game.sounds)
  }
  const tapActor = (id: string) => {
    if (!game.actors.some(instance => instance.id === id)) {
      setActor(null); setTargetAction(null); setPerformance(null); return
    }
    if (targetAction && actor === id) {
      setTargetAction(null); setPerformance(null)
    } else if (targetAction && actor) {
      perform(targetAction, actor, id)
    } else {
      setActor(id); setPerformance(null)
    }
    setPanel(null); setNotice('')
  }
  const runAction = (id: ActionId) => {
    const action = actions[id]
    if (!actor) return
    if (action.kind === 'solo') return perform(id, actor)
    const partners = game.actors.filter(instance => instance.id !== actor)
    if (partners.length === 1) return perform(id, actor, partners[0].id)
    if (partners.length > 1) {
      setTargetAction(id)
      setPerformance(null)
    }
  }
  const transformActor = (patch: Partial<{ scale: number; angle: number }>) => {
    setPerformance(null); setTargetAction(null)
    setGame(value => ({ ...value, actors: value.actors.map(item => item.id === actor ? { ...item, ...patch } : item) }))
  }
  const toggleFullscreen = () => {
    if (!fullscreenAvailable) return
    try {
      const request = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()
      void request.catch(() => {})
    } catch {
      // Some embedded browsers expose the API but reject it synchronously.
    }
  }
  const putBall = (ball: Ball) => {
    const next = addToStage(game, ball, false)
    setGame(next); setActor(next.actors[next.actors.length - 1]?.id ?? null); setPanel(null)
  }
  const iconButton = (label: string, Icon: typeof Minus, click: () => void, disabled = false) =>
    <button type="button" className="icon-button" aria-label={label} title={label} onClick={click} disabled={disabled}><Icon /></button>

  if (page === 'workshop') {
    return <main className="workshop-page">
      <header className="workshop-head">
        <button className="back-button" onClick={() => go('park')}><ChevronLeft />В парк</button>
        <a className="brand" href="#park"><img src="./icon.svg" alt="" /><span>Шаро<em>мир</em></span></a>
        <button className="sound-button" aria-label={game.voice ? 'Выключить произношение' : 'Включить произношение'}
          aria-pressed={!game.voice} onClick={() => { stopVoice(); setVoiceUnavailable(null); setGame(value => ({ ...value, voice: !value.voice })) }}>
          {game.voice ? <Volume2 /> : <VolumeX />}
        </button>
      </header>
      <section className="my-balls" aria-labelledby="my-balls-title">
        <div className="section-title"><div><span className="kicker">МОЯ КОЛЛЕКЦИЯ</span><h1 id="my-balls-title">Мои шарики <small>{balls.length}</small></h1></div>
        <button className="primary-button" data-testid="create-ball" onClick={() => create()}><Plus />Создать нового</button></div>
        <div className="collection-row">{balls.map(ball => <button key={ball.id} className="collection-ball" onClick={() => edit(ball)}>
          <BallIcon ball={ball} /><span>{nameOf(ball.code)}</span><i><Pencil /> Изменить</i>
        </button>)}</div>
      </section>
      <div className="workbench">
        <section className="preview-card">
          <div className="preview-top"><span>ТВОЙ ШАРИК</span>{iconButton('Отменить последнее изменение', Undo2, undo, !past.length)}</div>
          <div className="preview-canvas"><EditorCanvas ball={draft} look={look} editing={{
            selected: selectedProp, select: setSelectedProp, move: (id: string, x: number, y: number) => editProp(id, { x, y }),
            startPinch: (id: string) => { setSelectedProp(id); setPast(history => [...history.slice(-19), draft]) },
            transform: (id: string, patch: { scale: number; angle: number }) => setDraft(ball => ({ ...ball, accessories: ball.accessories.map(part => part.id === id ? { ...part, ...patch } : part) })),
          }} /></div>
          <div className="ball-name"><img src={flagOf(draft.code)} alt="" /><strong>{nameOf(draft.code)}</strong>
            <button className={`icon-button voice-retry ${voiceUnavailable === draft.code ? 'unavailable' : ''}`}
              aria-label={voiceUnavailable === draft.code ? 'Запись недоступна. Повторить название страны' : 'Повторить название страны'}
              title={voiceUnavailable === draft.code ? 'Запись недоступна — попробовать снова' : 'Повторить название страны'}
              onClick={repeatName} disabled={!game.voice}>{voiceUnavailable === draft.code ? <VolumeX /> : <Volume2 />}</button></div>
          <div className="preview-buttons"><button className="secondary-button icon-action" aria-label="Посмотреть вокруг" title="Посмотреть вокруг" onClick={watch}><Eye /></button>
            <button className="primary-button done" onClick={done}><Check />{editingId ? 'Сохранить' : 'Готово'}</button></div>
        </section>
        <section className="toolbox">
          <div className="tabs" aria-label="Настройки шарика">{tabs.map(([id, label, Icon]) =>
            <button key={id} aria-pressed={tab === id} onClick={() => setTab(id)}><Icon /><span>{label}</span></button>)}</div>
          <div className="catalog" hidden={tab !== 'flags'}>
            <h2>С какого флага начнём?</h2><p>Нажми на флаг, чтобы выбрать и услышать название.</p>
            <h3><Heart /> Любимые</h3>
            <div className="favorite-flags">{favoriteCodes.map(code => <FlagButton key={code} code={code} kind="favorite" chosen={draft.code === code} unavailable={voiceUnavailable === code} choose={choose} />)}</div>
            <h3><Flag /> Все флаги</h3>
            <div className="all-flags">{countries.map(([code]) =>
              <FlagButton key={code} code={code} kind="catalog" chosen={draft.code === code} unavailable={voiceUnavailable === code} choose={choose} />)}</div>
          </div>
          <div className="catalog" hidden={tab !== 'faces'}>
            <h2>Глаза</h2>
            <div className="prop-grid feature-grid">{(Object.keys(eyeStyles) as Eyes[]).map(eyes =>
              <button key={eyes} aria-pressed={(draft.eyes ?? expressions[draft.face].eyes) === eyes} onClick={() => change({ ...draft, eyes })}>
                <svg viewBox={eyes === 'streams' ? '-42 -21 84 63' : '-42 -28 84 47'} aria-hidden="true" dangerouslySetInnerHTML={{ __html: eyeArt(eyes) }}/><span>{eyeStyles[eyes]}</span>
              </button>)}</div>
            <h2>Рот</h2>
            <div className="prop-grid feature-grid">{(Object.keys(mouthStyles) as Mouth[]).map(mouth =>
              <button key={mouth} aria-pressed={(draft.mouth ?? expressions[draft.face].mouth) === mouth} onClick={() => change({ ...draft, mouth })}>
                <svg viewBox="-25 -16 50 32" aria-hidden="true" dangerouslySetInnerHTML={{ __html: mouth === 'none' ? '<circle r="9" fill="none" stroke="#aaa2b9"/><path d="m-6 6 12-12" stroke="#aaa2b9"/>' : mouthArt(mouth) }}/><span>{mouthStyles[mouth]}</span>
              </button>)}</div></div>
          <div className="catalog" hidden={tab !== 'items'}><h2>Наряди шарика</h2><p>Предмет можно двигать прямо на шарике.</p>
            <div className="prop-grid">{(Object.entries(items) as [Item, string][]).map(([id, label]) =>
              <button key={id} onClick={() => add(id)}><PropIcon kind={id} /><span>{label}</span></button>)}</div>
            {!!draft.accessories.length && <div className="worn"><h3>На шарике</h3><div>{draft.accessories.map((part, index) =>
              <button key={part.id} aria-label={`Выбрать: ${items[part.kind]}, предмет ${index + 1}`} aria-pressed={selectedProp === part.id}
                onClick={() => setSelectedProp(part.id)}><PropIcon kind={part.kind} /></button>)}</div></div>}
            {currentProp && <div className="transform-tools"><strong>{items[currentProp.kind]}</strong>
              {iconButton('Уменьшить предмет', Minus, () => editProp(currentProp.id, { scale: clamp(currentProp.scale - .15, .4, 1.8) }))}
              {iconButton('Увеличить предмет', Plus, () => editProp(currentProp.id, { scale: clamp(currentProp.scale + .15, .4, 1.8) }))}
              {iconButton('Повернуть предмет', RotateCw, () => editProp(currentProp.id, { angle: (currentProp.angle + 15) % 360 }))}
              {iconButton('Снять предмет', Trash2, () => { change({ ...draft, accessories: draft.accessories.filter(part => part.id !== currentProp.id) }); setSelectedProp(null) })}
            </div>}
          </div>
        </section>
      </div>
      {notice && <p className="toast" role="status">{notice}</p>}
      {storageError && <p className="toast" role="status">Не удалось сохранить игру в этом браузере.</p>}
    </main>
  }

  return <main className="park-page" data-background={game.backgroundId} data-performing={!!performance} data-action={performance?.action}>
    <Suspense fallback={<div className="loading">Готовим сцену…</div>}>
      <section className="stage-shell" aria-label={backgroundLabels[game.backgroundId]}>
        <ParkCanvas actors={displayActors} balls={displayBalls} selected={actor} target={!!targetAction}
          performance={performance} finish={finishPerformance} tap={tapActor}
          clear={() => { setActor(null); setTargetAction(null); setPerformance(null) }}
          grab={(id: string) => { setActor(id); setTargetAction(null); setPerformance(null) }}
          move={(id: string, x: number, y: number) => setGame(value => ({ ...value, actors: value.actors.map(item => item.id === id ? { ...item, x, y } : item) }))}
          transform={(id: string, patch: { scale: number; angle: number }) => setGame(value => ({ ...value, actors: value.actors.map(item => item.id === id ? { ...item, ...patch } : item) }))} />
      </section>
    </Suspense>
    <header className="park-topbar">
      <a className="brand glass" href="#park"><img src="./icon.svg" alt="" /><span>Шаро<em>мир</em></span></a>
      <button className="round-control glass" aria-label="Настройки" aria-expanded={panel === 'settings'} onClick={() => setPanel(panel === 'settings' ? null : 'settings')}><Settings2 /></button>
    </header>
    <nav className="park-dock glass" aria-label="Игровые инструменты">
      <button data-testid="open-friends" onClick={() => setPanel(panel === 'friends' ? null : 'friends')} aria-pressed={panel === 'friends'}><Plus /><span>Друзья</span></button>
      <button data-testid="open-backgrounds" onClick={() => setPanel(panel === 'backgrounds' ? null : 'backgrounds')} aria-pressed={panel === 'backgrounds'}><Sparkles /><span>Место</span></button>
      <button data-testid="open-workshop" onClick={() => create()}><WandSparkles /><span>Мастерская</span></button>
    </nav>
    {panel && <aside className={`floating-panel ${panel}`} aria-label={panel === 'friends' ? 'Добавить друга' : panel === 'backgrounds' ? 'Выбрать место' : 'Настройки'}>
      <div className="panel-head"><strong>{panel === 'friends' ? 'Кто идёт играть?' : panel === 'backgrounds' ? 'Куда отправимся?' : 'Настройки'}</strong>
        {iconButton('Закрыть панель', X, () => setPanel(null))}</div>
      {panel === 'friends' && <div className="friend-picker">{balls.map(ball => {
        const copies = game.actors.filter(item => item.ballId === ball.id).length
        return <button key={ball.id} onClick={() => putBall(ball)}><BallIcon ball={ball} /><span>{nameOf(ball.code)}</span>
          <small>{copies ? `на сцене: ${copies}` : 'добавить'}</small></button>
      })}</div>}
      {panel === 'backgrounds' && <div className="background-picker">{backgrounds.map(id =>
        <button key={id} data-testid={`background-${id}`} aria-pressed={game.backgroundId === id} onClick={() => { setGame(value => ({ ...value, backgroundId: id })); setPanel(null) }}>
          <img src={`./backgrounds/${id}.svg`} alt="" /><span>{backgroundLabels[id]}</span>{game.backgroundId === id && <Check />}
        </button>)}</div>}
      {panel === 'settings' && <div className="settings-list">
        <button role="switch" aria-checked={game.voice} onClick={() => { stopVoice(); setVoiceUnavailable(null); setGame(value => ({ ...value, voice: !value.voice })) }}><Volume2 /><span>Названия стран</span><i className={game.voice ? 'on' : ''} /></button>
        <button role="switch" aria-checked={game.sounds} onClick={() => setGame(value => ({ ...value, sounds: !value.sounds }))}><Music2 /><span>Звуки игры</span><i className={game.sounds ? 'on' : ''} /></button>
        <button role="switch" aria-checked={game.music} onClick={() => setGame(value => ({ ...value, music: !value.music }))}><Music2 /><span>Музыка сцены</span><i className={game.music ? 'on' : ''} /></button>
        {fullscreenAvailable && <button data-testid="toggle-fullscreen" aria-label={isFullscreen ? 'Выйти из полноэкранного режима' : 'Открыть на весь экран'} onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize2 /> : <Maximize2 />}<span>{isFullscreen ? 'Выйти из полного экрана' : 'На весь экран'}</span>
        </button>}
        <div className="offline-status" role="status"><Check />{cached ? 'Можно играть без интернета' : 'Готовим офлайн-режим…'}</div>
        {!confirmReset
          ? <button className="reset-button" data-testid="reset-stage" onClick={() => setConfirmReset(true)}><Trash2 /><span>Очистить сцену</span></button>
          : <div className="reset-confirm"><p>Убрать всех со сцены?</p><button onClick={() => {
              setGame(value => ({ ...value, actors: [] })); setActorFaces({}); setActor(null); setPerformance(null); setTargetAction(null); setConfirmReset(false); setPanel(null)
            }} data-testid="confirm-reset">Да, убрать</button><button onClick={() => setConfirmReset(false)}>Отмена</button></div>}
      </div>}
    </aside>}
    <div className="stage-keyboard">
      {game.actors.map((instance, index) => <button key={instance.id}
        style={{ left: `${instance.x*100}%`, top: `${instance.y*100}%` }}
        aria-pressed={actor === instance.id} onClick={() => tapActor(instance.id)}>
        {targetAction ? 'Выбрать партнёра' : 'Выбрать героя'}: {nameOf(balls.find(ball => ball.id === instance.ballId)!.code)}, {index+1}
      </button>)}
    </div>
    {currentActor && <aside className="actor-bar glass" aria-label={`Действия: ${currentBall ? nameOf(currentBall.code) : 'шарик'}`}>
      <div className="selected-ball"><BallIcon ball={currentBall!} /></div>
      <div className="action-groups">
        {(Object.entries(actions) as [ActionId, typeof actions[ActionId]][]).map(([id, action]) => {
          const Icon = action.icon
          return <button key={id} data-testid={`action-${id}`} className={targetAction === id || performance?.action === id ? 'active' : ''} aria-label={`${action.label}${action.kind === 'pair' ? ', с другом' : ', одному'}`}
            title={action.label} disabled={action.kind === 'pair' && game.actors.length < 2} onClick={() => runAction(id)}><Icon /><small>{action.kind === 'pair' ? <UsersRound /> : <UserRound />}</small></button>
        })}
      </div>
      <div className="mood-tools" aria-label="Настроение этого героя">{(Object.entries(faces) as [Face, string][]).map(([face, label]) =>
        <button key={face} aria-label={`Настроение: ${label}`} title={label} aria-pressed={(actorFaces[currentActor.id] ?? currentBall?.face) === face}
          onClick={() => { setActorFaces(value => ({ ...value, [currentActor.id]: face })); setPerformance(null); setTargetAction(null) }}><FaceIcon face={face} /></button>)}</div>
      <div className="actor-transform">
        {iconButton('Уменьшить шарика', Minus, () => transformActor({ scale: clamp(currentActor.scale - .15, .55, 1.6) }))}
        {iconButton('Увеличить шарика', Plus, () => transformActor({ scale: clamp(currentActor.scale + .15, .55, 1.6) }))}
        {iconButton('Повернуть шарика', RotateCw, () => transformActor({ angle: (currentActor.angle + 15) % 360 }))}
        {iconButton(currentActor.facing === -1 ? 'Лицо вправо' : 'Лицо влево', FlipHorizontal2, () =>
          setGame(value => ({ ...value, actors: value.actors.map(item => item.id === actor ? { ...item, facing: item.facing === -1 ? 1 : -1 } : item) })))}
        {iconButton('Убрать шарика со сцены', Trash2, () => {
          setGame(value => ({ ...value, actors: value.actors.filter(item => item.id !== actor) }))
          setActorFaces(value => { const next = { ...value }; if (actor) delete next[actor]; return next })
          setActor(null); setPerformance(null); setTargetAction(null)
        })}
      </div>
    </aside>}
    {targetAction && <div className="target-hint" role="status">{actions[targetAction].label} · Выбери подсвеченного друга
      <button aria-label="Отменить выбор друга" title="Отменить выбор друга" onClick={() => setTargetAction(null)}><X /></button></div>}
    {!game.actors.length && <div className="empty-stage glass"><Sparkles /><h1>Сцена готова!</h1><p>Добавь друзей или создай нового шарика.</p><button className="primary-button" onClick={() => setPanel('friends')}><Plus />Добавить друга</button></div>}
    {notice && <p className="toast" role="status">{notice}</p>}
    {storageError && <p className="toast" role="status">Не удалось сохранить игру в этом браузере.</p>}
  </main>
}

function FlagButton({ code, kind, chosen, unavailable, choose }: { code: Code; kind: 'favorite' | 'catalog'; chosen: boolean; unavailable: boolean; choose: (code: Code) => void }) {
  const label = unavailable ? `${nameOf(code)} — запись недоступна, повторить` : nameOf(code)
  return <button className={`flag-button ${kind}-flag ${unavailable ? 'voice-unavailable' : ''}`} aria-label={label} aria-pressed={chosen} onClick={() => choose(code)}>
    <img src={flagOf(code)} alt="" /><span>{nameOf(code)}</span>{unavailable ? <VolumeX className="voice-error" /> : chosen && <Check />}
  </button>
}

export default App
