import { useLayoutEffect } from 'react';

const targets = [
  '.page-heading', '.section-heading', '.product-card', '.product-carousel__footer',
  '.home-reviews h2', '.review-form', '.review-list__header', '.review-card',
  '.home-faq h2', '.home-faq__item', '.category-tile', '.catalog-filters', '.empty-state',
  '.product-gallery', '.product-overview__info', '.product-description > *',
  '.order-form > *', '.contact-panel', '.site-footer__columns > *', '.site-footer__legal',
].join(', ');

const pendingReveal = 'reveal-pending';
const activeReveal = 'scroll-reveal';

function visitTargets(node, visit) {
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  if (node.matches(targets)) visit(node);
  node.querySelectorAll(targets).forEach(visit);
}

export function useScrollReveal() {
  useLayoutEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const root = document.getElementById('root');
    const motion = window.matchMedia('(prefers-reduced-motion: no-preference)');
    const nodes = root.querySelectorAll(targets);
    const revealed = new WeakSet();
    const observer = new IntersectionObserver((entries) => {
      let delay = 0;
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting || !target.classList.contains(pendingReveal) || !root.contains(target)) continue;
        observer.unobserve(target);
        revealed.add(target);
        if (!motion.matches || target.contains(document.activeElement)) {
          clearReveal(target);
          continue;
        }
        target.style.setProperty('--reveal-delay', `${delay}ms`);
        target.classList.replace(pendingReveal, activeReveal);
        delay = Math.min(delay + 24, 72);
      }
    }, { rootMargin: '14px 0px' });

    function observe(target) {
      if (revealed.has(target) || !root.contains(target)) return;
      target.classList.add(pendingReveal);
      observer.observe(target);
    }

    // Keep the first screen visible and prepare only content outside its scroll bounds.
    const clippedBounds = new Map();
    const pending = [];
    for (const target of nodes) {
      const clip = target.closest('.product-carousel__track, .review-list__scroll');
      if (clip && !clippedBounds.has(clip)) clippedBounds.set(clip, clip.getBoundingClientRect());
      const bounds = clippedBounds.get(clip);
      const rect = target.getBoundingClientRect();
      if (rect.top < Math.min(window.innerHeight, bounds?.bottom ?? Infinity)
        && rect.bottom > Math.max(0, bounds?.top ?? 0)
        && rect.left < Math.min(window.innerWidth, bounds?.right ?? Infinity)
        && rect.right > Math.max(0, bounds?.left ?? 0)) revealed.add(target);
      else pending.push(target);
    }
    pending.forEach(observe);

    const changes = new MutationObserver((records) => {
      for (const { addedNodes, removedNodes } of records) {
        removedNodes.forEach((node) => visitTargets(node, (target) => {
          if (!root.contains(target)) observer.unobserve(target);
        }));
        addedNodes.forEach((node) => visitTargets(node, observe));
      }
    });
    changes.observe(root, { childList: true, subtree: true });

    function clearReveal(target) {
      target.classList.remove(pendingReveal, activeReveal);
      target.style.removeProperty('--reveal-delay');
    }

    function showFocused(event) {
      const target = event.target.closest(`.${pendingReveal}, .${activeReveal}`);
      if (!target) return;
      observer.unobserve(target);
      revealed.add(target);
      clearReveal(target);
    }

    function finishReveal(event) {
      if (event.animationName === activeReveal) clearReveal(event.target);
    }

    root.addEventListener('focusin', showFocused);
    root.addEventListener('animationend', finishReveal);
    root.addEventListener('animationcancel', finishReveal);
    return () => {
      changes.disconnect();
      observer.disconnect();
      root.removeEventListener('focusin', showFocused);
      root.removeEventListener('animationend', finishReveal);
      root.removeEventListener('animationcancel', finishReveal);
      root.querySelectorAll(`.${pendingReveal}, .${activeReveal}`).forEach(clearReveal);
    };
  }, []);
}
