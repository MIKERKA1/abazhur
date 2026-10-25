// Everything a visitor reads about the club lives here, so prices, hardware and hours stay consistent
// across the page, the booking form and the tests. The club is fictional; see README → «Демо-данные».

export const site = {
  name: 'Абажур',
  title: 'Абажур — компьютерный клуб-лаунж у Китай-города',
  description:
    'Компьютерный клуб-лаунж в центре Москвы: 25 игровых ПК с RTX 5070 и 5080, буткемп на пятерых, комнаты с PlayStation 5 Pro. От 190 ₽ в час, открыто круглосуточно.',
  address: { street: 'Лампадный переулок, 7', city: 'Москва', metro: '6 минут пешком от «Китай-города», выход 9' },
  phone: { display: '+7 (000) 123-45-67', href: 'tel:+70001234567' },
  email: 'hello@abazhur.example',
  hours: [
    ['Зал и буткемп', 'круглосуточно'],
    ['Комнаты с PS5', '10:00–04:00'],
    ['Бар', '12:00–02:00'],
  ],
} as const;

export const nav = [
  { href: '/#zony', label: 'Зоны' },
  { href: '/#zhelezo', label: 'Железо' },
  { href: '/#ceny', label: 'Цены' },
  { href: '/#vizit', label: 'Первый визит' },
  { href: '/#kontakty', label: 'Контакты' },
] as const;

export type ZoneId = 'hall' | 'camp' | 'room';

export interface Zone {
  id: ZoneId;
  tab: string;
  title: string;
  text: string;
  /** What one unit of the price buys: a seat or a whole room. */
  unit: string;
  /** ₽ per hour: weekday daytime and everything else. */
  day: number;
  evening: number;
  photo: 'player' | 'friends' | 'console';
  photoAlt: string;
}

export const zones: Zone[] = [
  {
    id: 'hall',
    tab: 'Зал',
    title: 'Общий зал на 20 мест',
    text: 'Столы стоят островками по четыре, над каждым своя лампа. Подойдёт, если вы пришли один или вдвоём и хотите просто поиграть пару часов. Компьютеры с RTX 5070 и мониторами 27″ на 240 Гц.',
    unit: 'за место',
    day: 190,
    evening: 250,
    photo: 'player',
    photoAlt: 'Игрок в наушниках за компьютером в полутёмном зале',
  },
  {
    id: 'camp',
    tab: 'Буткемп',
    title: 'Буткемп на пятерых',
    text: 'Отдельная комната с дверью для команды: пять одинаковых мест в ряд, общий голосовой чат без соседей за спиной. Железо мощнее, чем в зале: RTX 5080 и мониторы на 360 Гц. Можно занять одно место или всю комнату.',
    unit: 'за место',
    day: 290,
    evening: 350,
    photo: 'friends',
    photoAlt: 'Компания друзей радуется за спиной у игрока',
  },
  {
    id: 'room',
    tab: 'Комнаты с PS5',
    title: 'Две комнаты с PlayStation 5 Pro',
    text: 'Диван на четверых, телевизор 65″ и четыре геймпада. EA Sports FC, Mortal Kombat 1, It Takes Two и ещё сорок игр. Цена за всю комнату, а не за каждого гостя.',
    unit: 'за комнату до 4 человек',
    day: 900,
    evening: 1200,
    photo: 'console',
    photoAlt: 'Две пары рук с геймпадами перед телевизором',
  },
];

export const zoneById = (id: string): Zone | undefined => zones.find((z) => z.id === id);

/**
 * Seats on the plan. Hall islands hold four seats each; the bootcamp is one row; rooms are bookable whole.
 * Hall seats are plain numbers: a Cyrillic «З» prefix reads as the digit 3 at small sizes.
 */
export const seats: Record<ZoneId, string[]> = {
  hall: Array.from({ length: 20 }, (_, i) => `${i + 1}`),
  camp: Array.from({ length: 5 }, (_, i) => `Б${i + 1}`),
  room: ['К1', 'К2'],
};

/** Fixed-price packages. Hall: 3 h, 5 h and the night; bootcamp: the night only; rooms: none. */
export const packages = {
  hall: { 3: 650, 5: 1000, night: 900 },
  camp: { night: 1300 },
  room: {},
} as const satisfies Record<ZoneId, Partial<Record<3 | 5 | 'night', number>>>;

export const NIGHT = { start: 23, hours: 9, label: 'Ночь 23:00–08:00' } as const;
export const DAY_HOURS = { from: 10, to: 17 } as const;

export const rub = (n: number): string => `${n.toLocaleString('ru-RU')} ₽`;

export interface GearRow {
  name: string;
  value: string;
  note: string;
}

export const gear: { group: string; rows: GearRow[] }[] = [
  {
    group: 'Компьютер в зале',
    rows: [
      { name: 'Видеокарта', value: 'RTX 5070', note: 'Новые игры на высоких настройках в разрешении 2K.' },
      { name: 'Процессор', value: 'Ryzen 7 9700X', note: 'Не проседает, даже когда рядом открыты Discord и браузер.' },
      { name: 'Память', value: '32 ГБ', note: 'Вдвое больше, чем просят требования большинства игр.' },
    ],
  },
  {
    group: 'Компьютер в буткемпе',
    rows: [
      { name: 'Видеокарта', value: 'RTX 5080', note: 'Запас мощности для 360 кадров в соревновательных играх.' },
      { name: 'Процессор', value: 'Ryzen 7 9800X3D', note: 'Ровная частота кадров без внезапных подтормаживаний.' },
      { name: 'Монитор', value: '25″, 360 Гц', note: 'Как на турнирах: маленький экран, всё поле перед глазами.' },
    ],
  },
  {
    group: 'На каждом столе',
    rows: [
      { name: 'Монитор в зале', value: '27″, 240 Гц', note: 'Картинка в четыре раза плавнее, чем на обычном офисном мониторе.' },
      { name: 'Клавиатура', value: 'механическая', note: 'Чёткое нажатие, клавиши не залипают.' },
      { name: 'Мышь', value: '60 г', note: 'Лёгкая, рука не устаёт за вечер.' },
      { name: 'Наушники', value: 'с микрофоном', note: 'Амбушюры протираем после каждого гостя, есть одноразовые чехлы.' },
      { name: 'Кресло', value: 'по росту', note: 'Высота, наклон и подлокотники настраиваются.' },
    ],
  },
  {
    group: 'Игры',
    rows: [
      { name: 'Установлено', value: '70+ игр', note: 'Steam, Epic, Battle.net, Riot и EA: входите в свой аккаунт.' },
      { name: 'Обновления', value: 'каждое утро', note: 'Не придётся ждать патч перед игрой.' },
    ],
  },
];

export const firstVisit: { group: string; rows: [string, string][] }[] = [
  {
    group: 'Перед выходом',
    rows: [
      ['Забронировать место на сайте или по телефону', '1 мин'],
      ['Или прийти без брони: днём места есть почти всегда', '0 мин'],
    ],
  },
  {
    group: 'У стойки',
    rows: [
      ['Назвать имя, на которое бронировали', '1 мин'],
      ['Администратор включит компьютер и покажет, где что', '2 мин'],
    ],
  },
  {
    group: 'За столом',
    rows: [
      ['Войти в свой Steam или выбрать игру из установленных', '2 мин'],
      ['Нужна помощь или ещё час: кнопка «Позвать» на экране', 'в любой момент'],
      ['Оплатить на выходе картой, по СБП или наличными', 'за фактическое время'],
    ],
  },
];

export const faq: [string, string][] = [
  ['Нужно ли бронировать заранее?', 'Днём в будни почти всегда есть свободные места. Вечером пятницы и в выходные лучше забронировать: бронь держим 15 минут после начала.'],
  ['Я ни разу не был в компьютерном клубе. Разберусь?', 'Да. Администратор включит компьютер, покажет, как войти в игру и где кнопка вызова. Спрашивать можно о чём угодно, это нормально.'],
  ['Нужен свой аккаунт в Steam?', 'Для своих покупок нужен. Бесплатные игры вроде CS2, Dota 2, Valorant и Fortnite можно запустить с нашего аккаунта, если своего нет.'],
  ['Можно со своей мышкой или клавиатурой?', 'Можно. Подключим за минуту, а на выходе напомним забрать.'],
  ['Как платить?', 'На выходе, за фактическое время: картой, по СБП или наличными. Депозитов и клубных карт нет.'],
  ['Можно ли отменить бронь?', 'Да, бесплатно и в любой момент: позвоните или напишите. Если опаздываете, предупредите, подержим место дольше.'],
  ['С какого возраста можно?', 'С 14 лет. Гостям младше 18 лет можно до 22:00, ночные пакеты только для совершеннолетних, поэтому на ночь возьмите паспорт.'],
  ['Что такое буткемп?', 'Отдельная комната для команды из пяти человек: все сидят рядом, никто посторонний не слышит ваш голосовой чат.'],
  ['Есть ли еда?', 'На баре чай, кофе, лимонады, горячие сэндвичи и снеки. Алкоголь не продаём. Еду можно брать к столу, для этого у каждого места есть полка.'],
  ['Можно продлить время?', 'Да, кнопкой на экране или у стойки, если место не забронировано следующим гостем. Продлеваем по 30 минут.'],
];
