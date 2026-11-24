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
  const updated = await saved(page)
  expect(updated.actors[0]).toMatchObject({ id: initial.actors[0].id, scale: 1, angle: 15 })
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
  await button('Убрать шарика со сцены').click()
  expect((await saved(page)).actors.map(a => a.id)).toEqual([initial.actors[1].id])
  expect((await saved(page)).collection.map(b => b.id)).toEqual(initial.collection.map(b => b.id))
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
  const settings = (await page.getByRole('button', {name:'Настройки', includeHidden: true}).boundingBox())!
  await page.mouse.click(settings.x + settings.width / 2, settings.y + settings.height / 2)
  await expect(popup).toHaveCount(0)
  await expect(page.getByRole('button', {name:'Настройки'})).toHaveAttribute('aria-expanded', 'false')
})
