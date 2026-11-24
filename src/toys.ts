export const faces = {
  smile: 'Улыбка',
  laugh: 'Смех',
  surprise: 'Удивление',
  sleepy: 'Сонная мордочка',
  happy: 'Радость',
  sad: 'Грусть',
  angry: 'Сердитая',
  shy: 'Смущение',
  cheeky: 'Озорная',
  worried: 'Встревоженная',
  adoring: 'Влюблённая',
  dazzled: 'Восторг',
  dizzy: 'Голова кругом',
} as const

export const items = {
  ears: 'Кошачьи ушки',
  tail: 'Кошачий хвостик',
  bow: 'Бант',
  crown: 'Корона',
  glasses: 'Очки',
  topHat: 'Цилиндр',
  cap: 'Кепка',
  flower: 'Цветок',
  moustache: 'Усы',
  scarf: 'Шарф',
  headphones: 'Наушники',
  pirate: 'Пиратская повязка',
  star: 'Звёздочка',
  backpack: 'Рюкзак',
  wings: 'Крылышки',
  partyHat: 'Праздничный колпак',
  antenna: 'Антенки',
  medal: 'Медаль',
  magicWand: 'Волшебная палочка',
  sailor: 'Матросская шапочка',
  bunny: 'Заячьи ушки', beret: 'Берет художника', moonPin: 'Лунная заколка',
  tiara: 'Ледяная диадема', neckerchief: 'Пионерский платок', ribbon: 'Лента с колокольчиком',
} as const

export type Face = keyof typeof faces
export type Item = keyof typeof items

const anchors: Record<Item, [number, number]> = {
  ears: [0, -40], tail: [61, 8], bow: [29, -42], crown: [0, -50], glasses: [2, -2],
  topHat: [0, -53], cap: [3, -48], flower: [47, 22], moustache: [2, 19], scarf: [0, 48],
  headphones: [0, -5], pirate: [2, -7], star: [42, -31], backpack: [-52, 11],
  wings: [0, 5], partyHat: [4, -53], antenna: [0, -51], medal: [0, 45],
  magicWand: [49, 21], sailor: [0, -49],
  bunny: [0, -47], beret: [-5, -48], moonPin: [31, -39], tiara: [0, -48], neckerchief: [0, 42], ribbon: [0, 44],
}

export function itemAnchor(kind: Item): [number, number] {
  return [...anchors[kind]]
}

export const eyeStyles = {
  hearts: 'Сердечки', shimmer: 'Сияние', spiral: 'Спиральки', tears: 'Слёзки',
  classic: 'Белые', galaxy: 'Галактики', dots: 'Точки', squeeze: 'Зажмуренные',
  droop: 'Сонные', wink: 'Подмигивание', stern: 'Сердитые', wide: 'Круглые',
} as const
export const mouthStyles = {
  fang: 'Клычок', pout: 'Надутые губки', beam: 'До ушей', whistle: 'Свисток',
  none: 'Без рта', smile: 'Улыбка', laugh: 'Хохот', tongue: 'Язычок',
  cat: 'Кошачий', gasp: 'Удивление', frown: 'Хмурый', zigzag: 'Зигзаг',
} as const
export type Eyes = keyof typeof eyeStyles
export type Mouth = keyof typeof mouthStyles
export const expressions: Record<Face, { eyes: Eyes; mouth: Mouth }> = {
  smile: { eyes: 'classic', mouth: 'smile' }, laugh: { eyes: 'squeeze', mouth: 'laugh' },
  surprise: { eyes: 'wide', mouth: 'gasp' }, sleepy: { eyes: 'droop', mouth: 'none' },
  happy: { eyes: 'classic', mouth: 'cat' }, sad: { eyes: 'droop', mouth: 'frown' },
  angry: { eyes: 'stern', mouth: 'zigzag' }, shy: { eyes: 'dots', mouth: 'smile' },
  cheeky: { eyes: 'wink', mouth: 'tongue' }, worried: { eyes: 'wide', mouth: 'zigzag' },
  adoring: { eyes: 'hearts', mouth: 'cat' }, dazzled: { eyes: 'shimmer', mouth: 'beam' },
  dizzy: { eyes: 'spiral', mouth: 'gasp' },
}
