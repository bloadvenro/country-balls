import { expect, test, type Page } from '@playwright/test'
import { storageKey, type Game } from '../src/model'

const saved = (page: Page) => page.evaluate(key => JSON.parse(localStorage.getItem(key)!) as Game, storageKey)
const mediaLog = (page: Page) => page.evaluate(() =>
  (window as unknown as { mediaLog: { type: 'play' | 'playing' | 'pause'; src: string }[] }).mediaLog)

test('парк: независимые копии друзей, клавиатура, фон и сохраняемый сброс', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.park-canvas canvas')).toBeVisible()
  expect(await page.evaluate(() => document.fullscreenElement)).toBeNull()
  expect((await saved(page)).actors).toHaveLength(2)
  await page.getByTestId('open-friends').click()
  await expect(page.locator('.friend-picker button span')).toHaveText(['Япония', 'Бразилия'])
  await page.getByTestId('open-workshop').click()
  await expect(page.getByRole('heading', { name: 'Мои шарики 2' })).toBeVisible()
  await expect(page.locator('.collection-ball span')).toHaveText(['Япония', 'Бразилия'])
  await page.getByRole('button', { name: 'В парк' }).click()

  for (let copy = 0; copy < 2; copy++) {
    await page.getByTestId('open-friends').click()
    await page.locator('.friend-picker button').filter({ hasText: 'Япония' }).click()
  }
  const withCopies = await saved(page)
  const japan = withCopies.actors.filter(actor => actor.ballId === 'friend-jp')
  expect(japan).toHaveLength(3)
  expect(new Set(japan.map(actor => actor.id)).size).toBe(3)

  const actorButtons = page.locator('.stage-keyboard button')
  await actorButtons.first().focus()
  await page.keyboard.press('Enter')
  await expect(actorButtons.first()).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Настроение: Спит' }).click()
  await expect(page.getByRole('button', { name: 'Настроение: Спит' })).toHaveAttribute('aria-pressed', 'true')
  await actorButtons.last().press('Enter')
  await expect(page.getByRole('button', { name: 'Настроение: Улыбка' })).toHaveAttribute('aria-pressed', 'true')
  await page.getByTestId('action-greet').click()
  await expect(page.getByRole('status')).toContainText('Выбери подсвеченного друга')
  await page.getByRole('button', { name: 'Убрать шарика со сцены' }).click()
  await expect(page.getByText('Выбери подсвеченного друга')).toHaveCount(0)

  await page.getByTestId('open-backgrounds').click()
  await expect(page.getByTestId('background-park')).toBeVisible()
  await page.getByTestId('background-party').click()
  await expect(page.locator('.park-page')).toHaveAttribute('data-background', 'party')
  await page.evaluate(key => {
    const game = JSON.parse(localStorage.getItem(key)!)
    game.collection.push({ id: 'kept-ball', code: 'jp', face: 'smile', accessories: [] })
    localStorage.setItem(key, JSON.stringify(game))
  }, storageKey)
  await page.reload()

  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  await page.getByRole('button', { name: 'Настройки' }).click()
  await expect(page.locator('.offline-status')).toHaveText('Можно играть без интернета')
  await page.getByTestId('reset-stage').click()
  await page.keyboard.press('Escape')
  await expect(page.getByTestId('confirm-reset')).toHaveCount(0)
  await page.getByRole('button', { name: 'Настройки' }).click()
  await page.getByTestId('reset-stage').click()
  await page.getByTestId('confirm-reset').click()
  await expect(page.getByRole('heading', { name: 'Сцена готова!' })).toBeVisible()
  expect(await saved(page)).toMatchObject({ actors: [], backgroundId: 'party' })
  expect((await saved(page)).collection.map(ball => ball.id)).toContain('kept-ball')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Сцена готова!' })).toBeVisible()
})

test('старая коллекция объединяется с друзьями и сохраняет правки готового шарика', async ({ page }) => {
  const custom = { id: 'my-japan', code: 'jp', face: 'cheeky', accessories: [] }
  const actor = { id: 'placed-japan', ballId: 'friend-jp', x: .3, y: .7, scale: 1.2, angle: 25 }
  await page.addInitScript(({ key, custom, actor }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({
      version: 1, collection: [custom], actors: [actor], backgroundId: 'kitchen',
    }))
  }, { key: storageKey, custom, actor })
  await page.goto('/#workshop')
  const cards = page.locator('.collection-ball')
  await expect(cards.locator('span')).toHaveText(['Япония', 'Бразилия', 'Япония'])
  await cards.first().click()
  await page.locator('.catalog-flag[aria-label="Италия"]').click()
  await page.getByRole('button', { name: 'Сохранить' }).click()
  await expect(page.locator('.stage-keyboard button')).toHaveAccessibleName('Выбрать героя: Италия, 1')
  await page.reload()
  await page.getByTestId('open-friends').click()
  await expect(page.locator('.friend-picker button span')).toHaveText(['Италия', 'Бразилия', 'Япония'])
  await page.getByTestId('open-workshop').click()
  await expect(page.getByRole('heading', { name: 'Мои шарики 3' })).toBeVisible()
  await expect(cards.locator('span')).toHaveText(['Италия', 'Бразилия', 'Япония'])
  const restored = await saved(page)
  expect(restored.actors).toEqual([actor])
  expect(restored.backgroundId).toBe('kitchen')
  expect(restored.collection.find(ball => ball.id === custom.id)).toMatchObject(custom)
})

test('аудио: play/pause, повтор, быстрый выбор, mute и полный офлайн-декод', async ({ page, context }) => {
  await page.addInitScript(() => {
    const log: { type: 'play' | 'playing' | 'pause'; src: string }[] = []
    Object.assign(window, { mediaLog: log })
    const nativePlay = HTMLMediaElement.prototype.play, nativePause = HTMLMediaElement.prototype.pause
    HTMLMediaElement.prototype.play = function () {
      const src = new URL(this.currentSrc || this.src).pathname
      log.push({ type: 'play', src })
      this.addEventListener('playing', () => log.push({ type: 'playing', src }), { once:true })
      return nativePlay.call(this)
    }
    HTMLMediaElement.prototype.pause = function () {
      log.push({ type: 'pause', src: new URL(this.currentSrc || this.src || location.href).pathname })
      return nativePause.call(this)
    }
  })
  await page.goto('/')
  await page.getByTestId('open-workshop').click()
  await expect(page.locator('.catalog-flag')).toHaveCount(196)
  await expect(page.locator('.favorite-flag')).toHaveCount(16)
  const labels = await page.locator('.catalog-flag').evaluateAll(buttons => buttons.map(button => button.getAttribute('aria-label')!))
  expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b, 'ru')))

  await page.locator('.catalog-flag[aria-label="США"]').click()
  await expect.poll(async () => (await mediaLog(page)).filter(e => e.type === 'playing').map(e => e.src)).toContain('/voice/us.mp3')
  await page.locator('.catalog-flag[aria-label="Англия"]').click()
  await page.locator('.catalog-flag[aria-label="Япония"]').click()
  await page.getByRole('button', { name: 'Повторить название страны' }).click()
  let log = await mediaLog(page)
  expect(log.filter(entry => entry.type === 'play').map(entry => entry.src).slice(-4))
    .toEqual(['/voice/us.mp3', '/voice/gb-eng.mp3', '/voice/jp.mp3', '/voice/jp.mp3'])
  expect(log.filter(entry => entry.type === 'pause').length).toBeGreaterThanOrEqual(3)

  await page.getByRole('button', { name: 'Выключить произношение' }).click()
  const playsBeforeMute = log.filter(entry => entry.type === 'play').length
  await page.locator('.catalog-flag[aria-label="Франция"]').click()
  log = await mediaLog(page)
  expect(log.filter(entry => entry.type === 'play')).toHaveLength(playsBeforeMute)

  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  await page.reload()
  await page.waitForFunction(() => !!navigator.serviceWorker.controller)
  await context.setOffline(true)
  const decoded = await page.evaluate(async () => {
    const images = [...document.querySelectorAll<HTMLImageElement>('.catalog-flag img')]
    await Promise.all(images.map(image => image.decode()))
    const paths = [...new Set(images.map(image => new URL(image.src).pathname.replace('/flags/', '/voice/').replace('.svg', '.mp3')))]
    const audio = new AudioContext()
    const durations = await Promise.all(paths.map(async path =>
      audio.decodeAudioData(await (await fetch(path)).arrayBuffer()).then(buffer => buffer.duration)))
    await audio.close()
    return durations
  })
  expect(decoded).toHaveLength(196)
  expect(Math.min(...decoded)).toBeGreaterThan(.25)
})

test('недоступная запись не мешает выбору; кнопка повтора снова запускает тот же голос', async ({ page }) => {
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play
    let block = true
    HTMLMediaElement.prototype.play = function () {
      if (block) { block = false; return Promise.reject(new DOMException('Blocked', 'NotAllowedError')) }
      this.addEventListener('playing', () => document.documentElement.dataset.heard = this.src, { once:true })
      return play.call(this)
    }
  })
  await page.goto('/#workshop')
  await page.locator('.favorite-flag[aria-label="Япония"]').click()
  await expect(page.locator('.ball-name strong')).toHaveText('Япония')
  await page.getByRole('button', { name:'Запись недоступна. Повторить название страны' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-heard', /\/voice\/jp\.mp3$/)
  await expect(page.locator('.voice-unavailable')).toHaveCount(0)
})

test('состав каталога: 193 члена ООН, два наблюдателя, Англия и любимая полка', async ({ page }) => {
  const codes = `ad ae af ag al am ao ar at au az ba bb bd be bf bg bh bi bj bn bo br bs bt bw by bz ca cd cf cg ch ci cl cm cn co cr cu cv cy cz de dj dk dm do dz ec ee eg er es et fi fj fm fr ga gb gb-eng gd ge gh gm gn gq gr gt gw gy hn hr ht hu id ie il in iq ir is it jm jo jp ke kg kh ki km kn kp kr kw kz la lb lc li lk lr ls lt lu lv ly ma mc md me mg mh mk ml mm mn mr mt mu mv mw mx my mz na ne ng ni nl no np nr nz om pa pe pg ph pk pl ps pt pw py qa ro rs ru rw sa sb sc sd se sg si sk sl sm sn so sr ss st sv sy sz td tg th tj tl tm tn to tr tt tv tz ua ug us uy uz va vc ve vn vu ws ye za zm zw`.split(' ')
  await page.goto('/#workshop')
  const images = (selector: string) => page.locator(selector).evaluateAll(nodes =>
    nodes.map(n => (n as HTMLImageElement).src.split('/').pop()!.replace('.svg','')))
  await expect(page.locator('.catalog-flag')).toHaveCount(codes.length)
  expect((await images('.catalog-flag img')).sort()).toEqual(codes)
  expect(await images('.favorite-flag img')).toEqual('kz ru us jp de br by ua fr it es ir gb-eng kr tr cn'.split(' '))
})

test('мастерская C07–C10: независимые предметы, drag, undo, transform и смена флага сохраняют позы', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('open-workshop').click()
  await page.getByRole('button', { name: 'Наряды' }).click()
  for (const label of ['Кошачьи ушки', 'Кошачий хвостик', 'Бант', 'Бант']) {
    await page.getByRole('button', { name: label, exact: true }).click()
  }
  await expect(page.locator('.worn button')).toHaveCount(4)
  await page.getByRole('button', { name: 'Выбрать: Кошачьи ушки, предмет 1' }).click()
  await page.getByRole('button', { name: 'Снять предмет' }).click()
  await expect(page.locator('.worn button')).toHaveCount(3)
  await page.getByRole('button', { name: 'Отменить последнее изменение' }).click()
  await expect(page.locator('.worn button')).toHaveCount(4)

  const preview = (await page.locator('.edit-canvas').boundingBox())!
  const zoom = Math.min(preview.width / 245, preview.height / 213, 1.9)
  const tailX = preview.x + preview.width / 2 + 61 * zoom
  const tailY = preview.y + preview.height * .53 + 8 * zoom
  await page.mouse.move(tailX, tailY); await page.mouse.down()
  await page.mouse.move(tailX + 18 * zoom, tailY + 12 * zoom, { steps: 6 }); await page.mouse.up()

  await page.getByRole('button', { name: 'Выбрать: Бант, предмет 4' }).click()
  await page.getByRole('button', { name: 'Повернуть предмет' }).click()
  await page.getByRole('button', { name: 'Увеличить предмет' }).click()
  await page.getByRole('button', { name: 'Флаги' }).click()
  await page.locator('.catalog-flag[aria-label="Франция"]').click()
  await page.getByRole('button', { name: 'Готово' }).click()

  const ball = (await saved(page)).collection.find(ball => ball.code === 'fr')!
  expect(ball.code).toBe('fr')
  expect(ball.accessories.map(part => part.kind)).toEqual(['ears', 'tail', 'bow', 'bow'])
  expect(ball.accessories[0]).toMatchObject({ x: 0, y: -40, scale: 1, angle: 0 })
  expect(ball.accessories[1].x).toBeGreaterThan(70)
  expect(ball.accessories[1].y).toBeGreaterThan(15)
  expect(ball.accessories[3]).toMatchObject({ angle: 15, scale: 1.15 })

  const actorCount = (await saved(page)).actors.length
  await page.getByTestId('open-workshop').click()
  await page.getByRole('button', { name: 'Франция Изменить' }).click()
  await page.getByRole('button', { name: 'Мордочки' }).click()
  await page.getByRole('button', { name: 'Галактики', exact: true }).click()
  await page.getByRole('button', { name: 'Язычок', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Галактики', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Сохранить' }).click()
  const edited = await saved(page)
  expect(edited.actors).toHaveLength(actorCount)
  expect(edited.collection).toHaveLength(3)
  expect(edited.collection.find(savedBall => savedBall.id === ball.id)).toMatchObject({ eyes: 'galaxy', mouth: 'tongue' })
})

test('C14–C15: действие активно до drag, партнёр выбирается с клавиатуры, pinch меняет угол и размер одного', async ({ page, context }) => {
  await page.goto('/')
  const actorButtons = page.locator('.stage-keyboard button')
  await actorButtons.first().focus(); await page.keyboard.press('Enter')
  await page.getByTestId('action-greet').click()
  await expect(page.locator('.park-page')).toHaveAttribute('data-performing', 'true')

  let game = await saved(page)
  const scene = (await page.locator('.park-canvas').boundingBox())!
  const first = { x: scene.x + game.actors[0].x * scene.width, y: scene.y + game.actors[0].y * scene.height }
  await page.mouse.move(first.x, first.y); await page.mouse.down()
  await page.mouse.move(first.x + 66, first.y + 22, { steps: 5 }); await page.mouse.up()
  await expect(page.locator('.park-page')).toHaveAttribute('data-performing', 'false')
  const dragged = await saved(page)
  expect(dragged.actors[0].x).toBeGreaterThan(game.actors[0].x + .03)
  expect(dragged.actors[0].y).toBeGreaterThan(game.actors[0].y)
  expect(dragged.actors[1]).toEqual(game.actors[1])

  game = await saved(page)
  const actor = game.actors[0]
  const x = scene.x + actor.x * scene.width, y = scene.y + actor.y * scene.height
  const client = await context.newCDPSession(page)
  const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', points: { x: number; y: number; id: number }[]) =>
    client.send('Input.dispatchTouchEvent', { type, touchPoints: points })
  await touch('touchStart', [{ x: x - 12, y, id: 1 }])
  await touch('touchStart', [{ x: x - 12, y, id: 1 }, { x: x + 12, y, id: 2 }])
  await touch('touchMove', [{ x: x - 18, y: y - 8, id: 1 }, { x: x + 18, y: y + 8, id: 2 }])
  await touch('touchEnd', [])
  const pinched = await saved(page)
  expect(pinched.actors[0].scale).toBeGreaterThan(game.actors[0].scale + .2)
  expect(Math.abs(pinched.actors[0].angle - game.actors[0].angle)).toBeGreaterThan(5)
  expect(pinched.actors[1]).toEqual(game.actors[1])
})

test('сцена сохраняет больше десяти героев, направление и фон после перезагрузки', async ({ page }) => {
  await page.addInitScript(key => {
    const actor = (id: string, x: number, y: number) => ({ id, ballId: 'friend-jp', x, y, scale: 1, angle: 0 })
    if (localStorage.getItem(key)) return
    localStorage.setItem(key, JSON.stringify({
      version: 1, collection: [], backgroundId: 'playground', voice: true, sounds: true,
      actors: Array.from({ length: 10 }, (_, index) => actor(`actor-${index}`, .12 + index % 4 * .24, .35 + Math.floor(index / 4) * .4)),
    }))
  }, storageKey)
  await page.goto('/')
  await page.getByTestId('open-workshop').click()
  await page.getByRole('button', { name: 'Готово' }).click()
  await expect(page.locator('.park-canvas canvas')).toBeVisible()
  const full = await saved(page)
  expect(full.actors).toHaveLength(11)
  expect(full.collection).toHaveLength(3)

  await page.getByRole('button', {name:'Лицо влево'}).click()
  for (const place of ['space', 'ocean', 'ice', 'apartment', 'kitchen', 'bathroom', 'bedroom', 'maternity']) {
    await page.getByTestId('open-backgrounds').click()
    const card = page.getByTestId('background-' + place)
    await card.locator('img').evaluate((img: HTMLImageElement) => img.decode())
    await card.click()
    await expect(page.locator('.park-page')).toHaveAttribute('data-background', place)
  }
  await page.reload()
  expect((await saved(page)).actors[10].facing).toBe(-1)
  expect((await saved(page)).backgroundId).toBe('maternity')
  await page.getByTestId('open-workshop').click()
  await page.getByRole('button', { name: 'Казахстан Изменить' }).click()
  await page.getByRole('button', { name: 'Сохранить' }).click()
  const edited = await saved(page)
  expect(edited.actors).toHaveLength(11)
  expect(edited.collection).toHaveLength(3)
})

test.describe('узкий экран', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
  test('сцена равна viewport, вкладки доступны, каталог сохраняет scroll', async ({ page }) => {
    await page.goto('/')
    const scene = (await page.locator('.park-canvas').boundingBox())!
    expect(scene.height).toBe(844)
    expect(await page.evaluate(() => document.documentElement.scrollHeight === innerHeight)).toBe(true)
    await page.getByTestId('open-workshop').tap()
    const flags = page.getByRole('button', { name: 'Флаги' })
    await expect(flags).toBeVisible()
    await page.locator('.all-flags').evaluate(element => { element.scrollTop = 300 })
    const before = await page.locator('.all-flags').evaluate(element => element.scrollTop)
    await page.getByRole('button', { name: 'Мордочки' }).tap()
    await flags.tap()
    expect(await page.locator('.all-flags').evaluate(element => element.scrollTop)).toBe(before)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
})

test.describe('низкий landscape', () => {
  test.use({ viewport: { width: 640, height: 360 } })
  test('dock и сцена полностью внутри viewport 640×360 и 844×390', async ({ page }) => {
    for (const viewport of [{ width: 640, height: 360 }, { width: 844, height: 390 }]) {
      await page.setViewportSize(viewport)
      await page.goto('/')
      const scene = (await page.locator('.park-canvas').boundingBox())!
      const dock = (await page.locator('.park-dock').boundingBox())!
      expect(scene.height).toBe(viewport.height)
      expect(dock.y + dock.height).toBeLessThanOrEqual(viewport.height)
      expect(await page.evaluate(() => document.documentElement.scrollHeight === innerHeight)).toBe(true)
    }
  })
})

test('глянцевый шарик Украины сохраняет обе полосы флага', async ({ page }) => {
  await page.goto('/#workshop')
  await page.locator('.favorite-flag[aria-label="Украина"]').click()
  await expect.poll(() => page.locator('.edit-canvas canvas').evaluate((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!
    const pixel = (y: number) => ctx.getImageData(Math.floor(canvas.width / 2), Math.floor(canvas.height * y), 1, 1).data
    const top = pixel(.4), bottom = pixel(.72)
    return top[2] > top[0] + 50 && bottom[0] > bottom[2] + 80 && bottom[1] > bottom[2] + 50
  })).toBe(true)
})

test('крыло можно выбрать за край, сдвинуть и увеличить', async ({ page }) => {
  await page.goto('/#workshop')
  await page.getByRole('button', { name: 'Наряды', exact: true }).click()
  for (const name of ['Крылышки', 'Лунная заколка']) {
    await page.getByRole('button', { name, exact: true }).click()
  }
  const preview = page.locator('.edit-canvas')
  await preview.scrollIntoViewIfNeeded()
  const box = (await preview.boundingBox())!
  const zoom = Math.min(box.width / 245, box.height / 213, 1.9)
  const x = box.x + box.width / 2 - 85 * zoom
  const y = box.y + box.height * .53 - 9 * zoom
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 8 * zoom, y - 10 * zoom, { steps: 6 })
  await page.mouse.up()
  await expect(page.locator('.transform-tools strong')).toHaveText('Крылышки')
  await page.getByRole('button', { name: 'Увеличить предмет' }).click()
  await page.getByRole('button', { name: 'Готово' }).click()
  const wings = (await saved(page)).collection.find(ball => ball.code === 'kz')!.accessories[0]
  expect(wings.kind).toBe('wings')
  expect(wings.x).toBeGreaterThan(4)
  expect(wings.scale).toBeCloseTo(1.15)
})

test('музыка меняется на всех сценах, играет офлайн и запоминает выключатель', async ({ page, context }) => {
  await page.addInitScript(() => {
    const tracks = new Set<HTMLMediaElement>()
    const play = HTMLMediaElement.prototype.play
    HTMLMediaElement.prototype.play = function () {
      if (this.src.includes('/music/')) tracks.add(this)
      return play.call(this)
    }
    Object.assign(window, { playingScenes: () => [...tracks].filter(track =>
      !track.paused && track.currentTime > 0).map(track => new URL(track.src).pathname) })
  })
  const playing = () => page.evaluate(() => (window as unknown as { playingScenes(): string[] }).playingScenes())
  await page.goto('/')
  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  await page.reload()
  await page.waitForFunction(() => !!navigator.serviceWorker.controller)
  await context.setOffline(true)
  for (const scene of ['park', 'playground', 'party', 'space', 'ocean', 'ice', 'apartment', 'kitchen', 'bathroom', 'bedroom', 'maternity']) {
    await page.getByTestId('open-backgrounds').click()
    await page.getByTestId('background-' + scene).click()
    await expect.poll(playing).toEqual(['/music/' + scene + '.mp3'])
  }
  await page.getByTestId('open-workshop').click()
  await expect.poll(playing).toEqual([])
  await page.getByRole('button', { name: 'В парк' }).click()
  await expect.poll(playing).toEqual(['/music/maternity.mp3'])
  await page.getByRole('button', { name: 'Настройки' }).click()
  await page.getByRole('switch', { name: 'Музыка сцены' }).click()
  await expect.poll(playing).toEqual([])
  await page.reload()
  await page.getByRole('button', { name: 'Настройки' }).click()
  await expect(page.getByRole('switch', { name: 'Музыка сцены' })).toHaveAttribute('aria-checked', 'false')
  await expect.poll(playing).toEqual([])
})

test('красный диск Японии остаётся круглым и занимает около половины диаметра шарика', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('open-friends').click()
  const flag = page.locator('.friend-picker button').filter({ hasText: 'Япония' }).locator('image')
  await expect(flag).toHaveAttribute('href', /^data:image/)
  const { width, height, size } = await flag.evaluate(async element => {
    const image = new Image()
    image.src = element.getAttribute('href')!
    await image.decode()
    const canvas = document.createElement('canvas')
    const size = image.naturalWidth
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(image, 0, 0)
    const pixels = ctx.getImageData(0, 0, size, size).data
    let minX = size, minY = size, maxX = 0, maxY = 0
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4
        if (pixels[i] - pixels[i+1] < 100) continue
        minX = Math.min(minX, x); maxX = Math.max(maxX, x)
        minY = Math.min(minY, y); maxY = Math.max(maxY, y)
      }
    }
    return { width: maxX-minX+1, height: maxY-minY+1, size }
  })
  expect(width / height).toBeCloseTo(1, 1)
  expect(width / size).toBeGreaterThan(.48)
  expect(width / size).toBeLessThan(.57)
})

test('дружба и парный танец запускаются касанием, лишние герои дают выбор партнёра', async ({ browser }) => {
  const page = await browser.newPage({ hasTouch: true, viewport: { width: 900, height: 640 } })
  try {
    await page.goto('http://127.0.0.1:4173/')
    const canvas = page.locator('.park-canvas canvas')
    await canvas.tap({ position: { x: 288, y: 397 } })
    for (const id of ['friend', 'danceTogether']) {
      await page.getByTestId('action-' + id).tap()
      await expect(page.locator('.park-page')).toHaveAttribute('data-action', id)
      await expect(page.locator('.park-page')).toHaveAttribute('data-performing', 'false')
    }
    await page.getByTestId('open-friends').tap()
    await page.locator('.friend-picker button').first().tap()
    await page.getByTestId('action-friend').tap()
    await expect(page.getByRole('status')).toContainText('Выбери подсвеченного друга')
    await canvas.tap({ position: { x: 612, y: 397 } })
    await expect(page.locator('.park-page')).toHaveAttribute('data-action', 'friend')
  } finally { await page.close() }
})
