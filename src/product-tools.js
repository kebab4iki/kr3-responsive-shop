const rubles = new Intl.NumberFormat('ru-RU', {
  style: 'currency', currency: 'RUB', maximumFractionDigits: 0,
});

export function formatPrice(amount) {
  return amount == null ? 'Цена по запросу' : rubles.format(amount);
}

export function calculateDiscount(price, discountPercent) {
  if (!Number.isFinite(price) || !Number.isFinite(discountPercent) || price < 0 || discountPercent < 0 || discountPercent > 100) return 0;
  return price * discountPercent / 100;
}

export function calculateFinalPrice(price, discountPercent) {
  return Number.isFinite(price) && price >= 0 ? price - calculateDiscount(price, discountPercent) : null;
}

export function getProductStatus(product) {
  if (product.isAvailable === true) return 'В наличии';
  if (product.isAvailable === false) return 'Нет в наличии';
  return 'Наличие уточняется';
}

export function describeProduct(product) {
  const finalPrice = calculateFinalPrice(product.price, product.discountPercent);
  return `${product.name} · ${formatPrice(finalPrice)} · ${getProductStatus(product)}`;
}

export function showPracticeExample(product) {
  const example = { ...product, discountPercent: 10, isAvailable: true };
  const discount = calculateDiscount(example.price, example.discountPercent);
  console.info('ПЗ №15 · учебный пример цены, скидки и наличия');
  console.table({
    Цена: formatPrice(example.price),
    Скидка: `${example.discountPercent}% (${formatPrice(discount)})`,
    'Итоговая цена': formatPrice(calculateFinalPrice(example.price, example.discountPercent)),
    Статус: getProductStatus(example),
    Описание: describeProduct(example),
  });
}
