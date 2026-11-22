import { useEffect, useRef } from 'react';
import { angles, createPhoneScene, interpolateRotation } from './phone-scene';

export default function PhoneCanvas({ angle, onReady, onUnavailable }) {
  const mount = useRef(null);
  const selectedAngle = useRef(angle);
  useEffect(() => { selectedAngle.current = angle; }, [angle]);

  useEffect(() => {
    const element = mount.current;
    let cancelled = false;
    let clean = () => {};

    createPhoneScene().then((scene) => {
      if (cancelled) {
        scene.dispose();
        return;
      }
      const { renderer, phone, key } = scene;
      element.appendChild(renderer.domElement);
      const resize = () => scene.resize(element.clientWidth, element.clientHeight);
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(element);
      resize();

      let visible = true;
      const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
      visibilityObserver.observe(element);
      const start = performance.now();
      let last = start;
      let frame = 0;
      let previousAngle = selectedAngle.current;
      let horizontal = 0;
      let vertical = 0;
      let pointer = null;

      const startDrag = (event) => {
        if (!event.isPrimary || event.button !== 0) return;
        pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
        element.setPointerCapture(event.pointerId);
        element.classList.add('is-dragging');
      };
      const drag = (event) => {
        if (pointer?.id !== event.pointerId) return;
        horizontal += (event.clientX - pointer.x) * 0.012;
        vertical = Math.max(-0.75, Math.min(0.75, vertical + (event.clientY - pointer.y) * 0.009));
        pointer = { id: pointer.id, x: event.clientX, y: event.clientY };
      };
      const stopDrag = (event) => {
        if (pointer?.id !== event.pointerId) return;
        pointer = null;
        element.classList.remove('is-dragging');
      };
      element.addEventListener('pointerdown', startDrag);
      element.addEventListener('pointermove', drag);
      element.addEventListener('lostpointercapture', stopDrag);
      renderer.domElement.addEventListener('webglcontextlost', onUnavailable);

      const animate = (now) => {
        frame = requestAnimationFrame(animate);
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        if (!visible || document.hidden) return;
        if (previousAngle !== selectedAngle.current) {
          previousAngle = selectedAngle.current;
          horizontal = 0;
          vertical = 0;
        }
        const elapsed = (now - start) / 1000;
        const [x, y, z] = angles[selectedAngle.current].rotation;
        const scroll = selectedAngle.current === 0 ? Math.min(window.scrollY / 550, 1) * -0.44 : 0;
        const intro = selectedAngle.current === 0 ? -0.48 * Math.exp(-elapsed * 3) : 0;
        phone.rotation.x = interpolateRotation(phone.rotation.x, x + vertical, dt);
        phone.rotation.y = interpolateRotation(phone.rotation.y, y + horizontal + scroll + intro, dt);
        phone.rotation.z = interpolateRotation(phone.rotation.z, z, dt);
        phone.position.y = 0.014 * Math.sin(elapsed * 1.2);
        key.position.x = -3 + Math.sin(elapsed * 0.65) * 1.1;
        scene.render();
      };
      phone.rotation.set(0.15, -0.89, -0.27);
      scene.render();
      frame = requestAnimationFrame(animate);
      onReady();
      clean = () => {
        cancelAnimationFrame(frame);
        resizeObserver.disconnect();
        visibilityObserver.disconnect();
        element.removeEventListener('pointerdown', startDrag);
        element.removeEventListener('pointermove', drag);
        element.removeEventListener('lostpointercapture', stopDrag);
        renderer.domElement.removeEventListener('webglcontextlost', onUnavailable);
        scene.dispose();
      };
    }).catch(() => {
      if (!cancelled) onUnavailable();
    });
    return () => {
      cancelled = true;
      clean();
    };
  }, [onReady, onUnavailable]);

  return <div ref={mount} className="phone-canvas" />;
}
