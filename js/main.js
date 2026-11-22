// Форма заявки: выбор товара из адреса, проверка и подтверждение
const form = document.querySelector('#order-form');
const dialog = document.querySelector('#order-dialog');
if (form && dialog) {
  const product = new URLSearchParams(window.location.search).get('product');
  const select = document.querySelector('#order-product');
  if (select && product && [...select.options].some(option => option.value === product)) select.value = product;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const get = name => form.elements.namedItem(name)?.value?.trim() || '';
    const put = (id, value) => { document.getElementById(id).textContent = value; };
    put('summary-name', get('name'));
    put('summary-email', get('email'));
    put('summary-phone', get('phone'));
    put('summary-product', get('product'));
    put('summary-date', get('date') ? new Date(get('date') + 'T12:00:00').toLocaleDateString('ru-RU') : '');
    put('summary-type', get('type'));
    document.getElementById('summary-product-row').hidden = !get('product');
    document.getElementById('summary-date-row').hidden = !get('date');
    dialog.showModal();
  });
  document.querySelector('#close-dialog')?.addEventListener('click', () => {dialog.close();form.reset();});
}
// Поиск, категория и диапазон цены в списке товаров
const search = document.querySelector('#catalog-search');
const category = document.querySelector('#catalog-category');
const price = document.querySelector('#catalog-price');
if (search && category && price) {
  const cards = [...document.querySelectorAll('.catalog-layout .product-card')];
  const params = new URLSearchParams(location.search);
  const selected = params.get('category');
  if ([...category.options].some(option => option.value === selected)) category.value = selected;
  const update = () => {
    const query = search.value.trim().toLocaleLowerCase('ru');
    const maxPrice = Number(price.value);
    document.querySelector('#catalog-price-value').textContent = maxPrice.toLocaleString('ru-RU') + ' ₽';
    let count = 0;
    cards.forEach(card => {
      const visible = card.dataset.name.includes(query) && (category.value === 'all' || card.dataset.category === category.value) && Number(card.dataset.price) <= maxPrice;
      card.hidden = !visible;
      if (visible) count++;
    });
    document.querySelector('#catalog-count').textContent = 'Найдено товаров: ' + count;
    document.querySelector('#catalog-empty').hidden = count !== 0;
  };
  search.addEventListener('input', update);
  category.addEventListener('change', update);
  price.addEventListener('input', update);
  document.querySelector('#filter-reset')?.addEventListener('click', () => {search.value='';category.value='all';price.value=price.max;update();});
  update();
}
// Анимированная кнопка прокрутки вверх
const topButton = document.querySelector('.back-to-top');
if (topButton) {
  const toggle = () => topButton.classList.toggle('back-to-top--visible', window.scrollY > 250);
  window.addEventListener('scroll', toggle, {passive:true});
  toggle();
  topButton.addEventListener('click', event => {event.preventDefault();window.scrollTo({top:0,behavior:'smooth'});});
}

// Одна страница для всех товаров: данные выбираются по параметру id
const detailsRoot = document.querySelector('#product-details');
if (detailsRoot) {
  const id = new URLSearchParams(location.search).get('id');
  const item = typeof PRODUCT_DETAILS !== 'undefined' ? PRODUCT_DETAILS[id] : null;
  if (item) {
    detailsRoot.innerHTML = item.breadcrumbs + item.detail;
    document.title = item.title + ' — shop roject';
  } else {
    detailsRoot.innerHTML = '<h1>Товар не найден</h1><p><a href="products.html">Вернуться к товарам</a></p>';
  }
}
