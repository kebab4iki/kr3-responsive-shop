import { useEffect, useRef, useState } from 'react';
import { Breadcrumbs, ProductCard, ProductImage } from './components';
import { HomeShowcase } from './phone-hero';
import {
  categories, categoryFromQuery, filterUrl, formatPrice, newArrivals, orderUrl, pageUrl,
  phone, popular, products, productUrl, storeContact,
} from './shop';

export function Home() {
  return (
    <>
      <HomeShowcase />
      <ProductCarousel id="popular" title="Хиты продаж" trackLabel="Лента хитов продаж" items={popular} showCatalogLink />
      <ProductCarousel id="new-arrivals" title="Новинки" trackLabel="Лента новинок" items={newArrivals} />
    </>
  );
}

function ProductCarousel({ id, title, trackLabel, items, showCatalogLink = false }) {
  const track = useRef(null);
  const [visibleCount, setVisibleCount] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const lastIndex = Math.max(0, items.length - visibleCount);
  const titleId = `${id}-title`;
  const trackId = `${id}-products`;

  function cardStep(element) {
    const [first, second] = element.children;
    return second ? second.getBoundingClientRect().left - first.getBoundingClientRect().left : 1;
  }

  function updateActive(element) {
    setActiveIndex(Math.round(element.scrollLeft / cardStep(element)));
  }

  function goTo(index) {
    const element = track.current;
    const position = Math.min(lastIndex, Math.max(0, index));
    element.scrollTo({ left: position * cardStep(element) });
  }

  useEffect(() => {
    const element = track.current;
    function measure() {
      setVisibleCount(Number(getComputedStyle(element).getPropertyValue('--carousel-visible')));
      updateActive(element);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section product-carousel" id={id} aria-labelledby={titleId}>
      <div className="container">
        <div className="section-heading">
          <h2 id={titleId}>{title}</h2>
          {lastIndex > 0 && (
            <div className="slide-dots" role="group" aria-label="Позиции в ряду товаров">
              {Array.from({ length: lastIndex + 1 }, (_, index) => (
                <button key={index} type="button" aria-controls={trackId}
                  aria-label={visibleCount === 1
                    ? `Показать товар «${items[index].name}»`
                    : `Показать товары с ${index + 1} по ${index + visibleCount}`}
                  aria-pressed={Math.min(activeIndex, lastIndex) === index} onClick={() => goTo(index)} />
              ))}
            </div>
          )}
        </div>
        <div id={trackId} className="product-carousel__track" ref={track} tabIndex={0}
          role="region" aria-label={trackLabel} onScroll={(event) => updateActive(event.currentTarget)}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            const positions = { ArrowLeft: activeIndex - 1, ArrowRight: activeIndex + 1, Home: 0, End: lastIndex };
            if (!Object.hasOwn(positions, event.key)) return;
            event.preventDefault();
            goTo(positions[event.key]);
          }}>
          {items.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
        {showCatalogLink && (
          <div className="product-carousel__footer">
            <a className="button button--outline" href={pageUrl('products')}>Все товары</a>
          </div>
        )}
      </div>
    </section>
  );
}

const maxPrice = Math.max(...products.map(({ price }) => price ?? 0));

function CategoryLinks({ selected }) {
  return (
    <nav className="category-links" aria-label="Категории каталога">
      <a href={pageUrl('catalog')} aria-current={selected === 'all' ? 'page' : undefined}>Все категории</a>
      {categories.map(({ id, name, label }) =>
        <a key={id} href={filterUrl(name)} aria-current={selected === name ? 'page' : undefined}>{label}</a>
      )}
    </nav>
  );
}

export function Catalog({ entry, query }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(categoryFromQuery(query));
  const [price, setPrice] = useState(maxPrice);
  const term = search.trim().toLocaleLowerCase('ru');
  const filtered = products.filter((product) =>
    product.name.toLocaleLowerCase('ru').includes(term)
    && (category === 'all' || product.category === category)
    && (price === maxPrice || (product.price != null && product.price <= price))
  );
  const categoryLabel = categories.find(({ name }) => name === category)?.label;
  const title = entry === 'category' && categoryLabel ? categoryLabel : entry === 'products' ? 'Все товары' : 'Каталог техники';

  return (
    <>
      <Breadcrumbs current={title} links={entry === 'catalog' ? [] : [[pageUrl('catalog'), 'Каталог']]} />
      <div className="page-heading">
        <h1>{title}</h1>
        <p>Подбери технику по названию, категории и цене.</p>
      </div>
      <CategoryLinks selected={category} />
      <div className="catalog-layout section">
        <aside className="catalog-filters surface" aria-labelledby="filter-title">
          <h2 id="filter-title">Подбор товаров</h2>
          <div className="field">
            <label htmlFor="catalog-search">Поиск по названию</label>
            <input id="catalog-search" type="search" placeholder="Например, монитор"
              value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="catalog-category">Категория</label>
            <select id="catalog-category" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">Все категории</option>
              {categories.map(({ id, name, label }) => <option key={id} value={name}>{label}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="catalog-price">Цена до <output htmlFor="catalog-price">{formatPrice(price)}</output></label>
            <input id="catalog-price" type="range" min="0" max={maxPrice} step="500" value={price}
              onChange={(event) => setPrice(Number(event.target.value))} />
            <div className="filter-limits"><span>0 ₽</span><span>{formatPrice(maxPrice)}</span></div>
          </div>
          <button className="button button--outline" type="button" onClick={() => {
            setSearch('');
            setCategory('all');
            setPrice(maxPrice);
          }}>Сбросить фильтры</button>
        </aside>
        <section aria-label="Список товаров" className="catalog-results">
          <p className="count" role="status">Найдено товаров: {filtered.length}</p>
          {filtered.length ? (
            <div className="products-grid products-grid--catalog">
              {filtered.map((product) => <ProductCard key={product.id} product={product} kind="catalog" titleTag="h2" />)}
            </div>
          ) : <p className="surface empty-state">По выбранным параметрам товары не найдены.</p>}
        </section>
      </div>
    </>
  );
}

export function Product({ query }) {
  const product = products.find(({ id }) => id === query.get('id'));
  const title = product?.name ?? 'Товар не найден';
  useEffect(() => { document.title = `${title} — Corekit`; }, [title]);

  return (
    <>
      <Breadcrumbs links={[[pageUrl('catalog'), 'Каталог']]} current={title} />
      {product ? (
        <article className="section product-detail">
          <div className={`product-detail__visual product-card__visual--${product.id}`}>
            <ProductImage product={product} kind="detail" eager />
          </div>
          <div className="product-detail__content">
            <a className="category-label" href={filterUrl(product.category)}>{product.category}</a>
            <h1>{product.name}</h1>
            <p className="product-detail__description">{product.description}</p>
            <div className="detail-actions">
              <strong>{formatPrice(product.price)}</strong>
              <a className="button button--primary" href={orderUrl(product)}>Оставить заявку</a>
            </div>
            <div className="table-wrapper" tabIndex={0} role="region" aria-label={`Характеристики товара ${product.name}`}>
              <table className="product-table">
                <caption>Характеристики</caption>
                <thead><tr><th scope="col">Параметр</th><th scope="col">Значение</th></tr></thead>
                <tbody>
                  {product.specs.map(([label, value]) => <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </article>
      ) : (
        <section className="section">
          <h1>{title}</h1>
          <p><a className="button button--primary" href={pageUrl('products')}>Все товары</a></p>
        </section>
      )}
    </>
  );
}

function Field({ id, label, wide, children }) {
  return <div className={wide ? 'field order-form__wide' : 'field'}><label htmlFor={id}>{label}</label>{children}</div>;
}

const summaryFields = [
  ['name', 'Имя'], ['email', 'Электронная почта'], ['phone', 'Телефон'], ['product', 'Товар'],
  ['date', 'Дата'], ['type', 'Тип заявки'], ['comment', 'Комментарий'],
];

export function Order({ query }) {
  const [summary, setSummary] = useState(null);
  const dialog = useRef(null);
  const selected = products.find(({ id, name }) => [id, name].includes(query.get('product')));
  useEffect(() => {
    if (summary && !dialog.current.open) dialog.current.showModal();
  }, [summary]);

  return (
    <>
      <Breadcrumbs current="Заявка" />
      <div className="page-heading">
        <h1>Оставить заявку</h1>
        <p>Выбери товар и заполни контактные данные. Форма работает в учебном режиме.</p>
      </div>
      <form className="order-form surface" onSubmit={(event) => {
        event.preventDefault();
        setSummary(Object.fromEntries(new FormData(event.currentTarget)));
      }}>
        <Field id="order-name" label="Имя *">
          <input id="order-name" name="name" autoComplete="name" minLength={2} required placeholder="Ваше имя" />
        </Field>
        <Field id="order-email" label="Электронная почта *">
          <input id="order-email" name="email" type="email" autoComplete="email" required placeholder="name@example.com" />
        </Field>
        <Field id="order-phone" label="Телефон *">
          <input id="order-phone" name="phone" type="tel" autoComplete="tel" required placeholder="+7 999 123-45-67"
            pattern={String.raw`[+0-9\(\) \-]{7,20}`} title="От 7 до 20 символов: цифры, пробелы, плюс, скобки и дефисы" />
        </Field>
        <Field id="order-product" label="Товар">
          <select id="order-product" name="product" defaultValue={selected?.name ?? ''}>
            <option value="">Не выбран</option>
            {products.map(({ id, name }) => <option key={id} value={name}>{name}</option>)}
          </select>
        </Field>
        <Field id="order-date" label="Удобная дата">
          <input id="order-date" name="date" type="date" />
        </Field>
        <Field id="order-type" label="Тип заявки">
          <select id="order-type" name="type"><option>Заказ товара</option><option>Консультация</option></select>
        </Field>
        <Field id="order-comment" label="Комментарий" wide>
          <textarea id="order-comment" name="comment" rows={4} />
        </Field>
        <label className="order-form__wide consent"><input type="checkbox" name="agree" required /> Согласен на обработку данных *</label>
        <div className="order-form__wide">
          <button className="button button--primary" type="submit">Отправить заявку</button>
        </div>
      </form>
      <dialog className="order-dialog" ref={dialog} aria-labelledby="order-confirmation-title"
        aria-describedby="order-confirmation-description" onClose={() => setSummary(null)}>
        <h2 id="order-confirmation-title">Заявка заполнена</h2>
        <p id="order-confirmation-description">Данные показаны в учебном режиме и остаются в этой вкладке.</p>
        <dl>
          {summary && summaryFields.filter(([key]) => summary[key]).map(([key, label]) => (
            <div key={key}><dt>{label}</dt><dd>{summary[key]}</dd></div>
          ))}
        </dl>
        <form method="dialog"><button className="button button--primary" type="submit" autoFocus>Закрыть</button></form>
      </dialog>
    </>
  );
}

export function Contacts() {
  return (
    <>
      <Breadcrumbs current="Контакты" />
      <div className="page-heading"><h1>Контакты</h1><p>Контактные данные учебного магазина.</p></div>
      <div className="contacts-grid section">
        <section className="surface contact-panel">
          <h2>Связаться с Corekit</h2>
          <address>
            <div><span>Телефон</span><a href={storeContact.phoneHref}>{storeContact.phone}</a></div>
            <div><span>Электронная почта</span><a href={`mailto:${storeContact.email}`}>{storeContact.email}</a></div>
            <div><span>Город</span><strong>Москва</strong></div>
            <div><span>Адрес</span><strong>{storeContact.address}</strong></div>
            <div><span>Режим работы</span><strong>{storeContact.hours}</strong></div>
          </address>
        </section>
        <section className="surface contact-panel">
          <h2>Обратная связь</h2>
          <p>Чтобы выбрать товар или задать вопрос о нём, заполни форму заявки.</p>
          <a className="button button--primary" href={pageUrl('order')}>Перейти к форме</a>
        </section>
      </div>
    </>
  );
}
