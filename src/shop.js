import originalProducts from './products.json';
import { catalogProducts } from './catalog-data';

export { formatPrice } from './product-tools';

export const products = [...catalogProducts, ...originalProducts];

export const storeContact = {
  address: 'Пресненская наб., 2, ТРЦ Афимолл Сити, этаж 3',
  hours: '10:00–22:00',
  phone: '+7 (900) 000-00-00',
  phoneHref: 'tel:+79000000000',
  email: 'info@example.com',
};

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

export function categoryUrl(id) {
  return pageUrl('category', { id });
}
