import { useEffect, useState } from 'react';

const reviewPrefix = 'corekit.review.v1.';
const dateFormat = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' });

function readReviews() {
  const reviews = [];
  try {
    const storage = window.localStorage;
    for (let index = 0; index < storage.length; index++) {
      const key = storage.key(index);
      if (!key?.startsWith(reviewPrefix)) continue;
      let review;
      try {
        review = JSON.parse(storage.getItem(key));
      } catch {
        continue;
      }
      if (typeof review?.name !== 'string' || typeof review.text !== 'string'
        || !Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5
        || !Number.isFinite(review.createdAt) || Math.abs(review.createdAt) > 8.64e15) continue;
      reviews.push({ ...review, key });
    }
  } catch {
    return [];
  }
  return reviews.sort((first, second) => second.createdAt - first.createdAt);
}

export function HomeReviews() {
  const [reviews, setReviews] = useState(readReviews);
  const [status, setStatus] = useState('');

  useEffect(() => {
    function syncReviews(event) {
      if (event.key === null || event.key.startsWith(reviewPrefix)) setReviews(readReviews());
    }
    window.addEventListener('storage', syncReviews);
    return () => window.removeEventListener('storage', syncReviews);
  }, []);

  function saveReview(key, review) {
    try {
      if (review) window.localStorage.setItem(key, JSON.stringify(review));
      else window.localStorage.removeItem(key);
    } catch {
      setStatus('Не удалось сохранить изменение. Проверьте, разрешено ли хранение данных в браузере.');
      return false;
    }
    setReviews(readReviews());
    setStatus(review ? 'Отзыв добавлен.' : 'Отзыв удалён.');
    return true;
  }

  function submitReview(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = data.get('name').trim();
    const text = data.get('text').trim();
    const rating = Number(data.get('rating'));
    if (!name || !text) {
      setStatus('Введите имя и текст отзыва.');
      form.elements.namedItem(name ? 'text' : 'name').focus();
      return;
    }
    const createdAt = Date.now();
    const id = globalThis.crypto?.randomUUID?.() ?? `${createdAt}-${Math.random().toString(36).slice(2)}`;
    if (saveReview(reviewPrefix + id, { name, text, rating, createdAt })) form.reset();
  }

  return (
    <section className="section home-reviews" id="reviews" aria-labelledby="reviews-title">
      <div className="container">
        <h2 id="reviews-title">Отзывы</h2>
        <div className="home-reviews__layout">
          <form className="surface review-form" aria-labelledby="review-form-title" onSubmit={submitReview}>
            <h3 id="review-form-title">Оставить отзыв</h3>
            <div className="field">
              <label htmlFor="review-name">Имя</label>
              <input id="review-name" name="name" autoComplete="nickname" maxLength={60} required />
            </div>
            <div className="field">
              <label htmlFor="review-rating">Оценка</label>
              <select id="review-rating" name="rating" defaultValue="" required>
                <option value="" disabled>Выберите оценку</option>
                {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} из 5</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="review-text">Отзыв</label>
              <textarea id="review-text" name="text" rows={3} maxLength={1500} required />
            </div>
            <div className="review-form__actions">
              <button className="button button--primary" type="submit">Добавить отзыв</button>
              <p className="review-form__status" role="status">{status}</p>
            </div>
          </form>
          <div className="review-list">
            <h3>Ваши отзывы</h3>
            <p className="review-list__note">Отзывы сохраняются в этом браузере.</p>
            {reviews.length === 0 && <p className="surface review-list__empty">Отзывов пока нет.</p>}
            {reviews.map(({ key, name, text, rating, createdAt }) => (
              <article className="surface review-card" key={key}>
                <div className="review-card__header">
                  <h4>{name}</h4>
                  <span className="review-card__rating" aria-label={`Оценка ${rating} из 5`}>
                    <span aria-hidden="true">★</span> {rating}/5
                  </span>
                </div>
                <p>{text}</p>
                <div className="review-card__footer">
                  <time dateTime={new Date(createdAt).toISOString()}>{dateFormat.format(createdAt)}</time>
                  <button className="button button--quiet" type="button" onClick={() => saveReview(key)}>Удалить отзыв</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
