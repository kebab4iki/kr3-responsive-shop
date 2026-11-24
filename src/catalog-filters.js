import { catalogProducts, findCategory } from './catalog-data';
import { gamesAndGiftsId } from './new-catalog-products';

const collation = new Intl.Collator('ru', { numeric: true, sensitivity: 'base' });
const brandLabels = {
  '8bitdo': '8BitDo', adata: 'ADATA', aoc: 'AOC', asus: 'ASUS', hp: 'HP', huawei: 'HUAWEI',
  iphone: 'Apple', jbl: 'JBL', lg: 'LG', sandisk: 'SanDisk', tp: 'TP-Link', ugreen: 'UGREEN', wd: 'WD',
};

const bySpec = (key) => (spec) => spec(key);
const diagonal = (key) => (spec) => spec(key)?.match(/^\d+(?:[,.]\d+)?″/)?.[0];

const categoryFields = {
  phones: [
    ['storage', 'Встроенная память', (spec) => (spec('Память (ОЗУ/ПЗУ)') ?? spec('Память'))?.split('/').at(-1).trim()],
    ['screen', 'Диагональ', diagonal('Дисплей')],
  ],
  laptops: [
    ['screen', 'Диагональ', diagonal('Экран')],
    ['ram', 'Оперативная память', (spec) => spec('Память')?.match(/\d+\s*ГБ/)?.[0]],
  ],
  monitors: [
    ['resolution', 'Разрешение', bySpec('Разрешение экрана')],
    ['matrix', 'Тип матрицы', bySpec('Тип матрицы')],
  ],
  watches: [['screen', 'Тип экрана', (spec) => spec('Экран')?.match(/\b(?:Super AMOLED|AMOLED|OLED)\b/)?.[0]]],
  headphones: [['type', 'Тип конструкции', bySpec('Тип конструкции')]],
  speakers: [['battery', 'Время работы', (spec) => spec('Время работы')?.toLowerCase()]],
  peripherals: [['connection', 'Подключение', bySpec('Подключение')]],
  gaming: [['compatibility', 'Совместимость', (spec) => spec('Совместимость')?.split(', ')]],
  storage: [['interface', 'Интерфейс', (spec) => spec('Интерфейс')?.match(/^(USB|PCIe)/)?.[0]]],
  power: [['power', 'Мощность', (spec) => spec('Выходная мощность') ?? spec('Мощность')]],
  network: [['wifi', 'Поколение Wi-Fi', (spec) => {
    const generation = spec('Стандарты Wi-Fi')?.match(/\d(?= \(802\.11)/g)?.at(-1);
    return generation && `Wi-Fi ${generation}`;
  }]],
  printers: [['print', 'Тип печати', (spec) => spec('Скорость цв. печати') ? 'Цветная' : spec('Печать')?.replace(/^ч/, 'Ч')]],
  [gamesAndGiftsId]: [
    ['type', 'Вид товара', bySpec('Вид товара')],
    ['edition', 'Издание', bySpec('Издание')],
    ['nominal', 'Номинал', bySpec('Номинал')],
  ],
  consoles: [['storage', 'Накопитель', bySpec('Накопитель')], ['drive', 'Дисковод', bySpec('Дисковод')]],
  'coffee-machines': [['method', 'Способ приготовления', bySpec('Способ приготовления')], ['coffee', 'Используемый кофе', bySpec('Используемый кофе')]],
  'mini-ovens': [['finish', 'Цвет', bySpec('Цвет')]],
};

const items = catalogProducts.map((product) => {
  const prefix = product.id.split('-')[0];
  const brand = product.brand ?? brandLabels[prefix] ?? prefix[0].toUpperCase() + prefix.slice(1);
  const specs = new Map(product.specs);
  const fields = (categoryFields[product.categoryId] ?? []).map(([id, , read]) => {
    const value = read((label) => specs.get(label));
    return [id, [value ?? []].flat()];
  });
  return { product, brand, values: Object.fromEntries(fields), name: product.name.toLocaleLowerCase('ru') };
});

function sortedUnique(values) {
  return [...new Set(values)].sort(collation.compare);
}

export const defaultFilters = {
  search: '', category: 'all', brand: '', from: '', to: '', hit: false, fresh: false,
  sort: 'default', specs: {},
};

export function catalogFilterOptions(category) {
  const relevant = items.filter(({ product }) => category === 'all' || product.categoryId === category);
  const brands = sortedUnique(relevant.map(({ brand }) => brand));
  const specs = (categoryFields[category] ?? []).map(([id, label]) => ({
    id, label, options: sortedUnique(relevant.flatMap(({ values }) => values[id])),
  })).filter(({ options }) => options.length > 0);
  return { brands, specs };
}

export function filtersFromUrl(query) {
  const category = findCategory(query.get('category'))?.id ?? defaultFilters.category;
  const options = catalogFilterOptions(category);
  const requestedBrand = query.get('brand')?.trim().toLocaleLowerCase('ru');
  const brand = options.brands.find((name) => name.toLocaleLowerCase('ru') === requestedBrand) ?? '';
  const specs = Object.fromEntries(options.specs.flatMap(({ id, options: values }) => {
    const value = query.get(id);
    return values.includes(value) ? [[id, value]] : [];
  }));
  return { ...defaultFilters, category, brand, specs };
}

export function filterCatalog({ search, category, brand, from, to, hit, fresh, sort, specs }) {
  const term = search.trim().toLocaleLowerCase('ru');
  const minimum = from === '' ? -Infinity : Math.max(0, Number(from));
  const maximum = to === '' ? Infinity : Math.max(0, Number(to));
  const constraints = Object.entries(specs).filter(([, value]) => value !== '');
  const matches = items.filter(({ product, name, brand: itemBrand, values }) =>
    name.includes(term)
    && (category === 'all' || product.categoryId === category)
    && (!brand || itemBrand === brand)
    && (!hit || product.isHit)
    && (!fresh || product.isNew)
    && ((from === '' && to === '') || (product.price != null && product.price >= minimum && product.price <= maximum))
    && constraints.every(([id, value]) => values[id]?.includes(value))
  ).map(({ product }) => product);

  if (sort === 'name') matches.sort((first, second) => collation.compare(first.name, second.name));
  if (sort === 'price-asc') matches.sort((first, second) => (first.price ?? Infinity) - (second.price ?? Infinity));
  if (sort === 'price-desc') matches.sort((first, second) => (second.price ?? -Infinity) - (first.price ?? -Infinity));
  return matches;
}
