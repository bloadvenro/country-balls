import { expressions, type Eyes, type Mouth, type Face, type Item } from './toys'

const ink = '#29263b'
const stroke = `stroke="${ink}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"`

export const accessoryArt: Record<Item, string> = {
  ears: `<g ${stroke}><path d="M-44 11Q-48-5-43-31L-15-11-11 2M14-10l28-22q7 20 1 43" fill="#57516a"/><path d="m-38-21 15 11-16 7m62-7 15-13 1 20" fill="#ffa9bc" stroke="none"/></g>`,
  tail: `<path d="M-17 34Q13 35 17 13 20 1 10-8-2-22 9-37 16-46 23-41 29-37 23-29 16-20 26-9 39 9 29 30 18 54-15 50Z" ${stroke} fill="#59536e"/><path d="m7-31 14 3M10-5l12-7m-5 27 14 2" stroke="#91899f" stroke-width="5" fill="none"/>`,
  bow: `<g ${stroke}><path d="M-2 0Q-31-26-28-9l3 24q4 7 23-8M2 1Q26-19 28-8l-2 24q-1 7-24-9" fill="#fc94b2"/><ellipse cy="3" rx="6" ry="8" fill="#ffc1cf"/></g>`,
  crown: `<g ${stroke}><path d="m-30-16 16 10 12-20 12 19 18-12-5 33-49 2Z" fill="#ffd258"/><circle cx="-3" cy="1" r="4" fill="#fb8da7"/></g>`,
  glasses: `<g ${stroke} fill="#b9e8ff" fill-opacity=".48"><rect x="-36" y="-12" width="30" height="24" rx="9"/><rect x="5" y="-12" width="30" height="24" rx="9"/><path d="M-6-4Q0-9 5-4" fill="none"/></g>`,
  topHat: `<g ${stroke}><ellipse cy="10" rx="37" ry="9" fill="#292936"/><path d="M-23 7l-3-39h50L21 8" fill="#393847"/><path d="M-24-4h47v12h-46" fill="#e85d72"/></g>`,
  cap: `<g ${stroke}><path d="M-31 2q4-32 34-31 25 1 30 24Q1-12-31 2Z" fill="#63b6df"/><path d="M1-6q27-3 42 9Q21 11 0 4" fill="#4998c4"/></g>`,
  flower: `<g ${stroke}><path d="m0 7 5 34M3 25q-13-8-17 1 10 8 18 5" fill="none" stroke="#4c9d6c"/><g fill="#ff9bb6"><circle cy="-4" r="10"/><circle cx="11" cy="3" r="10"/><circle cx="7" cy="15" r="10"/><circle cx="-7" cy="15" r="10"/><circle cx="-11" cy="3" r="10"/></g><circle cy="6" r="7" fill="#ffd65f"/></g>`,
  moustache: `<path d="M0 2q-15-17-29-3-9 13 8 17Q-8 17 0 7q9 11 22 8 16-4 7-17Q15-15 0 2Z" ${stroke} fill="#40394c"/>`,
  scarf: `<g ${stroke}><path d="M-39-8Q0 7 39-8l-5 22Q0 27-35 13Z" fill="#f08a6f"/><path d="m19 16 17 31 13-8-12-29" fill="#dc6c63"/></g>`,
  headphones: `<g ${stroke} fill="none"><path d="M-39 8q0-43 39-43T39 8"/><rect x="-47" y="1" width="15" height="31" rx="7" fill="#8e79d3"/><rect x="32" y="1" width="15" height="31" rx="7" fill="#8e79d3"/></g>`,
  pirate: `<g ${stroke}><path d="M-37-14q37-14 74 2L33 9Q0-1-34 9Z" fill="#34303e"/><path d="m30-8 17-13m-13 17 18 2" fill="none"/></g>`,
  star: `<path d="m0-29 8 19 21 2-16 14 5 21L0 16l-19 11 5-21-16-14 21-2Z" ${stroke} fill="#ffd35d"/>`,
  backpack: `<g ${stroke}><rect x="-31" y="-29" width="48" height="62" rx="17" fill="#70b995"/><path d="M-29-10h45M-14-29q2-13 16-2" fill="none"/></g>`,
  wings: `<g ${stroke} fill="#e8f6ff">${[1,-1].map(side => `<g transform="scale(${side} 1)"><path d="M32 12Q49-3 70-18L93-39Q101-29 92-12L84-1Q97-9 94 1 89 15 73 20 83 18 80 25 70 36 48 32L34 28Z"/><path d="M50 21Q72 9 85-12M62 26Q76 21 81 15" fill="none" stroke="#a3bfd7" stroke-width="2.5"/></g>`).join('')}</g>`,
  bunny: `<g ${stroke} fill="#fff2f5"><path d="M-24 8Q-49-39-31-42q14-2 22 44Zm32-3q4-52 21-47 15 7-7 48Z"/><path d="m-29-30 10 25m44-24-9 25" stroke="#f2a6bc" stroke-width="6"/></g>`,
  beret: `<g ${stroke}><path d="M-38 4Q-42-16-17-24 7-35 32-21 51-5 26 7L-24 14Z" fill="#d75e6d"/><path d="m-25 9 49-8-2 10-44 8Z" fill="#9b425a"/><path d="m2-26 3-9 5 1" fill="none"/></g>`,
  moonPin: `<g ${stroke}><path d="M6-22A23 23 0 1 0 23 11Q-3 15-4-5-4-16 6-22Z" fill="#ffd66e"/><path d="m18-23 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="#fff2b6"/></g>`,
  tiara: `<g ${stroke} fill="#9ddce6"><path d="m-30 7-4-23 16 9 3-20 13 14 7-25 9 26 12-12 3 19 13-8-6 23Z"/><path d="m-2-2 7-9 7 9-7 10Z" fill="#d8f8ff"/></g>`,
  neckerchief: `<g ${stroke} fill="#ec816e"><path d="M-38-10Q0 0 38-10L4 17-2 13Z"/><path d="m0 9-7 27 12-8 10 9-6-28Z"/><circle cx="4" cy="11" r="5" fill="#ffd883"/></g>`,
  ribbon: `<g ${stroke}><path d="M-38-10Q0 1 38-10l-4 9Q0 10-34-1Z" fill="#7c73cd"/><path d="M0 1v8"/><circle cy="16" r="11" fill="#ffe189"/><path d="M-4 20h8m-4 0v6" fill="none"/></g>`,
  partyHat: `<g ${stroke}><path d="m-25 17 23-51 27 50Z" fill="#9078da"/><path d="m-15-5 27 8M-5-25l11 4" stroke="#ffd15d"/><circle cy="-38" r="7" fill="#ff8eaa"/></g>`,
  antenna: `<g ${stroke} fill="none"><path d="M-20 7Q-32-19-21-31M20 7q12-26 1-38"/><circle cx="-22" cy="-35" r="7" fill="#8bd4c0"/><circle cx="22" cy="-35" r="7" fill="#8bd4c0"/></g>`,
  medal: `<g ${stroke}><path d="m-15-31 13 25 15-25M-2-6l-13-25M12-31-1-6" stroke="#5e83ce" stroke-width="9"/><circle cy="12" r="18" fill="#ffd158"/><path d="m0 1 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1Z" fill="#fff1ad" stroke="none"/></g>`,
  magicWand: `<g ${stroke}><path d="m-20 34 35-49" stroke="#7662ad" stroke-width="8"/><path d="m18-35 6 14 15 2-12 10 4 15-13-8L5 6l4-15-12-10 15-2Z" fill="#ffd45d"/></g>`,
  sailor: `<g ${stroke}><path d="M-30 4q3-28 30-28T31 4Q0-7-30 4Z" fill="white"/><path d="M-35 5Q0-8 35 5L31 16Q0 7-31 16Z" fill="#72aee5"/><circle cy="-28" r="5" fill="#72aee5"/></g>`,
}

const behindProps = new Set<Item>(['tail', 'backpack', 'wings'])
export const isBehindProp = (kind: Item) => behindProps.has(kind)

export const svgUri = (content: string, box: number) =>
  'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${box*2}" height="${box*2}" viewBox="${-box/2} ${-box/2} ${box} ${box}">${content}</svg>`)

// All face layers use ball-local coordinates. Only the face moves when the actor turns.
const line = 'stroke="#211f25" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"'
const shellEye = '<path d="M-14 5C-16-6-12-20-1-21 10-22 17-12 15 3 6 2-4 3-14 5Z"/>'
const galaxyEye = '<ellipse cy="-6" rx="13" ry="15" fill="#302b60"/><path d="M-10-13Q-5-20 1-15T8-7Q1-10-2-5T-10-2Q-5-9-10-13" fill="#615698" stroke="none"/><path d="m4-15 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z" fill="#fff5d4" stroke="none"/><circle cx="-5" cy="0" r="1.5" fill="white" stroke="none"/>'
export function eyeArt(style: Eyes, blink = false) {
  const closed = '<path d="M-12-5Q0 3 12-7" fill="none"/>'
  const shapes: Record<Eyes,string> = {
    hearts: '<path d="M0 8C-25-7-10-24 0-13 12-26 26-8 0 8Z" fill="#f881a7"/>',
    shimmer: '<ellipse cy="-5" rx="13" ry="17" fill="#7560a8"/><path d="m-3-17 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="white" stroke="none"/><circle cx="6" cy="2" r="3" fill="#edcaff" stroke="none"/>',
    spiral: '<ellipse cy="-6" rx="13" ry="14"/><path d="M9-3C13-18-9-22-9-8c-1 10 15 13 15 3 0-7-9-8-9-2q0 4 4 2" fill="none"/>',
    tears: '<path d="M-13 0q11-10 26-4" fill="none"/><path d="M-10 0q-12 13-4 14 8 0 4-14Z" fill="#97deff"/>',
    classic: shellEye, wink: shellEye, galaxy: galaxyEye,
    dots: '<circle cy="-3" r="4.7" fill="#242126" stroke="none"/>',
    wide: '<ellipse cy="-6" rx="12" ry="17"/>',
    squeeze: '<path d="m-12-17 20 12-20 9" fill="none"/>',
    droop: '<path d="M-14-8 13-13Q15 9 1 9-10 10-14-8Z"/>',
    stern: '<path d="M-14-16 14-7Q13 8 0 7-12 8-14-16Z"/>',
  }
  const left = blink ? closed : shapes[style]
  const right = blink ? closed : style === 'wink' ? closed : shapes[style]
  const gap = style === 'dots' ? 8 : 16
  return `<g fill="white" ${line}><g transform="translate(${-gap} 2)">${left}</g><g transform="translate(${gap} -1) scale(-.94 1)">${right}</g></g>`
}

const mouths: Record<Mouth,string> = {
  fang: '<path d="M-12-2Q0 4 12-3Q5 13-2 9-8 7-12-2Z" fill="#85445e"/><path d="m3 1 7-2-4 7Z" fill="white" stroke-width="1.5"/>',
  pout: '<path d="M-10 3q6-6 10-3 4-4 11-1-9 12-21 4Z" fill="#ffb6bf"/>',
  beam: '<path d="M-16-3Q0 4 16-4 11 11-2 11-13 10-16-3Z" fill="white"/>',
  whistle: '<path d="M-8-3q7 5 13-1 7 2-1 6 8 6-2 7-5-5-11-3" fill="#f5a1ae"/>',
  none: '', smile: '<path d="M-10 0Q0 11 12-2" fill="none"/>',
  laugh: '<path d="M-12-4Q0 1 14-5Q11 15 0 13-8 12-12-4Z" fill="#332737"/><path d="M-5 9Q1 4 8 7Q2 16-5 9Z" stroke="none" fill="#ff96a9"/>',
  tongue: '<path d="M-12-3Q1 5 13-4" fill="none"/><path d="M0 1 12-2Q14 12 7 13 0 14 0 1Z" fill="#ff90a8"/>',
  cat: '<path d="M-12-1Q-7 9 0 0Q8 8 13-2" fill="none"/>',
  gasp: '<ellipse rx="5" ry="8" fill="#3d303d"/>',
  frown: '<path d="M-10 4Q1-7 12 3" fill="none"/>',
  zigzag: '<path d="m-12 3 5-6 5 6 5-6 6 4" fill="none"/>',
}
export function mouthArt(style: Mouth) {
  return `<g ${line}>${mouths[style]}</g>`
}
export function faceArt(face: Face, look = 0, blink = false, eyes = expressions[face].eyes, mouth = expressions[face].mouth) {
  return `<g transform="translate(${look*2} 0)">${eyeArt(eyes,blink)}<g transform="translate(0 18)">${mouthArt(mouth)}</g></g>`
}

export const glaze = `<path d="M-49-37C-67-2-50 43-9 52 17 59 42 46 54 31A61 61 0 0 1-49-37Z" fill="#282035" opacity=".24"/>
  <path d="M6 56Q39 57 54 23Q46 45 32 48Z" fill="#fff2cf" opacity=".46"/>
  <ellipse cx="-37" cy="-37" rx="12" ry="4" transform="rotate(-49 -37 -37)" fill="white" opacity=".73"/>
  <circle cx="-48" cy="-21" r="2.4" fill="white" opacity=".85"/>
  <circle r="62" fill="none" stroke="#222126" stroke-width="3.5"/>`
