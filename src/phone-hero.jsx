import { useCallback, useEffect, useRef, useState } from 'react';
import { assetUrl, imageUrl, orderUrl, phone, phoneFinishes, productUrl } from './shop';

const wideScreen = '(min-width: 768px)';
const reducedMotion = '(prefers-reduced-motion: reduce)';
const posterUrl = (width) => imageUrl(`iphone-lineup-studio-${width}.webp`);
const posterSet = (widths) => widths.map((width) => `${posterUrl(width)} ${width}w`).join(', ');
const widePosters = posterSet([960, 1280, 1920, 2560]);
const mobilePosters = posterSet([360, 656]);

export function PhoneHero() {
  const [wide] = useState(() => matchMedia(wideScreen).matches);
  const [intro, setIntro] = useState(() => !matchMedia(reducedMotion).matches);
  const [posterReady, setPosterReady] = useState(false);
  const video = useRef(null);
  const showPoster = useCallback(() => setIntro(false), []);

  useEffect(() => {
    if (!intro) return;
    const player = video.current;
    const motion = matchMedia(reducedMotion);
    const width = matchMedia(wideScreen);
    const stopForPreference = (event) => { if (event.matches) showPoster(); };
    const startDeadline = window.setTimeout(showPoster, 6500);
    const clearDeadline = () => window.clearTimeout(startDeadline);

    motion.addEventListener('change', stopForPreference);
    width.addEventListener('change', showPoster);
    player.addEventListener('playing', clearDeadline, { once: true });
    if (motion.matches || width.matches !== wide) showPoster();
    else player.play().catch(showPoster);

    return () => {
      clearDeadline();
      motion.removeEventListener('change', stopForPreference);
      width.removeEventListener('change', showPoster);
      player.removeEventListener('playing', clearDeadline);
    };
  }, [intro, showPoster, wide]);

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__art">
        <picture className="hero__poster" aria-hidden="true">
          <source media={wideScreen} type="image/webp" sizes="(min-width: 1380px) 1280px, 93vw"
            srcSet={widePosters} />
          <img src={posterUrl(656)} alt=""
            srcSet={mobilePosters}
            sizes="93vw" width="656" height="586" fetchPriority={intro ? 'low' : 'high'}
            onError={() => setPosterReady(false)} onLoad={() => setPosterReady(true)} />
        </picture>
        <h1 id="hero-title" className={!intro && !posterReady ? 'hero__title hero__title--visible' : 'hero__title'}>
          iPhone 18 Pro
        </h1>
        {intro && (
          <video ref={video} className="hero__animation" aria-hidden="true"
            autoPlay muted playsInline preload="auto" disablePictureInPicture
            src={assetUrl(`media/iphone-lineup-${wide ? 'desktop' : 'mobile'}-studio60.mp4`)}
            onEnded={showPoster} onError={showPoster} />
        )}
        <p className="hero__badge">Новинка</p>
      </div>
      <div className="hero__footer">
        <p className="hero__finishes">{phoneFinishes.join(' · ')}</p>
        <div className="hero__actions">
          <a className="button button--primary" href={orderUrl(phone)}>Оформить заказ</a>
          <a className="button button--outline" href={productUrl(phone)}>Подробнее</a>
        </div>
      </div>
    </section>
  );
}
