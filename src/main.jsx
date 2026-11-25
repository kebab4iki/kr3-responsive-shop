import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Header, Footer } from './components';
import { Home, Catalog, Category, AllProducts, Favorites, Product, Order, Contacts } from './pages';
import { FavoritesProvider } from './favorites';
import { useScrollReveal } from './scroll-reveal';
import { FloatingTools } from './shop-assistant';
import { gtaStandardId } from './new-catalog-products';
import { showPracticeExample } from './product-tools';
import { products, standalone } from './shop';

const query = new URLSearchParams(window.location.search);
const routes = {
  index: [Home, 'Corekit — магазин техники'],
  catalog: [Catalog, 'Каталог — Corekit'],
  products: [AllProducts, 'Все товары — Corekit'],
  favorites: [Favorites, 'Избранное — Corekit'],
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
if (entry === 'index') showPracticeExample(products.find(({ id }) => id === gtaStandardId));

function Site({ children }) {
  const [compact, setCompact] = useState(false);
  const [showTop, setShowTop] = useState(false);
  useScrollReveal();

  useEffect(() => {
    function updateChrome() {
      setCompact(window.scrollY > 88);
      setShowTop(window.scrollY > 450);
    }
    updateChrome();
    window.addEventListener('scroll', updateChrome, { passive: true });
    return () => window.removeEventListener('scroll', updateChrome);
  }, []);

  return (
    <>
      <Header page={entry} compact={compact} />
      <main id="main" className={entry === 'index' ? 'page-main page-main--home' : 'container page-main'} tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <FloatingTools showTop={showTop} />
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <FavoritesProvider>
    <Site><Content entry={entry} query={query} /></Site>
  </FavoritesProvider>,
);
