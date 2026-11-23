import inventory from './catalog-products.json';

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

export const catalogProducts = inventory.map((product) => ({
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
