import { useState } from 'react';
import { formatPrice, imageUrl, orderUrl, pageUrl, productUrl, storeContact } from './shop';
import { responsiveSource, thumbnailUrl } from './responsive-image';
import { FavoriteButton, HeartIcon } from './favorites';

const nav = [
  ['index', 'Главная'], ['catalog', 'Каталог'], ['products', 'Все товары'], ['contacts', 'Контакты'],
];

export function Brand() {
  return (
    <a className="brand" href={pageUrl('index')} aria-label="Corekit — главная">
      <span className="brand__mark"><img src={imageUrl('corekit-mark.png')} alt="" width="36" height="36" /></span>
      <img className="brand__wordmark" src={imageUrl('corekit-wordmark.png')} alt="" width="112" height="16" />
    </a>
  );
}

export function Header({ page, compact }) {
  const active = page === 'category' ? 'catalog' : page === 'product' ? 'products' : page;
  return (
    <div className="site-header-slot">
      <header className={`site-header${compact ? ' site-header--compact' : ''}`} id="top">
        <a className="skip-link" href="#main">Перейти к содержанию</a>
        <div className="container site-header__inner">
          <Brand />
          <nav className="site-nav" aria-label="Основная навигация">
            <ul className="site-nav__list">
              {nav.map(([id, label]) => (
                <li key={id}>
                  <a className="site-nav__link" href={pageUrl(id)} aria-current={active === id ? 'page' : undefined}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="header-actions">
            <a className="button button--quiet header-favorites" href={pageUrl('favorites')} aria-label="Избранное"
              aria-current={active === 'favorites' ? 'page' : undefined}>
              <HeartIcon />
              <span>Избранное</span>
            </a>
            <a className="button button--outline" href={pageUrl('order')}
              aria-current={['order', 'application'].includes(page) ? 'page' : undefined}>
              Заявка
            </a>
          </div>
        </div>
      </header>
    </div>
  );
}

export function Footer() {
  const contacts = [
    ['⌖', 'Адрес', storeContact.address],
    ['☎︎', 'Телефон', <a href={storeContact.phoneHref}>{storeContact.phone}</a>],
    ['◷', 'Режим работы', storeContact.hours],
    ['✉︎', 'Почта', <a href={`mailto:${storeContact.email}`}>{storeContact.email}</a>],
  ];

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__columns">
          <div className="site-footer__about">
            <Brand />
            <p>Магазин техники и аксессуаров для работы, учёбы и дома.</p>
          </div>
          <nav aria-labelledby="footer-links">
            <h2 id="footer-links">Разделы</h2>
            <ul className="site-footer__links">
              {nav.map(([id, label]) => <li key={id}><a href={pageUrl(id)}>{label}</a></li>)}
              <li><a href={pageUrl('favorites')}>Избранное</a></li>
            </ul>
          </nav>
          <section aria-labelledby="footer-contacts">
            <h2 id="footer-contacts">Адрес и связь</h2>
            <address className="site-footer__contacts">
              <dl>
                {contacts.map(([icon, label, content]) => (
                  <div key={label} className="site-footer__contact">
                    <dt><span className="site-footer__icon" aria-hidden="true">{icon}</span>{label}</dt>
                    <dd>{content}</dd>
                  </div>
                ))}
              </dl>
            </address>
          </section>
        </div>
        <p className="site-footer__legal">© 2026 Corekit. Все права защищены.</p>
      </div>
    </footer>
  );
}

export function BackToTop({ visible }) {
  return (
    <button className="back-to-top" type="button" aria-label="Вернуться наверх" disabled={!visible}
      onClick={() => {
        document.querySelector('.site-header .brand')?.focus({ preventScroll: true });
        window.scrollTo({ top: 0 });
      }}>
      <span className="back-to-top__arrow" aria-hidden="true" />
    </button>
  );
}

export function Breadcrumbs({ links = [], current }) {
  return (
    <nav className="breadcrumbs" aria-label="Хлебные крошки">
      <ol>
        <li><a href={pageUrl('index')}>Главная</a></li>
        {links.map(([href, label]) => <li key={href}><a href={href}>{label}</a></li>)}
        <li aria-current="page">{current}</li>
      </ol>
    </nav>
  );
}

const cardSizes = '(min-width: 1380px) 214px, (min-width: 1120px) 17vw, (min-width: 960px) 21vw, (min-width: 768px) 28vw, (min-width: 480px) 42vw, 86vw';
const catalogSizes = '(min-width: 1380px) 360px, (min-width: 1280px) 26vw, (min-width: 1024px) 39vw, (min-width: 640px) 43vw, 86vw';
const detailSizes = '(min-width: 1380px) 590px, (min-width: 900px) 44vw, 86vw';

function showLoadedPhoto({ currentTarget: photo }) {
  const show = () => photo.setAttribute('data-photo-ready', '');
  if (photo.decode && photo.naturalWidth) photo.decode().then(show, show);
  else show();
}

function GiftCardArtwork({ amount }) {
  return (
    <div className="gift-card-art" data-value={amount}>
      <div className="gift-card-art__content">
        <div className="gift-card-art__brand">
          <img src={imageUrl('corekit-mark.png')} alt="" />
          <img src={imageUrl('corekit-wordmark.png')} alt="" />
        </div>
        <div><span>Подарочная карта</span><strong>{formatPrice(amount)}</strong></div>
      </div>
    </div>
  );
}

function productVisualStyle(product) {
  if (product.giftValue) return ' product-visual--gift';
  if (!product.image) return ' product-visual--empty';
  return product.gallery?.length ? ' product-card__visual--photo' : '';
}

export function ProductImage({ product, image = product.image, kind = 'card', eager = false, decorative = false, fadeIn = false }) {
  if (product.giftValue) return <GiftCardArtwork amount={product.giftValue} />;
  if (!image) return <span className="product-placeholder" aria-hidden={decorative || undefined}>Фото пока нет</span>;
  const sizes = kind === 'detail' ? detailSizes : kind === 'catalog' ? catalogSizes : cardSizes;
  const srcset = responsiveSource(image.filename, image.variants);
  return (
    <picture>
      {srcset && <source srcSet={srcset} sizes={sizes} />}
      <img src={imageUrl(image.filename)} alt={decorative ? '' : image.alt ?? product.name}
        width={image.width} height={image.height} loading={eager ? 'eager' : 'lazy'} decoding="async"
        data-fade-in={fadeIn ? '' : undefined} onLoad={fadeIn ? showLoadedPhoto : undefined} onError={fadeIn ? showLoadedPhoto : undefined} />
    </picture>
  );
}

export function ProductGallery({ product }) {
  const [selected, setSelected] = useState(0);
  const photos = [product.image, ...(product.gallery ?? [])];

  return (
    <div className="product-gallery">
      <div className={`product-detail__visual product-card__visual--${product.id}${productVisualStyle(product)}`}>
        <ProductImage product={product} image={photos[selected]} kind="detail" eager />
      </div>
      {photos.length > 1 && (
        <div className="product-gallery__thumbs" role="group" aria-label="Фотографии товара">
          {photos.map((photo, index) => (
            <button key={photo.filename} type="button" aria-label={`Фото ${index + 1} из ${photos.length}`}
              aria-pressed={selected === index} onClick={() => setSelected(index)}>
              <img src={thumbnailUrl(photo.filename)} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductBadges({ product }) {
  if (!product.isHit && !product.isNew) return null;

  return (
    <ul className="product-badges">
      {product.isHit && <li className="product-badge product-badge--hit">Хит</li>}
      {product.isNew && <li className="product-badge product-badge--new">Новинка</li>}
    </ul>
  );
}

export function ProductCard({ product, kind, titleTag = 'h3', fadePhoto = false }) {
  const Title = titleTag;
  return (
    <article className="product-card">
      <a href={productUrl(product)} className={`product-card__visual product-card__visual--${product.id}${productVisualStyle(product)}`}
        aria-label={product.giftValue ? undefined : `Подробнее о товаре «${product.name}»`}>
        <ProductImage product={product} kind={kind} decorative fadeIn={fadePhoto} />
      </a>
      <ProductBadges product={product} />
      <FavoriteButton product={product} />
      <div className="product-card__body">
        <span className="product-card__category">{product.category}</span>
        <Title><a href={productUrl(product)}>{product.name}</a></Title>
        <p>{product.summary}</p>
        <div className="product-card__actions">
          <div className="product-price">
            <span>Цена</span>
            <strong>{formatPrice(product.price)}</strong>
          </div>
          <a className="button button--quiet" href={orderUrl(product)} aria-label={`Заявка на товар «${product.name}»`}>Заявка</a>
        </div>
      </div>
    </article>
  );
}
