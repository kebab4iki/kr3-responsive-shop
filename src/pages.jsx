import { useEffect, useRef, useState } from 'react';
import { Breadcrumbs, ProductBadges, ProductCard, ProductGallery } from './components';
import {
  catalogProducts, categories, categoriesById, colorOptions, demoCategoryIds, featuredPhone, findCategory, newArrivals, popular,
} from './catalog-data';
import { catalogFilterOptions, defaultFilters, filterCatalog } from './catalog-filters';
import { iphone18Title } from './iphone-18-pro';
import { HomeFaq } from './home-faq';
import { HomeReviews } from './home-reviews';
import { HomeShowcase } from './phone-hero';
import {
  categoryUrl, formatPrice, imageUrl, orderUrl, pageUrl, products, productUrl, storeContact,
} from './shop';

export function Home() {
  return (
    <>
      <HomeShowcase />
      <ProductCarousel id="popular" title="Хиты продаж" trackLabel="Лента хитов продаж" items={popular} />
      <ProductCarousel id="new-arrivals" title="Новинки" trackLabel="Лента новинок" items={newArrivals} />
      <HomeReviews />
      <HomeFaq />
    </>
  );
}

const carouselPageSize = 5;

function ProductCarousel({ id, title, trackLabel, items }) {
  const track = useRef(null);
  const [visibleCount, setVisibleCount] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const lastIndex = Math.max(0, items.length - visibleCount);
  const pageCount = Math.ceil(items.length / carouselPageSize);
  const activePage = Math.floor(activeIndex / carouselPageSize);
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
          {pageCount > 1 && (
            <div className="slide-dots" role="group" aria-label={`Страницы раздела «${title}»`}>
              {Array.from({ length: pageCount }, (_, page) => {
                const start = page * carouselPageSize;
                const end = Math.min(start + carouselPageSize, items.length);
                return <button key={start} type="button" aria-controls={trackId}
                  aria-label={`Страница ${page + 1} из ${pageCount}, товары ${start + 1}–${end}`}
                  aria-pressed={activePage === page} onClick={() => goTo(start)} />;
              })}
            </div>
          )}
        </div>
        <div id={trackId} className="product-carousel__track" ref={track} tabIndex={0}
          role="region" aria-label={trackLabel} onScroll={(event) => updateActive(event.currentTarget)}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            const step = visibleCount === carouselPageSize ? carouselPageSize : 1;
            const positions = { ArrowLeft: activeIndex - step, ArrowRight: activeIndex + step, Home: 0, End: lastIndex };
            if (!Object.hasOwn(positions, event.key)) return;
            event.preventDefault();
            goTo(positions[event.key]);
          }}>
          {items.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
        <div className="product-carousel__footer">
          <a className="button button--outline" href={pageUrl('products')}>Все товары</a>
        </div>
      </div>
    </section>
  );
}

export function Catalog({ query }) {
  if (query.has('category') || query.has('id')) return <Category query={query} />;
  return (
    <>
      <Breadcrumbs current="Каталог" />
      <div className="page-heading"><h1>Каталог техники</h1></div>
      <div className="category-grid section" aria-label="Категории каталога">
        {categories.map(({ id, name }) => (
          <a key={id} className="category-tile" href={categoryUrl(id)}>
            <img className="category-tile__art" src={imageUrl(`category-${id}.webp`)} alt="" loading="lazy" decoding="async" />
            <h2>{name}</h2>
          </a>
        ))}
      </div>
    </>
  );
}

function CatalogGrid({ items, emptyMessage, fadePhotos = false }) {
  return (
    <section aria-label="Список товаров">
      {items.length ? (
        <div className="products-grid products-grid--catalog">
          {items.map((product) => <ProductCard key={product.id} product={product} kind="catalog" titleTag="h2" fadePhoto={fadePhotos} />)}
        </div>
      ) : <p className="surface empty-state">{emptyMessage}</p>}
    </section>
  );
}

export function Category({ query }) {
  const category = findCategory(query.get('category') ?? query.get('id'));
  const title = category?.name ?? 'Категория не найдена';
  const ids = category?.ids ?? [category?.id];
  const items = catalogProducts.filter(({ categoryId }) => ids.includes(categoryId));
  useEffect(() => { document.title = `${title} — Corekit`; }, [title]);
  return (
    <>
      <Breadcrumbs current={title} links={[[pageUrl('catalog'), 'Каталог']]} />
      <div className="page-heading"><h1>{title}</h1></div>
      <div className="section">
        <CatalogGrid items={items} emptyMessage="В этой категории пока нет товаров." />
      </div>
    </>
  );
}

export function AllProducts({ query }) {
  const [filters, setFilters] = useState(() => ({
    ...defaultFilters, category: findCategory(query.get('category'))?.id ?? defaultFilters.category,
  }));
  const options = catalogFilterOptions(filters.category);
  const filtered = filterCatalog(filters);
  const invalidPrice = filters.from !== '' && filters.to !== '' && Number(filters.from) > Number(filters.to);

  function updateFilters(patch) {
    setFilters((previous) => ({ ...previous, ...patch }));
  }

  function changeCategory(event) {
    const category = event.target.value;
    const { brands } = catalogFilterOptions(category);
    updateFilters({ category, brand: brands.includes(filters.brand) ? filters.brand : '', specs: {} });
  }

  return (
    <>
      <Breadcrumbs current="Все товары" links={[[pageUrl('catalog'), 'Каталог']]} />
      <div className="page-heading"><h1>Все товары</h1></div>
      <div className="catalog-layout section">
        <aside className="catalog-filters surface" aria-labelledby="filter-title">
          <h2 id="filter-title">Подбор товаров</h2>
          <div className="catalog-filters__options">
            <div className="field">
              <label htmlFor="catalog-search">Поиск по названию</label>
              <input id="catalog-search" type="search" placeholder="Например, AirPods"
                value={filters.search} onChange={(event) => updateFilters({ search: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="catalog-category">Категория</label>
              <select id="catalog-category" value={filters.category} onChange={changeCategory}>
                <option value="all">Все категории</option>
                {categories.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="catalog-brand">Бренд</label>
              <select id="catalog-brand" value={filters.brand} onChange={(event) => updateFilters({ brand: event.target.value })}>
                <option value="">Все бренды</option>
                {options.brands.map((brand) => <option key={brand}>{brand}</option>)}
              </select>
            </div>
            <fieldset className="catalog-filter-group">
              <legend>Цена, ₽</legend>
              <div className="catalog-filters__price">
                <div className="field">
                  <input aria-label="Цена от" id="catalog-price-from" type="number" min="0" inputMode="numeric" placeholder="От"
                    aria-invalid={invalidPrice || undefined} aria-describedby={invalidPrice ? 'catalog-price-notice' : undefined}
                    value={filters.from} onChange={(event) => updateFilters({ from: event.target.value })} />
                </div>
                <div className="field">
                  <input aria-label="Цена до" id="catalog-price-to" type="number" min="0" inputMode="numeric" placeholder="До"
                    aria-invalid={invalidPrice || undefined} aria-describedby={invalidPrice ? 'catalog-price-notice' : undefined}
                    value={filters.to} onChange={(event) => updateFilters({ to: event.target.value })} />
                </div>
              </div>
              {invalidPrice && <p className="catalog-filters__notice" id="catalog-price-notice" role="alert">Цена «от» должна быть меньше или равна цене «до».</p>}
            </fieldset>
            <fieldset className="catalog-filter-group">
              <legend>Подборки</legend>
              <div className="catalog-filters__toggles">
                <label><input type="checkbox" checked={filters.hit} onChange={(event) => updateFilters({ hit: event.target.checked })} />Хиты</label>
                <label><input type="checkbox" checked={filters.fresh} onChange={(event) => updateFilters({ fresh: event.target.checked })} />Новинки</label>
              </div>
            </fieldset>
            {options.specs.map(({ id, label, options: values }) => (
              <div className="field" key={id}>
                <label htmlFor={`catalog-spec-${id}`}>{label}</label>
                <select id={`catalog-spec-${id}`} value={filters.specs[id] ?? ''} onChange={(event) => {
                  updateFilters({ specs: { ...filters.specs, [id]: event.target.value } });
                }}>
                  <option value="">Любое значение</option>
                  {values.map((value) => <option key={value}>{value}</option>)}
                </select>
              </div>
            ))}
          </div>
          <button className="button button--outline" type="button" onClick={() => setFilters(defaultFilters)}>Сбросить фильтры</button>
        </aside>
        <div className="catalog-results">
          <div className="catalog-results__toolbar">
            <p className="count" role="status">Найдено товаров: {filtered.length}</p>
            <div className="field catalog-results__sort">
              <label htmlFor="catalog-sort">Сортировка</label>
              <select id="catalog-sort" value={filters.sort} onChange={(event) => updateFilters({ sort: event.target.value })}>
                <option value="default">По умолчанию</option>
                <option value="price-asc">Сначала дешевле</option>
                <option value="price-desc">Сначала дороже</option>
                <option value="name">По названию</option>
              </select>
            </div>
          </div>
          <CatalogGrid items={filtered} emptyMessage="По выбранным параметрам товары не найдены." fadePhotos />
        </div>
      </div>
    </>
  );
}

function ProductColors({ product }) {
  const options = colorOptions(product);
  if (options.length < 2) return null;

  return (
    <nav className="product-colors" aria-labelledby="product-color-heading">
      <p id="product-color-heading">Цвет</p>
      <ul>
        {options.map((option) => (
          <li key={option.id}>
            <a href={productUrl(option)} aria-current={option.id === product.id ? 'page' : undefined}>
              <span className="product-colors__swatch" style={{ backgroundColor: option.color.swatch }} aria-hidden="true" />
              {option.color.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Product({ query }) {
  const product = products.find(({ id }) => id === query.get('id'));
  const title = product?.name ?? 'Товар не найден';
  const category = product && categoriesById.get(product.categoryId ?? demoCategoryIds[product.id]);
  useEffect(() => { document.title = `${title} — Corekit`; }, [title]);

  return (
    <>
      <Breadcrumbs links={[[pageUrl('catalog'), 'Каталог'], ...(category ? [[categoryUrl(category.id), category.name]] : [])]} current={title} />
      {product ? (
        <article className="product-page section">
          <div className="product-overview surface">
            <ProductGallery key={product.id} product={product} />
            <div className="product-overview__info">
              {category && <a className="category-label" href={categoryUrl(category.id)}>{category.name}</a>}
              <h1>{product.name}</h1>
              <p className="product-page__summary">{product.summary}</p>
              <ProductBadges product={product} />
              <ProductColors product={product} />
              <dl className="product-facts">
                {product.specs.slice(0, 3).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
              </dl>
              <a className="product-overview__spec-link" href="#product-specifications">Все характеристики</a>
              <div className="product-purchase">
                <div className="product-price">
                  <span>Цена</span>
                  <strong>{formatPrice(product.price)}</strong>
                </div>
                <a className="button button--primary" href={orderUrl(product)}>Оставить заявку</a>
              </div>
            </div>
          </div>
          <div className="product-description">
            <section aria-labelledby="product-description-title">
              <h2 id="product-description-title">Описание</h2>
              <p>{product.description}</p>
            </section>
            <table className="product-table" id="product-specifications">
              <caption>Характеристики</caption>
              <thead><tr><th scope="col">Параметр</th><th scope="col">Значение</th></tr></thead>
              <tbody>
                {product.specs.map(([label, value]) => <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>)}
              </tbody>
            </table>
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
  const requestedProduct = query.get('product');
  const selected = requestedProduct === iphone18Title ? featuredPhone
    : products.find(({ id, name }) => id === requestedProduct || name === requestedProduct);
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
