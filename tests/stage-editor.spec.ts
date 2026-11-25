import { expect, test, type Page } from '@playwright/test'
import { storageKey, type Game } from '../src/model'

const saved = (page: Page) => page.evaluate(key => JSON.parse(localStorage.getItem(key)!) as Game, storageKey)
const editor = (page: Page) => page.getByRole('dialog', { name: /^Быстрый редактор:/ })

test('быстрый редактор переключает наряды, меняет внешность и сохраняет коллекцию', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.park-canvas canvas')).toBeVisible()
  const initial = await saved(page)
  const design = initial.collection.find(ball => ball.id === initial.actors[0].ballId)!
  const glasses = { id: 'glasses-1', kind: 'glasses' as const, x: 3, y: 4, angle: 13, scale: .7 }
  design.accessories = [glasses, { ...glasses, id: 'glasses-2' }]
  await page.evaluate(({ key, game, ball }) => {
    localStorage.setItem(key, JSON.stringify(game))
    localStorage.setItem('sharomir.ball.v1.' + ball.id, JSON.stringify(ball))
  }, { key: storageKey, game: initial, ball: design })
  await page.reload()

  const hero = page.getByRole('button', { name: 'Выбрать героя: Япония, 1' })
  await hero.press('Enter')
  await hero.press('Enter')
  const popup = editor(page)
  const button = (name: string) => popup.getByRole('button', { name, exact: true })
  const firstItem = popup.locator('.stage-editor-grid button').first()
  await expect(firstItem).toHaveAccessibleName('Очки')
  await expect(firstItem).toHaveAttribute('aria-pressed', 'true')
  await button('Очки').click()
  expect((await saved(page)).collection.find(ball => ball.id === design.id)?.accessories).toEqual([])
  await button('Корона').click()
  await expect(firstItem).toHaveAccessibleName('Корона')
  await expect(firstItem.locator('.outfit-check')).toBeVisible()

  await button('Флаги').click()
  await button('Канада').click()
  await expect(popup).toHaveAccessibleName('Быстрый редактор: Канада')
  await button('Мордочки').click()
  await button('Буэээ').click()
  await expect(button('Буэээ')).toHaveAttribute('aria-pressed', 'true')
  await button('Глаза и рот').click()
  await expect(button('Зелёная струйка')).toHaveAttribute('aria-pressed', 'true')
  await button('Сердечки').click()
  expect((await saved(page)).collection.find(ball => ball.id === design.id)?.mouth).toBe('greenDrip')

  await button('Уменьшить шарика').click()
  await button('Повернуть шарика').click()
  await button('Увеличить шарика').click()
  await button('Лицо влево').click()
  await expect(button('Лицо вправо')).toBeVisible()
  const updated = await saved(page)
  expect(updated.actors[0]).toMatchObject({ id: initial.actors[0].id, scale: 1, angle: 15, facing: -1 })
  expect(updated.actors[1]).toEqual(initial.actors[1])
  expect(updated.collection.find(ball => ball.id === design.id)).toMatchObject({
    code: 'ca', eyes: 'hearts', mouth: 'greenDrip', accessories: [{ kind: 'crown' }],
  })
  await button('Действия').click()
  await button('Подружиться').click()
  await expect(popup).toHaveCount(0)
  await expect(page.locator('.park-page')).toHaveAttribute('data-action', 'friend')
  await page.reload()
  const canadian = page.getByRole('button', { name: 'Выбрать героя: Канада, 1' })
  await canadian.press('Enter')
  await canadian.press('Enter')
  await button('Лицо вправо').click()
  expect((await saved(page)).actors[0].facing).toBe(1)
  await button('Убрать шарика со сцены').click()
  expect((await saved(page)).actors.map(a => a.id)).toEqual([initial.actors[1].id])
  expect((await saved(page)).collection.map(b => b.id)).toEqual(initial.collection.map(b => b.id))
})

test.describe('перемещение редактора на планшете', () => {
  test.use({ hasTouch: true, viewport: { width: 1024, height: 768 } })

  test('удержание двигает окно, обычный тап выбирает вкладку, а свайп листает предметы', async ({ page, context }) => {
    await page.goto('/')
    await expect(page.locator('.park-canvas canvas')).toBeVisible()
    const initial = await saved(page)
    const hero = initial.actors[0]
    await page.touchscreen.tap(hero.x * 1024, hero.y * 768)
    await page.touchscreen.tap(hero.x * 1024, hero.y * 768)
    const popup = editor(page)
    const box = (await popup.boundingBox())!
    const flags = popup.getByRole('button', { name: 'Флаги', exact: true })
    const tab = (await flags.boundingBox())!
    const client = await context.newCDPSession(page)
    const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', x = 0, y = 0) =>
      client.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }]})

    const x = tab.x + tab.width / 2, y = tab.y + tab.height / 2
    await touch('touchStart', x, y)
    await page.waitForTimeout(500)
    await touch('touchMove', x - 120, y - 80)
    await touch('touchEnd')
    const moved = (await popup.boundingBox())!
    expect(moved.x).toBeCloseTo(box.x - 120, 0)
    expect(moved.y).toBeCloseTo(box.y - 80, 0)
    await expect(flags).toHaveAttribute('aria-pressed', 'false')
    expect((await saved(page)).actors).toEqual(initial.actors)

    await flags.tap()
    await expect(flags).toHaveAttribute('aria-pressed', 'true')
    const list = popup.locator('.stage-editor-scroll')
    const area = (await list.boundingBox())!
    const swipeX = area.x + area.width / 2, swipeY = area.y + area.height - 35
    await touch('touchStart', swipeX, swipeY)
    for (const dy of [12, 42, 75, 110]) await touch('touchMove', swipeX, swipeY - dy)
    await touch('touchEnd')
    await expect.poll(() => list.evaluate(el => el.scrollTop)).toBeGreaterThan(0)
    await popup.getByRole('button', { name: 'Увеличить шарика' }).tap()
    expect(await popup.boundingBox()).toEqual(moved)

    const gripX = moved.x + moved.width / 2, gripY = moved.y + 7
    await page.mouse.move(gripX, gripY)
    await page.mouse.down()
    await page.mouse.move(1, 1, { steps: 5 })
    await page.mouse.up()
    const edge = (await popup.boundingBox())!
    expect(edge.x).toBe(10)
    expect(edge.y).toBe(10)
    await page.setViewportSize({ width: 390, height: 320 })
    await expect.poll(async () => {
      const rect = (await popup.boundingBox())!
      return rect.y + rect.height
    }).toBeLessThanOrEqual(320)
    await page.touchscreen.tap(385, 315)
    await expect(popup).toHaveCount(0)
  })
})

test('края экрана, прокрутка списка и нажатие за редактором', async ({ page }) => {
  await page.setViewportSize({width: 390, height: 844})
  await page.goto('/')
  const hero = page.getByRole('button', { name: 'Выбрать героя: Бразилия, 2' })
  await hero.press('Enter')
  await hero.press('Enter')
  const popup = editor(page)
  await popup.getByRole('button', {name: 'Флаги'}).click()
  await popup.getByRole('button', {name: 'Япония', exact: true}).scrollIntoViewIfNeeded()
  const box = (await popup.boundingBox())!
  const footer = (await popup.locator('footer').boundingBox())!
  expect(box.x).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width).toBeLessThanOrEqual(390)
  expect(footer.y).toBeGreaterThan(box.y)
  expect(footer.y + footer.height).toBeLessThanOrEqual(844)
  // The taller popup can cover Settings. The other ball is visible below it.
  const other = (await saved(page)).actors[0]
  const viewport = page.viewportSize()!
  const outsideY = other.y * viewport.height
  expect(outsideY).toBeGreaterThan(box.y + box.height)
  await page.mouse.click(other.x * viewport.width, outsideY)
  await expect(popup).toHaveCount(0)
  await expect(hero).toHaveAttribute('aria-pressed', 'true')
})
