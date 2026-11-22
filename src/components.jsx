import { useEffect, useState } from 'react';
import { formatPrice, imageUrl, orderUrl, productUrl } from './shop';

const nav = [
  ['index', 'Главная'], ['catalog', 'Каталог'], ['products', 'Все товары'], ['contacts', 'Контакты'],
];

export function Brand() {
  return (
    <a className="brand" href="index.html" aria-label="Corekit — главная">
      <span className="brand__mark"><img src={imageUrl('corekit-mark.png')} alt="" width="36" height="36" /></span>
      <img className="brand__wordmark" src={imageUrl('corekit-wordmark.png')} alt="" width="112" height="16" />
    </a>
  );
}

export function Header({ page }) {
  const active = page === 'category' ? 'catalog' : page === 'product' ? 'products' : page;
  return (
    <header className="site-header" id="top">
      <a className="skip-link" href="#main">Перейти к содержанию</a>
      <div className="container site-header__inner">
        <Brand />
        <nav className="site-nav" aria-label="Основная навигация">
          <ul className="site-nav__list">
            {nav.map(([id, label]) => (
              <li key={id}>
                <a className="site-nav__link" href={`${id}.html`} aria-current={active === id ? 'page' : undefined}>{label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <a className="button button--outline header-action" href="order.html"
          aria-current={['order', 'application'].includes(page) ? 'page' : undefined}>
          Заявка
        </a>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <Brand />
        <p>© 2026 Corekit. Учебный проект.</p>
        <a href="contacts.html">Контакты</a>
      </div>
    </footer>
  );
}

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => setVisible(window.scrollY > 450);
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  return visible ? (
    <button className="back-to-top" type="button" aria-label="Вернуться наверх"
      onClick={() => {
        document.querySelector('.brand')?.focus({ preventScroll: true });
        window.scrollTo({ top: 0 });
      }}>
      <span aria-hidden="true">↑</span>
    </button>
  ) : null;
}

export function Breadcrumbs({ links = [], current }) {
  return (
    <nav className="breadcrumbs" aria-label="Хлебные крошки">
      <ol>
        <li><a href="index.html">Главная</a></li>
        {links.map(([href, label]) => <li key={href}><a href={href}>{label}</a></li>)}
        <li aria-current="page">{current}</li>
      </ol>
    </nav>
  );
}

const cardSizes = '(min-width: 1380px) 310px, (min-width: 1024px) 23vw, (min-width: 640px) 34vw, 69vw';
const catalogSizes = '(min-width: 1380px) 240px, (min-width: 1280px) 18vw, (min-width: 1024px) 27vw, (min-width: 640px) 34vw, 69vw';
const detailSizes = '(min-width: 1380px) 475px, (min-width: 900px) 34vw, 69vw';

export function ProductImage({ product, kind = 'card', eager = false, decorative = false }) {
  const image = product.image;
  if (!image) return <span className="product-placeholder" aria-hidden="true">▧</span>;
  const sizes = kind === 'detail' ? detailSizes : kind === 'catalog' ? catalogSizes : cardSizes;
  const srcset = image.variants.map(([file, width]) => `${imageUrl(file)} ${width}w`).join(', ');
  return (
    <picture>
      <source type="image/webp" srcSet={srcset} sizes={sizes} />
      <img src={imageUrl(image.filename)} alt={decorative ? '' : product.name}
        width={image.width} height={image.height} loading={eager ? 'eager' : 'lazy'} decoding="async" />
    </picture>
  );
}

export function ProductCard({ product, kind, titleTag = 'h3' }) {
  const Title = titleTag;
  return (
    <article className="product-card">
      <a href={productUrl(product)} className={`product-card__visual product-card__visual--${product.id}`}
        aria-label={`Подробнее о товаре «${product.name}»`}>
        <ProductImage product={product} kind={kind} decorative />
      </a>
      <div className="product-card__body">
        <span className="product-card__category">{product.category}</span>
        <Title><a href={productUrl(product)}>{product.name}</a></Title>
        <p>{product.summary}</p>
        <div className="product-card__actions">
          <strong>{formatPrice(product.price)}</strong>
          <a className="button button--quiet" href={orderUrl(product)} aria-label={`Заявка на товар «${product.name}»`}>Заявка</a>
        </div>
      </div>
    </article>
  );
}
