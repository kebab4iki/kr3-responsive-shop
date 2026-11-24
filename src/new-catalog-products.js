export const gamesAndGiftsId = 'games-gifts';
export const giftCardType = 'Подарочная карта';
export const gtaStandardId = 'gta-vi-ps5';

const giftCards = [5000, 10000, 25000, 50000].map((giftValue) => {
  const nominal = `${new Intl.NumberFormat('ru-RU').format(giftValue)} ₽`;
  return {
    id: `corekit-gift-${giftValue}`, categoryId: gamesAndGiftsId, brand: 'Corekit', giftValue,
    name: `Подарочная карта Corekit ${nominal}`, price: giftValue,
    summary: `Номинал ${nominal} · для покупок в Corekit`,
    description: 'Подарочная карта позволяет получателю самому выбрать технику или аксессуары в Corekit. По заявке можно уточнить способ получения карты и условия её использования.',
    specs: [['Вид товара', giftCardType], ['Номинал', nominal], ['Магазин', 'Corekit']],
  };
});

const gtaScreens = [2, 3, 4, 5, 6, 8].map((index) => ({
  filename: `gta-vi-screen-${index}.jpg`, width: 1000, height: 1000, alt: 'Кадр из GTA VI',
}));

const games = [
  {
    id: gtaStandardId, categoryId: gamesAndGiftsId, brand: 'Rockstar Games',
    name: 'GTA VI', price: 9999, summary: 'PlayStation 5 · Standard Edition · код в коробке',
    description: 'В открытом мире штата Леонида история следует за Лусией Каминос и Джейсоном Дювалем. В показанной коробке Standard Edition находится код загрузки для аккаунта PlayStation Store региона ОАЭ. Диск в упаковку не входит.',
    specs: [['Платформа', 'PlayStation 5'], ['Издание', 'Standard Edition'], ['Формат', 'Код в коробке'],
      ['Вид товара', 'Игра'], ['Регион активации', 'ОАЭ'], ['Издатель', 'Rockstar Games']],
    image: { filename: 'gta-vi-ps5-box.jpg', width: 1000, height: 1000, alt: 'Коробка GTA VI Standard Edition для PS5, регион ОАЭ' },
    gallery: gtaScreens,
  },
  {
    id: 'gta-vi-ultimate-ps5', categoryId: gamesAndGiftsId, brand: 'Rockstar Games',
    name: 'GTA VI Ultimate Edition', price: 10660, summary: 'PlayStation 5 · цифровое издание · дополнительный контент',
    description: 'Цифровое издание для PlayStation 5 включает основную игру и комплект Ultimate Edition Upgrade. В нём есть дополнительные автомобили и варианты одежды для героев, а также другие предметы, которые открываются по мере прохождения сюжета.',
    specs: [['Платформа', 'PlayStation 5'], ['Издание', 'Ultimate Edition'], ['Формат', 'Цифровое издание'],
      ['Вид товара', 'Игра'], ['Регион аккаунта', 'ОАЭ'], ['Издатель', 'Rockstar Games'],
      ['Состав', 'Основная игра и Ultimate Edition Upgrade']],
    image: gtaScreens[0], gallery: gtaScreens.slice(1),
  },
];

const consoles = [
  {
    id: 'sony-playstation-5-slim', categoryId: 'consoles', brand: 'Sony',
    name: 'PlayStation 5 Slim', price: 80999, summary: 'SSD 1 ТБ · с дисководом · Wi-Fi 6',
    description: 'Компактная версия PlayStation 5 с SSD на 1 ТБ и приводом для дисков. Подключается по HDMI 2.1 и поддерживает вывод изображения в 4K.',
    specs: [['Накопитель', 'SSD 1 ТБ'], ['Дисковод', 'В комплекте'], ['Разрешение', 'До 3840 × 2160'],
      ['Подключение к экрану', 'HDMI 2.1'], ['Беспроводная связь', 'Wi-Fi 6, Bluetooth 5.1'], ['USB-порты', '4']],
  },
  {
    id: 'sony-playstation-5-pro', categoryId: 'consoles', brand: 'Sony',
    name: 'PlayStation 5 Pro', price: 153999, summary: 'SSD 2 ТБ · Wi-Fi 7 · HDMI 2.1',
    description: 'PlayStation 5 Pro оснащена SSD на 2 ТБ и рассчитана на игры с повышенной детализацией и трассировкой лучей. Совместимый дисковод приобретается отдельно.',
    specs: [['Накопитель', 'SSD 2 ТБ'], ['Дисковод', 'Приобретается отдельно'], ['Разрешение', 'До 3840 × 2160'],
      ['Подключение к экрану', 'HDMI 2.1'], ['Беспроводная связь', 'Wi-Fi 7']],
  },
];

const coffeeMachines = [
  {
    id: 'bork-c781', categoryId: 'coffee-machines', brand: 'BORK',
    name: 'Кофемашина BORK C781', price: 45000, summary: 'Колд-брю · молотый кофе · 1 л',
    description: 'C781 готовит колд-брю, кофейный концентрат и чай. Съёмный резервуар упрощает долив воды, а на сенсорном OLED-дисплее можно настроить крепость и выбрать программу.',
    specs: [['Способ приготовления', 'Колд-брю'], ['Используемый кофе', 'Молотый'], ['Резервуар для воды', '1 л'],
      ['Мощность', '150 Вт'], ['Дисплей', 'Сенсорный OLED'], ['Кофемолка', 'Нет'], ['Автоматические программы', '4']],
  },
  {
    id: 'bork-c751', categoryId: 'coffee-machines', brand: 'BORK',
    name: 'Кофемашина BORK C751', price: 81000, summary: 'Фильтр-кофе · зерновой кофе · 80 степеней помола',
    description: 'C751 готовит фильтр-кофе из зёрен. Встроенная жерновая кофемолка даёт 80 вариантов помола, а в настройках можно выбрать объём порции. Машина поддерживает приложение BORK через Bluetooth.',
    specs: [['Способ приготовления', 'Фильтр-кофе'], ['Используемый кофе', 'Зерновой'], ['Резервуар для воды', '0,946 л'],
      ['Мощность', '1200 Вт'], ['Кофемолка', 'Жерновая, 80 степеней помола'], ['Дисплей', 'LED'], ['Цвет', 'Чёрный']],
  },
];

const ovenSpecs = [['Объём камеры', '22 л'], ['Мощность', '2400 Вт'], ['Температура', '50–230 °C'],
  ['Автоматические режимы', '11'], ['Нагревательные элементы', '5'], ['Управление', 'Электромеханическое'],
  ['Покрытие камеры', 'Нержавеющая сталь'], ['Конвекция и гриль', 'Есть']];

const ovens = [
  { id: 'bork-w555-noir', name: 'Аэропечь BORK W555 Noir', price: 54000, finish: 'Чёрный' },
  { id: 'bork-w555', name: 'Аэропечь BORK W555', price: 48000, finish: 'Серебристый' },
].map(({ finish, ...model }) => ({
  ...model, categoryId: 'mini-ovens', brand: 'BORK', summary: `22 л · 2400 Вт · ${finish.toLowerCase()}`,
  description: 'Настольная аэропечь с конвекцией и кварцевым грилем. Можно выбрать одну из 11 программ, в том числе для пиццы, выпечки, тостов и аэрогриля. На LCD-дисплее отображаются режим, температура и время.',
  specs: [...ovenSpecs, ['Цвет', finish]],
}));

export const newCatalogProducts = [...giftCards, ...games, ...consoles, ...coffeeMachines, ...ovens];
