import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { imageUrl, phone, productUrl } from './shop';

const PhoneCanvas = lazy(() => import('./phone-canvas'));
const angleLabels = ['Камеры', 'Корпус', 'Экран'];

function PhoneVisual() {
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [angle, setAngle] = useState(0);
  const onReady = useCallback(() => setReady(true), []);
  const onUnavailable = useCallback(() => setUnavailable(true), []);

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReducedMotion(media.matches);
      if (media.matches) setReady(false);
    };
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const showAnimation = !unavailable && !reducedMotion;
  const showControls = showAnimation && ready;

  return (
    <div className="hero__visual">
      <div className="phone-stage" data-model-ready={showControls ? 'true' : 'false'}>
        <div className="phone-stage__glow" aria-hidden="true" />
        <div className="phone-stage__frame" aria-hidden="true" />
        <picture className={`phone-poster${showControls ? ' phone-poster--hidden' : ''}`}>
          <source media="(min-width: 1100px)" srcSet={`${imageUrl('iphone-burgundy-640.webp')} 640w, ${imageUrl('iphone-burgundy-960.webp')} 960w`}
            sizes="(min-width: 1380px) 660px, 51vw" />
          <img src={imageUrl('iphone-burgundy-640.webp')}
            srcSet={`${imageUrl('iphone-burgundy-360.webp')} 360w, ${imageUrl('iphone-burgundy-640.webp')} 640w`}
            sizes="(min-width: 900px) 50vw, 90vw" width="640" height="640"
            alt="iPhone 18 Pro в цвете Burgundy" fetchPriority="high" />
        </picture>
        {showAnimation ? (
          <Suspense fallback={null}>
            <PhoneCanvas angle={angle} onReady={onReady} onUnavailable={onUnavailable} />
          </Suspense>
        ) : null}
      </div>
      <div className="phone-view-controls">
        {showControls ? (
          <div role="group" aria-label="Ракурс телефона">
            {angleLabels.map((label, index) => (
              <button key={label} type="button" aria-pressed={angle === index} onClick={() => setAngle(index)}>{label}</button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function PhoneHero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__headline">
        <p className="hero__eyebrow">Смартфон Apple</p>
        <h1 id="hero-title">iPhone 18 Pro</h1>
        <p className="hero__finish"><span aria-hidden="true" /> Burgundy</p>
      </div>
      <PhoneVisual />
      <div className="hero__content">
        <p className="hero__lead">Дисплей Super Retina XDR 6,3″ и камера Fusion 48 Мп с переменной диафрагмой.</p>
        <div className="hero__actions">
          <a className="button button--primary" href={productUrl(phone)}>Подробнее</a>
          <a className="button button--outline" href="#popular">Популярные товары</a>
        </div>
      </div>
    </section>
  );
}
