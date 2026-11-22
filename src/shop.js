import originalProducts from './products.json';

export const phoneFinishes = ['Black', 'Burgundy', 'Glacier', 'Silver'];

export const phone = {
  id: 'iphone-18-pro',
  name: 'iPhone 18 Pro',
  category: 'Смартфоны',
  summary: 'Четыре цвета · 256 ГБ',
  description: 'iPhone 18 Pro с дисплеем Super Retina XDR и системой камер Pro Fusion. Алюминиевый корпус представлен в четырёх цветах.',
  specs: [
    ['Цвета', phoneFinishes.join(', ')],
    ['Память', '256 ГБ'],
    ['Дисплей', '6,3″ Super Retina XDR'],
    ['Процессор', 'A20 Pro'],
    ['Основная камера', '48 Мп Fusion, переменная диафрагма'],
    ['Размеры', '150 × 71,9 × 8,75 мм'],
    ['Вес', '211 г'],
  ],
  image: {
    filename: 'iphone-burgundy-640.webp', width: 640, height: 640,
    variants: [['iphone-burgundy-360.webp', 360], ['iphone-burgundy-640.webp', 640], ['iphone-burgundy-960.webp', 960]],
  },
};

export const products = [...originalProducts, phone];
export const popular = ['notebook', 'headphones', 'keyboard', 'monitor', 'mouse', 'kolonki']
  .map((id) => products.find((product) => product.id === id));

export const categories = [
  { id: 'computers', name: 'Компьютеры', label: 'Компьютерная техника', featured: 'notebook' },
  { id: 'accessories', name: 'Аксессуары', label: 'Аксессуары', featured: 'keyboard' },
  { id: 'network', name: 'Сеть', label: 'Сетевое оборудование', featured: 'router' },
  { id: 'phones', name: 'Смартфоны', label: 'Смартфоны', featured: phone.id },
];

export const standalone = document.documentElement.hasAttribute('data-corekit-standalone');

export function assetUrl(path) {
  return globalThis.corekitAssets?.[path] ?? `${import.meta.env.BASE_URL}${path}`;
}

export function imageUrl(filename) {
  return assetUrl(`images/${filename}`);
}

export function pageUrl(page, params) {
  const query = new URLSearchParams(params);
  if (standalone) {
    query.set('page', page);
    return `?${query}`;
  }
  return `${page}.html${query.size ? `?${query}` : ''}`;
}

export function productUrl(product) {
  return pageUrl('product', { id: product.id });
}

export function orderUrl(product) {
  return pageUrl('order', { product: product.name });
}

export function filterUrl(category) {
  return pageUrl('catalog', { category });
}

const rubles = new Intl.NumberFormat('ru-RU', {
  style: 'currency', currency: 'RUB', maximumFractionDigits: 0,
});

export function formatPrice(amount) {
  return amount == null ? 'Цена по запросу' : rubles.format(amount);
}

export function categoryFromQuery(query) {
  const value = query.get('category') ?? query.get('id');
  return categories.find(({ id, name }) => value === id || value === name)?.name ?? 'all';
}
