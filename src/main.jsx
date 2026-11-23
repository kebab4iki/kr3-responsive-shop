import { createRoot } from 'react-dom/client';
import { Header, Footer, BackToTop } from './components';
import { Home, Catalog, Product, Order, Contacts } from './pages';
import { standalone } from './shop';

const query = new URLSearchParams(window.location.search);
const routes = {
  index: [Home, 'Corekit — магазин техники'],
  catalog: [Catalog, 'Каталог — Corekit'],
  products: [Catalog, 'Все товары — Corekit'],
  category: [Catalog, 'Категория — Corekit'],
  product: [Product, 'Товар — Corekit'],
  order: [Order, 'Заявка — Corekit'],
  application: [Order, 'Заявка — Corekit'],
  contacts: [Contacts, 'Контакты — Corekit'],
};
const requestedPage = standalone ? query.get('page') : window.location.pathname.split('/').pop()?.replace(/\.html$/, '');
const entry = Object.hasOwn(routes, requestedPage) ? requestedPage : 'index';
const [Content, title] = routes[entry];
if (standalone) document.title = title;

createRoot(document.getElementById('root')).render(
  <>
    <Header page={entry} />
    <main id="main" className={entry === 'index' ? 'page-main page-main--home' : 'container page-main'} tabIndex={-1}>
      <Content entry={entry} query={query} />
    </main>
    <Footer />
    <BackToTop />
  </>,
);
