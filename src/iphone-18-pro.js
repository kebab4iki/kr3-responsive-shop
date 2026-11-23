export const iphone18Title = 'iPhone 18 Pro';

const finishes = [
  { slug: 'burgundy', name: 'Burgundy', label: 'Бордовый', swatch: '#612e3e', price: 121990, sizes: [[207, 250], [122, 250], [197, 250]] },
  { slug: 'glacier', name: 'Glacier', label: 'Ледяной голубой', swatch: '#afc6df', price: 117990, sizes: [[415, 500], [243, 500], [108, 500]] },
  { slug: 'silver', name: 'Silver', label: 'Серебристый', swatch: '#dbdce0', price: 117990, sizes: [[415, 500], [244, 500], [117, 500]] },
  { slug: 'black', name: 'Black', label: 'Чёрный', swatch: '#26252a', price: 117990, sizes: [[415, 500], [245, 500], [96, 500]] },
];

export const iphone18Finishes = finishes.map(({ name }) => name);

export const iphone18Products = finishes.map(({ slug, name, label, swatch, price, sizes }) => {
  const [image, ...gallery] = sizes.map(([width, height], index) => ({
    filename: `iphone-18-pro-${slug}-${index + 1}.png`, width, height,
  }));

  return {
    // Burgundy keeps the original URL used by the homepage and shared links.
    id: slug === 'burgundy' ? 'iphone-18-pro' : `iphone-18-pro-${slug}`,
    categoryId: 'phones',
    colorGroup: 'iphone-18-pro-256',
    color: { label, swatch },
    name: `Apple ${iphone18Title} 256 ГБ, ${name}`,
    summary: '6,3″ Super Retina XDR · A20 Pro',
    price,
    description: `iPhone 18 Pro в цвете ${name} с алюминиевым корпусом и памятью 256 ГБ. OLED-дисплей поддерживает частоту до 120 Гц. У основной камеры на 48 Мп переменная диафрагма, с которой можно управлять глубиной резкости при съёмке.`,
    specs: [
      ['Дисплей', '6,3″ OLED, 2622 × 1206, до 120 Гц'],
      ['Процессор', 'Apple A20 Pro'],
      ['Память', '256 ГБ'],
      ['Цвет', `${label} (${name})`],
      ['Задние камеры', '48 + 48 + 48 Мп, переменная диафрагма основной камеры'],
      ['Размеры', '150 × 71,9 × 8,75 мм'],
      ['Вес', '211 г'],
    ],
    image,
    gallery,
  };
});
