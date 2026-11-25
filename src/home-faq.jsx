import { pageUrl, storeContact } from './shop';

export const shopQuestions = [
    {
      topic: 'Поиск товара',
      question: 'Как найти товар и выбрать цвет?',
      answer: <>В <a href={pageUrl('catalog')}>каталоге</a> можно начать с категории.
        На странице <a href={pageUrl('products')}>«Все товары»</a> работает поиск по названию и фильтр по цене.
        Если у модели есть несколько расцветок, блок «Цвет» откроет карточку выбранного варианта с его фото и ценой.</>,
    },
    {
      topic: 'Оформление заявки',
      question: 'Как оформить заявку и что будет после отправки?',
      answer: <>В карточке товара нажмите «Оставить заявку» или <a href={pageUrl('order')}>откройте форму</a> отдельно.
        Форма работает в учебном режиме. После отправки введённые данные будут показаны в текущей вкладке.
        Оплата и доставка через форму недоступны.</>,
    },
    {
      topic: 'Адрес и режим работы',
      question: 'Где указаны адрес и часы работы?',
      answer: <>На странице <a href={pageUrl('contacts')}>«Контакты»</a> указан адрес в Москве — {storeContact.address}.
        Режим работы — {storeContact.hours}. На этой же странице есть телефон и электронная почта.</>,
    },
];

export function HomeFaq() {
  return (
    <section className="section home-faq" id="faq" aria-labelledby="faq-title">
      <div className="container home-faq__layout">
        <h2 id="faq-title">Частые вопросы</h2>
        <div className="home-faq__items">
          {shopQuestions.map(({ question, answer }) => (
            <details className="home-faq__item" name="corekit-faq" key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
