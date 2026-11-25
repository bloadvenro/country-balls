import { expect, test, type Locator } from '@playwright/test'

test.use({ hasTouch: true })

for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
  test(`дверцы кухни открываются по рисунку и сохраняются после перезапуска, ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await page.getByTestId('open-backgrounds').tap()
    await page.getByTestId('background-kitchen').tap()
    const art = page.locator('.scene-art')
    const fridge = page.getByRole('button', { name: 'Холодильник' })
    const oven = page.getByRole('button', { name: 'Духовка' })
    const tapDrawing = async (drawing: Locator) => {
      const box = (await drawing.boundingBox())!
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
    }
    await tapDrawing(art.locator('.oven-door'))
    await expect(oven).toHaveAttribute('aria-pressed', 'true')
    await expect(fridge).toHaveAttribute('aria-pressed', 'false')
    await tapDrawing(art.locator('.fridge-door'))
    await expect(fridge).toHaveAttribute('aria-pressed', 'true')
    await page.reload()
    await expect(oven).toHaveAttribute('aria-pressed', 'true')
    await expect(fridge).toHaveAttribute('aria-pressed', 'true')
    await tapDrawing(art.locator('.oven-interior'))
    await expect(oven).toHaveAttribute('aria-pressed', 'false')
    await tapDrawing(art.locator('.fridge-interior'))
    await expect(fridge).toHaveAttribute('aria-pressed', 'false')
  })
}

test('ночник гостиной загорается с новой ночью, а свет кухонных приборов следует за небом и дверцей', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('open-backgrounds').tap()
  await page.getByTestId('background-apartment').tap()
  const sky = page.getByRole('button', { name: /Окно гостиной/ })
  const lamp = page.getByRole('button', { name: 'Ночник в гостиной' })
  await sky.press('Enter')
  await expect(lamp).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.reading-lamp-glow')).toBeVisible()
  await lamp.press('Enter')
  await page.reload()
  await expect(lamp).toHaveAttribute('aria-pressed', 'false')
  await expect(page.locator('.reading-lamp-glow')).toBeHidden()
  await sky.press('Enter')
  await expect(lamp).toHaveCount(0)
  await sky.press('Enter')
  await expect(page.locator('.reading-lamp-glow')).toBeVisible()

  await page.getByTestId('open-backgrounds').tap()
  await page.getByTestId('background-kitchen').tap()
  const fridge = page.getByRole('button', { name: 'Холодильник' })
  await expect(page.locator('.oven-window-light')).toBeHidden()
  await fridge.press('Enter')
  await expect(page.locator('.fridge-light')).toBeVisible()
  await page.getByRole('button', { name: /Окно кухни/ }).press('Enter')
  await expect(page.locator('.oven-window-light')).toBeVisible()
  await fridge.press('Enter')
  await expect(page.locator('.fridge-light')).toBeHidden()
  await page.getByRole('button', { name: 'Духовка' }).press('Enter')
  await expect(page.locator('.oven-cavity-light')).toBeVisible()
})

test('в роддоме вода и дверь переключаются независимо и сохраняются', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.goto('/')
  await page.getByTestId('open-backgrounds').tap()
  await page.getByTestId('background-maternity').tap()
  const tapDrawing = async (selector: string) => {
    const drawing = page.locator(selector)
    await expect(drawing).toBeVisible()
    const box = (await drawing.boundingBox())!
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
  }
  const frame = page.locator('.scene-frame')
  await tapDrawing('.ward-faucet')
  await expect(page.locator('.ward-faucet-water')).toBeVisible()
  await tapDrawing('.ward-door-leaf')
  await expect(frame).toHaveAttribute('data-door-open', 'true')
  await page.reload()
  await expect(page.locator('.ward-faucet-water')).toBeVisible()
  await expect(frame).toHaveAttribute('data-door-open', 'true')
  await tapDrawing('.ward-corridor')
  await expect(frame).toHaveAttribute('data-door-open', 'false')
  await tapDrawing('.ward-faucet')
  await expect(page.locator('.ward-faucet-water')).toBeHidden()
})

test('на пляже меняются небесное светило, отражение на воде и огни маяка', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.goto('/')
  await page.getByTestId('open-backgrounds').tap()
  await page.getByTestId('background-beach').tap()
  const sun = page.locator('.sky-body .by-day circle').first()
  const moon = page.locator('.sky-body .at-night path').first()
  const touch = async (light: Locator) => {
    await expect(light).toBeVisible()
    const box = (await light.boundingBox())!
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
  }
  await expect(page.locator('.beach-reflection use.by-day')).toBeVisible()
  await touch(sun)
  await expect(page.locator('.beach-reflection use.at-night')).toBeVisible()
  await expect(page.locator('.beach-beam')).toBeVisible()
  await page.reload()
  await touch(moon)
  await expect(page.locator('.beach-beam')).toBeHidden()
  await expect(page.locator('.beach-reflection use.by-day')).toBeVisible()
})
