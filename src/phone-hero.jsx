import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { featuredPhone } from './catalog-data';
import { iphone18Finishes, iphone18Title } from './iphone-18-pro';
import { assetUrl, imageUrl, orderUrl, pageUrl, productUrl } from './shop';

const wideScreen = '(min-width: 768px)';
const reducedMotion = '(prefers-reduced-motion: reduce)';
const posterUrl = (width) => imageUrl(`iphone-lineup-studio-${width}.webp`);
const posterSet = (widths) => widths.map((width) => `${posterUrl(width)} ${width}w`).join(', ');
const widePosters = posterSet([960, 1280, 1920, 2560]);
const mobilePosters = posterSet([360, 656]);

const promos = [
  {
    id: 'gta', name: 'GTA VI', title: 'Два героя, один штат, тысячи возможностей',
    description: 'Игровая техника в Corekit',
    details: 'Подбери монитор, наушники и другие аксессуары для своей игровой системы.',
    action: 'Смотреть технику', destination: 'products',
  },
  {
    id: 'gift', name: 'Подарочные карты', title: 'Подарочные карты',
    description: 'Свобода выбора в одном подарке',
    details: 'Оставь заявку, чтобы узнать об условиях покупки и использования подарочной карты Corekit.',
    action: 'Оставить заявку', destination: 'application',
  },
  {
    id: 'bork', name: 'BORK', title: 'Технологии как искусство',
    description: 'Новинки для вас и вашего дома',
    details: 'Оставь заявку, чтобы уточнить ассортимент техники BORK для дома.',
    action: 'Оставить заявку', destination: 'application',
  },
];
const slideCount = promos.length + 1;
const slideInterval = 15000;
const slideTransition = 600;

export function HomeShowcase() {
  const [slides, setSlides] = useState({ active: 0, previous: null });
  const { active, previous } = slides;
  const [introComplete, setIntroComplete] = useState(() => matchMedia(reducedMotion).matches);
  const [paused, setPaused] = useState(false);
  const [contentFocused, setContentFocused] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const viewport = useRef(null);
  const currentSlide = useRef(null);
  const finishIntro = useCallback(() => setIntroComplete(true), []);

  useLayoutEffect(() => {
    const slide = currentSlide.current;
    const stage = viewport.current;
    const fit = () => { stage.style.setProperty('--showcase-height', `${slide.offsetHeight}px`); };
    const observer = new ResizeObserver(fit);
    fit();
    observer.observe(slide);
    return () => observer.disconnect();
  }, [active]);

  useEffect(() => {
    if (!introComplete) return;
    for (const { id } of promos) {
      const background = new Image();
      background.fetchPriority = 'low';
      background.src = imageUrl(`home-promo-${id}.webp`);
    }
  }, [introComplete]);

  useEffect(() => {
    if (!introComplete || paused || contentFocused || dialogOpen) return;

    let timer;
    function schedule() {
      window.clearTimeout(timer);
      if (!document.hidden) {
        timer = window.setTimeout(() => {
          setSlides({ active: (active + 1) % slideCount, previous: active });
        }, slideInterval);
      }
    }
    schedule();
    document.addEventListener('visibilitychange', schedule);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', schedule);
    };
  }, [active, contentFocused, dialogOpen, introComplete, paused]);

  useEffect(() => {
    if (previous === null) return;
    const timer = window.setTimeout(() => {
      setSlides((current) => current === slides ? { active, previous: null } : current);
    }, slideTransition);
    return () => window.clearTimeout(timer);
  }, [active, previous, slides]);

  return (
    <section className="home-showcase" style={{ '--showcase-transition': `${slideTransition}ms` }} aria-label="Новости Corekit">
      <div id="showcase-slide" className="home-showcase__viewport" ref={viewport}
        onFocus={() => setContentFocused(true)} onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setContentFocused(false);
        }}>
        {(previous === null ? [active] : [previous, active]).map((index) => {
          const current = index === active;
          const transitionClass = current ? (previous === null ? '' : ' home-showcase__slide--entering') : ' home-showcase__slide--leaving';
          return (
            <div key={index} className={`home-showcase__slide${transitionClass}`} ref={current ? currentSlide : undefined}
              aria-hidden={!current || undefined} inert={!current}>
              {index === 0 ? <PhoneHero intro={!introComplete} showPoster={finishIntro} />
                : <PromoSlide promo={promos[index - 1]} onDialogChange={setDialogOpen} />}
            </div>
          );
        })}
      </div>
      <div className="home-showcase__controls">
        {introComplete && (
          <button className="home-showcase__toggle" type="button" aria-controls="showcase-slide"
            aria-label={paused ? 'Возобновить смену баннеров' : 'Приостановить смену баннеров'}
            onClick={() => setPaused((value) => !value)}>
            <span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>
          </button>
        )}
      </div>
    </section>
  );
}

function PromoSlide({ promo, onDialogChange }) {
  const dialog = useRef(null);
  const titleId = `promo-title-${promo.id}`;

  return (
    <div className={`promo promo--${promo.id}`}>
      <img className="promo__background" src={imageUrl(`home-promo-${promo.id}.webp`)} alt="" />
      <div className="promo__inner container">
        <div className="promo__copy">
          {promo.id === 'bork' && <img className="promo__logo" src={imageUrl('home-promo-bork-logo.webp')}
            width="427" height="79" alt="BORK" />}
          <h1>{promo.title}</h1>
          <p>{promo.description}</p>
          <button className="button button--primary" type="button" onClick={() => {
            dialog.current.showModal();
            onDialogChange(true);
          }}>Подробнее</button>
        </div>
      </div>
      <dialog className="order-dialog promo__dialog" ref={dialog} aria-labelledby={titleId} onClose={() => onDialogChange(false)}>
        <h2 id={titleId}>{promo.name}</h2>
        <p>{promo.details}</p>
        <form method="dialog">
          <a className="button button--primary" href={pageUrl(promo.destination)}>{promo.action}</a>
          <button className="button button--outline" type="submit">Закрыть</button>
        </form>
      </dialog>
    </div>
  );
}

function PhoneHero({ intro, showPoster }) {
  const [wide] = useState(() => matchMedia(wideScreen).matches);
  const [posterReady, setPosterReady] = useState(false);
  const video = useRef(null);

  useEffect(() => {
    if (!intro) return;
    const player = video.current;
    const motion = matchMedia(reducedMotion);
    const width = matchMedia(wideScreen);
    const stopForPreference = (event) => { if (event.matches) showPoster(); };
    const startDeadline = window.setTimeout(showPoster, 6500);
    const clearDeadline = () => window.clearTimeout(startDeadline);
    let stallDeadline;
    function clearStallDeadline() {
      window.clearTimeout(stallDeadline);
    }
    function watchStall() {
      clearStallDeadline();
      stallDeadline = window.setTimeout(showPoster, 3500);
    }

    motion.addEventListener('change', stopForPreference);
    width.addEventListener('change', showPoster);
    player.addEventListener('playing', clearDeadline, { once: true });
    player.addEventListener('playing', clearStallDeadline);
    player.addEventListener('waiting', watchStall);
    if (motion.matches || width.matches !== wide) showPoster();
    else player.play().catch(showPoster);

    return () => {
      clearDeadline();
      clearStallDeadline();
      motion.removeEventListener('change', stopForPreference);
      width.removeEventListener('change', showPoster);
      player.removeEventListener('playing', clearDeadline);
      player.removeEventListener('playing', clearStallDeadline);
      player.removeEventListener('waiting', watchStall);
    };
  }, [intro, showPoster, wide]);

  return (
    <div className="hero">
      <div className="hero__art">
        <picture className="hero__poster" aria-hidden="true">
          <source media={wideScreen} type="image/webp" sizes="100vw"
            srcSet={widePosters} />
          <img src={posterUrl(656)} alt=""
            srcSet={mobilePosters}
            sizes="100vw" width="656" height="586" fetchPriority={intro ? 'low' : 'high'}
            onError={() => setPosterReady(false)} onLoad={() => setPosterReady(true)} />
        </picture>
        <h1 id="hero-title" className={!intro && !posterReady ? 'hero__title hero__title--visible' : 'hero__title'}>
          {iphone18Title}
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
        <div className="hero__footer-inner container">
          <p className="hero__finishes">{iphone18Finishes.join(' · ')}</p>
          <div className="hero__actions">
            <a className="button button--primary" href={orderUrl(featuredPhone)}>Оформить заказ</a>
            <a className="button button--outline" href={productUrl(featuredPhone)}>Подробнее</a>
          </div>
        </div>
      </div>
    </div>
  );
}
