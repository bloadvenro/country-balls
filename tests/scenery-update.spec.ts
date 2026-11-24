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
