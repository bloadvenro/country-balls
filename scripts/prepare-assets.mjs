/**
 * Optional development tool; the built SPA only needs public/.
 *
 * Flags only (Node >=22.13):
 *   node --experimental-strip-types scripts/prepare-assets.mjs
 *
 * Flags and voices (also requires ffmpeg and Piper >=1.5):
 *   PIPER_MODEL=/absolute/path/ru_RU-denis-medium.onnx \
 *     PIPER_BIN=/absolute/path/piper \
 *     node --experimental-strip-types scripts/prepare-assets.mjs
 *
 * PIPER_BIN defaults to `piper`. Without PIPER_MODEL, voice files are untouched.
 */
import {
  copyFileSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync,
} from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { countries, spokenNameOf } from '../src/countries.ts'

const entries = countries.map(([code]) => [code, spokenNameOf(code)])
if (entries.length !== 196) throw new Error(`Expected 196 countries, found ${entries.length}`)

for (const dir of ['flags', 'voice', 'licenses']) mkdirSync(`public/${dir}`, { recursive: true })
copyFileSync('node_modules/flag-icons/LICENSE', 'public/licenses/flag-icons.txt')
copyFileSync('node_modules/@fontsource-variable/nunito/LICENSE', 'public/licenses/nunito.txt')
for (const [code] of entries) {
  copyFileSync(`node_modules/flag-icons/flags/4x3/${code}.svg`, `public/flags/${code}.svg`)
}

if (process.env.PIPER_MODEL) {
  const temp = mkdtempSync(join('scripts', '.voice-'))
  try {
    const input = join(temp, 'names.txt')
    const wavDir = join(temp, 'wav')
    writeFileSync(input, entries.map(([, name]) => name).join('\n'))
    execFileSync(process.env.PIPER_BIN || 'piper', [
      '--model', process.env.PIPER_MODEL, '--input-file', input, '--output-dir', wavDir,
    ], { stdio: 'inherit' })
    const wavs = readdirSync(wavDir)
      .sort((a, b) => BigInt(a.slice(0, -4)) < BigInt(b.slice(0, -4)) ? -1 : 1)
    if (wavs.length !== entries.length) throw new Error(`Expected ${entries.length} WAV files, found ${wavs.length}`)
    entries.forEach(([code], index) => execFileSync('ffmpeg', [
      '-hide_banner', '-loglevel', 'error', '-y', '-i', join(wavDir, wavs[index]),
      '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', '64k', `public/voice/${code}.mp3`,
    ]))
  } finally {
    rmSync(temp, { recursive: true, force: true })
  }
}
