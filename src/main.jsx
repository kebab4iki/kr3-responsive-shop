import { createRoot } from 'react-dom/client';
import { Header, Footer, BackToTop } from './components';
import { Home, Catalog, Product, Order, Contacts } from './pages';

const entry = window.location.pathname.split('/').pop()?.replace(/\.html$/, '') || 'index';
const page = {
  index: Home,
  catalog: Catalog,
  products: Catalog,
  category: Catalog,
  product: Product,
  order: Order,
  application: Order,
  contacts: Contacts,
};
const Content = page[entry] ?? Home;
const query = new URLSearchParams(window.location.search);

createRoot(document.getElementById('root')).render(
  <>
    <Header page={entry} />
    <main id="main" className="container page-main" tabIndex={-1}>
      <Content entry={entry} query={query} />
    </main>
    <Footer />
    <BackToTop />
  </>,
);
