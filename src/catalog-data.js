import verifiedProducts from './catalog-products.json';

export const categories = [
  { id: 'phones', name: 'Смартфоны и планшеты', theme: 'rose', preview: 'apple-iphone-15-plus' },
  { id: 'laptops', name: 'Ноутбуки', theme: 'blush' },
  { id: 'monitors', name: 'Мониторы', theme: 'cool' },
  { id: 'watches', name: 'Смарт-часы', theme: 'violet' },
  { id: 'headphones', name: 'Наушники', theme: 'rose', preview: 'apple-airpods-max-lightning' },
  { id: 'speakers', name: 'Колонки', theme: 'violet' },
  { id: 'peripherals', name: 'Компьютерная периферия', theme: 'cool' },
  { id: 'gaming', name: 'Игровые аксессуары', theme: 'violet' },
  { id: 'storage', name: 'Накопители', theme: 'rose' },
  { id: 'power', name: 'Зарядки и питание', theme: 'blush' },
  { id: 'network', name: 'Сетевое оборудование', theme: 'cool' },
  { id: 'printers', name: 'Принтеры', theme: 'blush' },
];

export const categoriesById = new Map(categories.map((category) => [category.id, category]));

export const catalogProducts = verifiedProducts.map((product) => ({
  ...product,
  category: categoriesById.get(product.categoryId).name,
}));

export const demoCategoryIds = {
  'iphone-18-pro': 'phones', tablet: 'phones', notebook: 'laptops', monitor: 'monitors',
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
