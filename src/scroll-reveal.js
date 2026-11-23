import { useEffect } from 'react';

const targets = [
  '.page-heading', '.section-heading', '.product-card', '.product-carousel__footer',
  '.home-reviews h2', '.review-form', '.review-list__header', '.review-card',
  '.home-faq h2', '.home-faq__item', '.category-tile', '.catalog-filters', '.empty-state',
  '.product-gallery', '.product-overview__info', '.product-description > *',
  '.order-form > *', '.contact-panel', '.site-footer__columns > *', '.site-footer__legal',
].join(', ');

const minimumVisible = 0.08;

function visitTargets(node, visit) {
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  if (node.matches(targets)) visit(node);
  node.querySelectorAll(targets).forEach(visit);
}

export function useScrollReveal() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const root = document.getElementById('root');
    const motion = window.matchMedia('(prefers-reduced-motion: no-preference)');
    const nodes = root.querySelectorAll(targets);
    const initialTargets = new WeakSet(nodes);
    const revealed = new WeakSet();
    const observer = new IntersectionObserver((entries) => {
      let delay = 0;
      for (const { target, isIntersecting, intersectionRatio } of entries) {
        const initial = initialTargets.delete(target);
        if (!isIntersecting || intersectionRatio < minimumVisible || !root.contains(target)) continue;
        observer.unobserve(target);
        revealed.add(target);
        if (initial || !motion.matches || target.contains(document.activeElement)) continue;
        target.style.setProperty('--reveal-delay', `${delay}ms`);
        target.classList.add('scroll-reveal');
        delay = Math.min(delay + 42, 126);
      }
    }, { threshold: minimumVisible });

    function observe(target) {
      if (!revealed.has(target) && root.contains(target)) observer.observe(target);
    }

    nodes.forEach(observe);

    const changes = new MutationObserver((records) => {
      for (const { addedNodes, removedNodes } of records) {
        removedNodes.forEach((node) => visitTargets(node, (target) => {
          if (!root.contains(target)) observer.unobserve(target);
        }));
        addedNodes.forEach((node) => visitTargets(node, observe));
      }
    });
    changes.observe(root, { childList: true, subtree: true });

    function clearReveal(event) {
      const target = event.target.closest('.scroll-reveal');
      if (!target) return;
      target.classList.remove('scroll-reveal');
      target.style.removeProperty('--reveal-delay');
    }

    function finishReveal(event) {
      if (event.animationName === 'scroll-reveal') clearReveal(event);
    }

    root.addEventListener('focusin', clearReveal);
    root.addEventListener('animationend', finishReveal);
    return () => {
      changes.disconnect();
      observer.disconnect();
      root.removeEventListener('focusin', clearReveal);
      root.removeEventListener('animationend', finishReveal);
    };
  }, []);
}
