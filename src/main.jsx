import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Header, Footer, BackToTop } from './components';
import { Home, Catalog, Category, AllProducts, Product, Order, Contacts } from './pages';
import { standalone } from './shop';

const query = new URLSearchParams(window.location.search);
const routes = {
  index: [Home, 'Corekit — магазин техники'],
  catalog: [Catalog, 'Каталог — Corekit'],
  products: [AllProducts, 'Все товары — Corekit'],
  category: [Category, 'Категория — Corekit'],
  product: [Product, 'Товар — Corekit'],
  order: [Order, 'Заявка — Corekit'],
  application: [Order, 'Заявка — Corekit'],
  contacts: [Contacts, 'Контакты — Corekit'],
};
const requestedPage = standalone ? query.get('page') : window.location.pathname.split('/').pop()?.replace(/\.html$/, '');
const entry = Object.hasOwn(routes, requestedPage) ? requestedPage : 'index';
const [Content, title] = routes[entry];
if (standalone) document.title = title;

const revealTargets = '.product-carousel > .container, .home-reviews__layout, .home-faq__item, '
  + '.category-tile, .products-grid .product-card, .product-description > *, .contact-panel, .site-footer__columns';

function Site({ children }) {
  const [compact, setCompact] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    function updateChrome() {
      setCompact(window.scrollY > 88);
      setShowTop(window.scrollY > 450);
    }
    updateChrome();
    window.addEventListener('scroll', updateChrome, { passive: true });
    return () => window.removeEventListener('scroll', updateChrome);
  }, []);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const margin = 24;
    const observer = new IntersectionObserver((entries) => {
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting) continue;
        observer.unobserve(target);
        target.classList.add('scroll-reveal');
      }
    }, { rootMargin: `0px 0px -${margin}px` });

    for (const target of document.querySelectorAll(revealTargets)) {
      if (target.getBoundingClientRect().top >= window.innerHeight - margin) observer.observe(target);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Header page={entry} compact={compact} />
      <main id="main" className={entry === 'index' ? 'page-main page-main--home' : 'container page-main'} tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <BackToTop visible={showTop} />
    </>
  );
}

createRoot(document.getElementById('root')).render(<Site><Content entry={entry} query={query} /></Site>);
