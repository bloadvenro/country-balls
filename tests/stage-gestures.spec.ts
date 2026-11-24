import { expect, test, type Page } from '@playwright/test'
import { storageKey } from '../src/model'

// Two small actors (minimum scale), two full-size actors and multiple copies of each design.
const actors = [
  { id: 'small-japan', ballId: 'friend-jp', x: .24, y: .38, scale: .4, angle: 0 },
  { id: 'small-brazil', ballId: 'friend-br', x: .60, y: .44, scale: .4, angle: 0 },
  { id: 'large-japan', ballId: 'friend-jp', x: .5, y: .27, scale: 1, angle: 0 },
  { id: 'large-brazil', ballId: 'friend-br', x: .78, y: .72, scale: 1, angle: 0 },
]

async function openScene(page: Page) {
  await page.addInitScript(({ key, actors }) => {
    localStorage.setItem(key, JSON.stringify({
      version: 1, actors, collection: [], backgroundId: 'party', voice: false, music: false, sounds: false,
    }))
  }, { key: storageKey, actors })
  await page.goto('/')
  await page.locator('.park-canvas canvas').waitFor()
}

test.use({ hasTouch: true, viewport: { width: 900, height: 640 } })

test('маленький партнёр отвечает при небольшом сдвиге пальца и совместимых событиях мыши', async ({ page, context }) => {
  await openScene(page)
  const client = await context.newCDPSession(page)
  const surface = page.locator('.park-canvas canvas')
  const scene = page.locator('.park-page')
  const editor = page.getByRole('dialog', { name: /^Быстрый редактор:/ })

  await page.touchscreen.tap(216, 243)
  for (const [x, y] of [[540, 282], [702, 461]]) {
    await page.getByTestId('action-danceTogether').tap()
    await expect(page.locator('.target-hint')).toBeVisible()
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] })
    await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + 5, y: y + 2, id: 1 }] })
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await expect(scene).toHaveAttribute('data-action', 'danceTogether')
    // Hybrid screens can deliver an additional compatibility mouse sequence for this tap.
    await surface.evaluate((canvas, point) => {
      for (const type of ['mousedown', 'mouseup', 'click']) {
        canvas.dispatchEvent(new MouseEvent(type, {
          bubbles: true, cancelable: true, ...point, button: 0, buttons: type === 'mousedown' ? 1 : 0,
        }))
      }
    }, { clientX: x + 5, clientY: y + 2 })
    await expect(scene).toHaveAttribute('data-performing', 'true')
    await expect(editor).toHaveCount(0)
    await expect(page.locator('.stage-keyboard button').first()).toHaveAttribute('aria-pressed', 'true')
    await expect(scene).toHaveAttribute('data-performing', 'false')
  }
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).actors, storageKey)).toEqual(actors)
})

test('подсказка о выборе партнёра пропускает касание шарика под текстом', async ({ page }) => {
  await openScene(page)
  await page.touchscreen.tap(216, 243)
  await page.getByTestId('action-friend').tap()
  await page.getByRole('button', { name: 'Отменить выбор друга' }).tap()
  await expect(page.locator('.target-hint')).toBeHidden()
  await page.getByTestId('action-friend').tap()
  await page.touchscreen.tap(450, 173)
  await expect(page.locator('.park-page')).toHaveAttribute('data-action', 'friend')
})

test('два тапа открывают редактор одного героя, а касания разных героев выбирают их по очереди', async ({ page }) => {
  await openScene(page)
  const editor = page.getByRole('dialog', { name: /^Быстрый редактор:/ })
  await page.touchscreen.tap(216, 243)
  await page.touchscreen.tap(540, 282)
  await expect(page.locator('.stage-keyboard button').nth(1)).toHaveAttribute('aria-pressed', 'true')
  await expect(editor).toHaveCount(0)
  await page.touchscreen.tap(544, 283)
  await expect(editor).toBeVisible()
})

test('уменьшенный шарик сохраняет область касания пальцем на узком экране', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await openScene(page)
  // At this width the drawn radius is ~14px. A tap 21px from center is still within its touch target.
  await page.touchscreen.tap(77 + 21, 243)
  await expect(page.locator('.stage-keyboard button').first()).toHaveAttribute('aria-pressed', 'true')
})
