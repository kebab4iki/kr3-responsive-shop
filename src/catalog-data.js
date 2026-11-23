import inventory from './catalog-products.json';
import { iphone18Products } from './iphone-18-pro';

export const categories = [
  { id: 'phones', name: 'Смартфоны и планшеты' },
  { id: 'laptops', name: 'Ноутбуки' },
  { id: 'monitors', name: 'Мониторы' },
  { id: 'watches', name: 'Смарт-часы' },
  { id: 'headphones', name: 'Наушники' },
  { id: 'speakers', name: 'Колонки' },
  { id: 'peripherals', name: 'Компьютерная периферия' },
  { id: 'gaming', name: 'Игровые аксессуары' },
  { id: 'storage', name: 'Накопители' },
  { id: 'power', name: 'Зарядки и питание' },
  { id: 'network', name: 'Сетевое оборудование' },
  { id: 'printers', name: 'Принтеры' },
];

export const categoriesById = new Map(categories.map((category) => [category.id, category]));

const hitIds = [
  'iphone-18-pro', 'apple-iphone-15-blue', 'apple-airpods-pro-2-lightning', 'sony-dualsense-white', 'logitech-g502-hero',
  'jbl-flip-6', 'apple-macbook-air-m2', 'aoc-24g2sp', 'samsung-t7-shield-1tb', 'tp-link-archer-ax55',
];
const newIds = [
  'iphone-18-pro', 'apple-iphone-17-pro-max-orange', 'samsung-galaxy-s25-ultra-silverblue', 'apple-watch-series-10-42',
  'asus-vivobook-x1504va-bq5738', 'apple-iphone-17-lavender', 'apple-iphone-16e-black', 'samsung-galaxy-watch7-44',
  'apple-macbook-air-m3', 'jbl-go-4',
];

const assortment = [...iphone18Products, ...inventory];
const groupsById = new Map(assortment.map(({ id, colorGroup }) => [id, colorGroup ?? id]));
const hitGroups = new Set(hitIds.map((id) => groupsById.get(id)));
const newGroups = new Set(newIds.map((id) => groupsById.get(id)));

export const catalogProducts = assortment.map((product) => {
  const group = groupsById.get(product.id);
  return {
    ...product,
    category: categoriesById.get(product.categoryId).name,
    isHit: hitGroups.has(group),
    isNew: newGroups.has(group),
  };
});

const catalogById = new Map(catalogProducts.map((product) => [product.id, product]));
export const popular = hitIds.map((id) => catalogById.get(id));
export const newArrivals = newIds.map((id) => catalogById.get(id));
export const featuredPhone = catalogById.get('iphone-18-pro');

export function colorOptions(product) {
  return product.colorGroup ? catalogProducts.filter(({ colorGroup }) => colorGroup === product.colorGroup) : [];
}

export const demoCategoryIds = {
  tablet: 'phones', notebook: 'laptops', monitor: 'monitors',
  smartwatch: 'watches', headphones: 'headphones', 'wireless-earbuds': 'headphones', kolonki: 'speakers',
  keyboard: 'peripherals', mouse: 'peripherals', webcam: 'peripherals', microphone: 'peripherals',
  'usb-hub': 'peripherals', gamepad: 'gaming', flash: 'storage', 'external-ssd': 'storage',
  'power-bank': 'power', 'usb-charger': 'power', router: 'network', printer: 'printers',
};

export const legacyCategories = new Map([
  ['computers', { name: 'Компьютеры', ids: ['laptops', 'monitors', 'printers'] }],
  ['accessories', { name: 'Аксессуары', ids: ['headphones', 'speakers', 'peripherals', 'gaming', 'storage', 'power', 'watches'] }],
]);

export function findCategory(value) {
  return categoriesById.get(value)
    ?? categories.find(({ name }) => name === value)
    ?? (value === 'Смартфоны' ? categoriesById.get('phones') : undefined)
    ?? (value === 'Сеть' ? categoriesById.get('network') : undefined)
    ?? legacyCategories.get(value)
    ?? [...legacyCategories.values()].find(({ name }) => name === value);
}
