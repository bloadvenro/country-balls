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
  doctorCap: `<g ${stroke}>
    <path d="M-34 5l-2-24c-1-8 10-12 32-13 18-1 35 2 37 9l-2 26q-30 11-65 2Z" fill="#fffdfa"/>
    <path d="M-33-3Q-3 1 32-7l-1 12q-32 10-64 3Z" fill="#e1f1f1"/>
    <path d="m-1-25 7-1v6l6-1v7l-6 1v6l-7 1v-6h-6v-7l6-1Z" fill="#298981" stroke="none"/>
    <path d="M-28-19q1-4 9-5" fill="none" stroke="#bad9da" stroke-width="2.5"/>
  </g>`,
  doctorMask: `<g ${stroke}>
    <path d="M-22-7q-18-13-19-3-1 12 21 17m40-15q18-13 19-4 3 12-17 20" fill="none"/>
    <path d="M-26-10q10 2 20-2 7-4 12-1 8 3 17 1l-2 18q-8 11-21 13-14-2-23-12Z" fill="#fffdfa"/>
    <path d="M-18-4q16 6 33-1m-32 8q16 6 30-1" fill="none" stroke="#a0c5ca" stroke-width="2.4"/>
  </g>`,
  anesthesiaMask: `<g ${stroke}>
    <path d="M-9-12q4-7 10-7 5 0 9 6l10 16q5 9-3 13-16 8-33 1-7-3-5-10Z" fill="#c5f0ea" fill-opacity=".55" stroke="#34636c" stroke-width="5"/>
    <path d="M-9-12q4-7 10-7 5 0 9 6l10 16q5 9-3 13-16 8-33 1-7-3-5-10Z" fill="none" stroke="#83d8c8" stroke-width="2.6"/>
    <path d="M-12-1l5-8q2-4 5-4" fill="none" stroke="#f3fffe" stroke-width="3"/>
    <path d="M3 8q8 14 20 15 11 1 14 8l3 8" fill="none" stroke-width="9"/>
    <path d="M3 8q8 14 20 15 11 1 14 8l3 8" fill="none" stroke="#a6dce1" stroke-width="5.5"/>
    <path d="m10 14-3 4m9-1-2 5m10-2-1 6m9-4-3 5m9 0-5 3m8 2-5 2" fill="none" stroke="#558e9a" stroke-width="2"/>
    <ellipse cx="2" cy="8" rx="8" ry="6.5" transform="rotate(27 2 8)" fill="#63c4bb" stroke-width="2.5"/>
  </g>`,
  doctorHeadMirror: `<g ${stroke}>
    <path d="M-45-6Q-1 4 45-7l7 12Q1 19-52 6Z" fill="#fffdfa"/>
    <path d="M-43 3q18 4 37 4m32-2 17-3" fill="none" stroke="#b6cdcf" stroke-width="2"/>
    <circle cx="11" cy="-3" r="15" fill="#bdcbd3"/><circle cx="11" cy="-3" r="11.7" fill="#e2f3f6" stroke="#7c96a5" stroke-width="1.8"/>
    <path d="M3-6q2-5 7-6" fill="none" stroke="white" stroke-width="3.5"/>
    <circle cx="11" cy="-3" r="2.8" fill="#516775" stroke="none"/>
  </g>`,
  syringe: `<g transform="rotate(34)" ${stroke}>
    <path d="M0-27v-11" fill="none" stroke="#506775" stroke-width="2.4"/>
    <path d="M-4-18v-9h8v9M-4 14v16h8V14" fill="#b9ced4"/>
    <rect x="-10" y="-19" width="20" height="37" rx="4" fill="#ecfafb"/>
    <path d="M-8-3Q0-6 8-3v17H-8Z" fill="#71cfc9" stroke="none"/>
    <path d="M8-12H3m5 6H5m3 6H3" fill="none" stroke-width="2"/>
    <path d="M-14 18h28" fill="none"/><rect x="-11" y="29" width="22" height="6" rx="3" fill="#a6dfda"/>
  </g>`,
  scalpel: `<g transform="rotate(-34)" ${stroke}>
    <path d="M-5 2v-16q0-15 13-25 3 23-1 33L3 2Z" fill="#d9ecf0"/>
    <path d="M0-7q5-8 6-17" stroke="#92b3c1" stroke-width="2" fill="none"/>
    <path d="M-5-2h10l2 32q0 7-7 7t-7-7Z" fill="#67b7b1"/>
    <path d="m-2 6 4-2m-4 8 4-2m-4 8 4-2" stroke="#316e74" stroke-width="2"/>
  </g>`,
  stethoscope: `<g ${stroke} fill="none">
    <path d="M-43-21q-8 27 7 36 17 9 21-6 5-15 1-31" stroke-width="6"/>
    <path d="M-43-21q-8 27 7 36 17 9 21-6 5-15 1-31" stroke="#c2d9df" stroke-width="3"/>
    <path d="M-30 17q0 18 17 20 16 1 24-14 8-13 16-8 7 3 6 11" stroke-width="8"/>
    <path d="M-30 17q0 18 17 20 16 1 24-14 8-13 16-8 7 3 6 11" stroke="#318a87" stroke-width="4"/>
    <path d="m-45-20 4-4m26 1 4 3" stroke-width="8"/>
    <circle cx="33" cy="29" r="9" fill="#a8c9d1"/><circle cx="33" cy="29" r="4.5" fill="#e7f6f5" stroke-width="1.8"/>
  </g>`,
  diaper: `<g ${stroke}>
    <path d="M-55-15Q-1-3 55-15q-2 12-9 21-15-1-21 12-9 8-25 8-17 0-25-8-6-13-21-12-7-9-9-21Z" fill="#fffaf0"/>
    <path d="M-55-15Q-1-3 55-15l-3 9Q2 7-52-6Z" fill="#d6efeb" stroke-width="2.5"/>
    <path d="M-46 1q15 1 21 14m71-14q-15 1-21 14" fill="none" stroke="#a6c9c6" stroke-width="2.6" stroke-dasharray="3 4"/>
    <g fill="#91cecb" stroke="#618d96" stroke-width="2"><rect x="-45" y="-9" width="15" height="8" rx="3" transform="rotate(12 -38 -5)"/><rect x="30" y="-9" width="15" height="8" rx="3" transform="rotate(-12 37 -5)"/></g>
    <path d="m0 3 2.4 4.8 5.3.8-3.9 3.8.9 5.3L0 15.2l-4.7 2.5.9-5.3-3.9-3.8 5.3-.8Z" fill="#ffd57d" stroke="#cd9f60" stroke-width="1.5"/>
  </g>`,
  policeCap: `<g ${stroke}>
    <path d="M-34-1Q-50-10-42-19q5-8 20-9l21-4q12-3 23 1l20 9q10 5 6 12L30 0Z" fill="#4979b5"/>
    <path d="M-34-7Q-3-1 34-11l-4 14Q-3 12-31 6Z" fill="#263a60"/>
    <path d="M-30 0Q0 6 31-4" fill="none" stroke="#efc263" stroke-width="3"/>
    <path d="M-21 8Q2 10 30 1l12 1q6 2-2 7-21 13-47 7Z" fill="#243044"/>
    <path d="M-2-21q6 2 11-2l3 6q0 8-8 12-8-2-10-9Z" fill="#ffd66d" stroke-width="2.2"/>
    <path d="M-34-18q7-5 17-5" fill="none" stroke="#8bb2db" stroke-width="3"/>
  </g>`,
  policeBadge: `<g ${stroke}>
    <path d="M0-19q7 6 15 5l2 9Q17 9 1 20-14 14-17-1l1-13q9 1 16-5Z" fill="#f6bd50"/>
    <path d="M0-14q6 4 11 4l1 7Q12 7 1 15-9 10-12 0l1-10q5 0 11-4Z" stroke="#bc7d35" stroke-width="1.8" fill="#ffe59a"/>
    <path d="m0-8 2.6 5.1 5.7.8-4.2 4.1 1 5.7L0 5l-5.1 2.7 1-5.7-4.2-4.1 5.7-.8Z" fill="#47658e" stroke="none"/>
  </g>`,
  radio: `<g transform="rotate(10)" ${stroke}>
    <rect x="-11" y="-38" width="5" height="21" rx="2.5" fill="#42475a"/>
    <rect x="4" y="-24" width="7" height="8" rx="2" fill="#728197"/>
    <rect x="-15" y="-19" width="31" height="47" rx="7" fill="#465770"/>
    <rect x="-10" y="-12" width="21" height="13" rx="3" fill="#b7eadd" stroke-width="2"/>
    <path d="M-7-4h3m2 0v-3m4 3v-5" fill="none" stroke="#498d89" stroke-width="2"/>
    <rect x="-18" y="-7" width="5" height="12" rx="2" fill="#f4ba64" stroke-width="2"/>
    <path d="M-7 10H8m-15 5H8m-15 5H3" fill="none" stroke="#26384c" stroke-width="2.8"/>
  </g>`,
  fireHelmet: `<g ${stroke}>
    <path d="M-40 0q2-24 20-30 23-9 40 4Q33-17 35-4l10 5-9 7-73 2Z" fill="#eb5950"/>
    <path d="M-24-4q3-18 14-25m-1 23q4-17 2-23" fill="none" stroke="#bc3e41" stroke-width="3"/>
    <path d="M-14-29q5-7 15-6l11 4-1 5q-12-4-22 2Z" fill="#ff9b72" stroke-width="2.5"/>
    <path d="M-42-2Q-6 6 35-5l12 3q4 4-4 7-40 12-85 7l-8-2q-3-3 8-12Z" fill="#c94543"/>
    <path d="M-37 5Q-6 11 31 1" fill="none" stroke="#ffd477" stroke-width="3"/>
    <path d="M11-24q5 3 12 0l1 10q-1 6-7 9-7-2-9-8Z" fill="#ffda73" stroke-width="2.2"/>
    <path d="M17-21q1 4 4 7 1 4-3 5-6 1-6-4 0-2 3-5l1 3q2-2 1-6Z" fill="#cc5140" stroke="none"/>
  </g>`,
  fireCoat: `<g ${stroke}>
    <path d="M-54-16q11-4 21-2 11 6 32 9 18-2 34-9 12-2 21 2l4 16-11 9-6-3q-9 13-22 18-19 6-38 0-13-5-22-18l-6 3-11-9Z" fill="#d68b49"/>
    <path d="m-52-9 11 11m93-11L41 2" fill="none" stroke="#ffdf78" stroke-width="5"/>
    <path d="M-44-1q19 12 43 13Q24 12 44-1l-4 9Q22 21 0 21-23 20-40 8Z" fill="#ffdf78" stroke="none"/>
    <path d="M-40 5Q0 29 40 5" fill="none" stroke="#f4f3d9" stroke-width="2"/>
    <path d="M-33-18q16 6 31 7l-8 8-20-8Zm66 0q-16 6-30 7l8 8 19-8Z" fill="#584b4c" stroke-width="2"/>
    <path d="M0-9v34" fill="none" stroke-width="2.6"/>
    <path d="m-31-2 10 4m40 0 10-4" fill="none" stroke="#845631" stroke-width="2.6"/>
  </g>`,
  extinguisher: `<g transform="rotate(6)" ${stroke}>
    <path d="M3-21q16-7 17 10l1 14" fill="none" stroke-width="4"/>
    <path d="m18-1 5-1 5 13-8 2Z" fill="#455266" stroke-width="2.5"/>
    <path d="M-6-16v-9h9v9" fill="#a3b5bb"/>
    <path d="m-8-24 2-5 16-5 1 5-10 4 11 2-1 4Z" fill="#43546a" stroke-width="2.5"/>
    <rect x="-15" y="-17" width="29" height="48" rx="12" fill="#ed6259"/>
    <path d="M-9-8q-1 3-1 7" fill="none" stroke="#ffaaa0" stroke-width="3"/>
    <rect x="-11" y="2" width="21" height="13" rx="3" fill="#fff2d1" stroke-width="1.7"/>
    <path d="M0 4q4 4 4 6a4 4 0 0 1-8 0q0-2 4-6Z" fill="#559ba7" stroke="none"/>
    <path d="M-10 28q9 3 19 0" fill="none" stroke="#ac4544" stroke-width="3"/>
  </g>`,
}

const behindProps = new Set<Item>(['tail', 'backpack', 'wings'])
export const isBehindProp = (kind: Item) => behindProps.has(kind)

export const svgUri = (content: string, box: number) =>
  'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${box*2}" height="${box*2}" viewBox="${-box/2} ${-box/2} ${box} ${box}">${content}</svg>`)

// Saved accessory positions use the workshop view (facing right, looking straight ahead).
export const faceX = (facing: -1 | 1 = 1, look = 0) => 10 * facing + 2 * look
const faceProps = new Set<Item>(['glasses', 'moustache', 'pirate', 'doctorMask', 'anesthesiaMask'])
export const faceAccessoryShift = (kind: Item, x: number) => faceProps.has(kind) ? x - faceX() : 0

const line = 'stroke="#211f25" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"'
const shellEye = '<path d="M-14 5C-16-6-12-20-1-21 10-22 17-12 15 3 6 2-4 3-14 5Z"/>'
const galaxyEye = '<ellipse cy="-6" rx="13" ry="15" fill="#302b60"/><path d="M-10-13Q-5-20 1-15T8-7Q1-10-2-5T-10-2Q-5-9-10-13" fill="#615698" stroke="none"/><path d="m4-15 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z" fill="#fff5d4" stroke="none"/><circle cx="-5" cy="0" r="1.5" fill="white" stroke="none"/>'
export function eyeArt(style: Eyes, blink = false) {
  const closed = '<path d="M-12-5Q0 3 12-7" fill="none"/>'
  const shapes: Record<Eyes,string> = {
    hearts: '<path d="M0 8C-25-7-10-24 0-13 12-26 26-8 0 8Z" fill="#f881a7"/>',
    shimmer: '<ellipse cy="-5" rx="13" ry="17" fill="#7560a8"/><path d="m-3-17 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="white" stroke="none"/><circle cx="6" cy="2" r="3" fill="#edcaff" stroke="none"/>',
    spiral: '<ellipse cy="-6" rx="13" ry="14"/><path d="M9-3C13-18-9-22-9-8c-1 10 15 13 15 3 0-7-9-8-9-2q0 4 4 2" fill="none"/>',
    streams: '<path d="M-13-5q10-10 23 0l-1 4q-13-6-22 1Z" fill="#383443"/><path d="M-13-2q6-4 11-1 2 8-2 17-4 9-3 16-1 5-6 4-6-1-5-8 0-8 4-16 3-8 1-12Z" fill="#64c8fa" stroke="#396d94" stroke-width="1.7"/><path d="M-8 2q2 7-3 17" fill="none" stroke="#d9f7ff" stroke-width="2.6"/>',
    tears: '<path d="M-13 0q11-10 26-4" fill="none"/><path d="M-10 0q-12 13-4 14 8 0 4-14Z" fill="#97deff"/>',
    classic: shellEye, wink: shellEye, resting: closed, galaxy: galaxyEye,
    dots: '<circle cy="-3" r="4.7" fill="#242126" stroke="none"/>',
    wide: '<ellipse cy="-6" rx="12" ry="17"/>',
    squeeze: '<path d="m-12-17 20 12-20 9" fill="none"/>',
    droop: '<path d="M-14-8 13-13Q15 9 1 9-10 10-14-8Z"/>',
    stern: '<path d="M-14-16 14-7Q13 8 0 7-12 8-14-16Z"/>',
  }
  const closeEyes = blink && style !== 'streams' && style !== 'tears'
  const left = closeEyes ? closed : shapes[style]
  const right = closeEyes ? closed : style === 'wink' ? closed : shapes[style]
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
  breathing: '<ellipse cy="2" rx="5.4" ry="3.8" fill="#5d3e50"/><path d="M-2.5 3.5q2.5-1.2 5 .1" fill="none" stroke="#e9a1ab" stroke-width="1.5"/>',
  frown: '<path d="M-10 4Q1-7 12 3" fill="none"/>',
  zigzag: '<path d="m-12 3 5-6 5 6 5-6 6 4" fill="none"/>',
  gritted: '<path d="M-12 0q1-7 8-6l11 1q6 1 5 8-1 5-6 4l-12-1q-6 0-6-6Z" fill="#fff9e7"/><path d="m-10 0 20 2m-13-6v4m7 2v4" stroke="#937b79" stroke-width="1.4" fill="none"/>',
}
export function mouthArt(style: Mouth) {
  return `<g ${line}>${mouths[style]}</g>`
}
const fist = `<path d="M-9 5q-4-5-3-12 1-5 5-4 3-5 7-2 5-2 7 3 5 0 5 5v5q0 7-7 10-8 2-14-5Z" fill="#f7d09c"/>
  <path d="m-7-9 1 5m5-8 1 6m5-4 1 5m5 1q-2-4-6-3l-6 3q-2 3 1 5 2 1 6-1" fill="none" stroke-width="1.7"/>`
export const strainingHands = [-1, 1].map(side =>
  `<g transform="translate(${side * 32} 19) scale(${-side} 1) rotate(-12)" ${line}>${fist}</g>`).join('')
const flushedCheeks = '<g fill="#f58c8e" opacity=".86"><ellipse cx="-23" cy="8" rx="8" ry="4"/><ellipse cx="23" cy="8" rx="8" ry="4"/></g>'

export function faceArt(face: Face, blink = false, eyes = expressions[face].eyes, mouth = expressions[face].mouth, drawHands = true) {
  const strain = face === 'straining'
  return `${strain ? flushedCheeks : ''}${eyeArt(eyes,blink && !strain)}<g transform="translate(0 18)">${mouthArt(mouth)}</g>${strain && drawHands ? strainingHands : ''}`
}

export const glaze = `<path d="M-49-37C-67-2-50 43-9 52 17 59 42 46 54 31A61 61 0 0 1-49-37Z" fill="#282035" opacity=".24"/>
  <path d="M6 56Q39 57 54 23Q46 45 32 48Z" fill="#fff2cf" opacity=".46"/>
  <ellipse cx="-37" cy="-37" rx="12" ry="4" transform="rotate(-49 -37 -37)" fill="white" opacity=".73"/>
  <circle cx="-48" cy="-21" r="2.4" fill="white" opacity=".85"/>
  <circle r="62" fill="none" stroke="#222126" stroke-width="3.5"/>`
