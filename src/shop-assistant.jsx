import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BackToTop } from './components';
import { imageUrl } from './shop';

const confirmation = 'Консультант уже увидел ваш запрос и скоро вам ответит.';

export function FloatingTools({ showTop }) {
  const dialog = useRef(null);
  const launcher = useRef(null);
  const conversation = useRef(null);
  const input = useRef(null);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!open || !viewport) return;
    const panel = dialog.current;
    function updateViewport() {
      const bottomInset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      panel.style.setProperty('--keyboard-inset', `${bottomInset}px`);
    }
    updateViewport();
    viewport.addEventListener('resize', updateViewport);
    viewport.addEventListener('scroll', updateViewport);
    return () => {
      viewport.removeEventListener('resize', updateViewport);
      viewport.removeEventListener('scroll', updateViewport);
      panel.style.removeProperty('--keyboard-inset');
    };
  }, [open]);

  useLayoutEffect(() => {
    if (open) conversation.current.scrollTop = conversation.current.scrollHeight;
  }, [open, messages]);

  function openAssistant() {
    dialog.current.showModal();
    setOpen(true);
  }

  function finishClose() {
    setOpen(false);
    launcher.current.focus({ preventScroll: true });
  }

  function sendMessage(event) {
    event.preventDefault();
    const message = draft.trim();
    if (!message) return;
    setMessages((previous) => [...previous, message]);
    setDraft('');
    input.current.focus({ preventScroll: true });
  }

  return (
    <div className="floating-tools">
      <BackToTop visible={showTop} />
      <button ref={launcher} className="assistant-launcher" type="button" aria-label="Открыть чат с консультантом"
        aria-haspopup="dialog" onClick={openAssistant}>
        <span className="assistant-launcher__icon" aria-hidden="true"><span /></span>
      </button>
      <dialog ref={dialog} id="shop-assistant" className="assistant-panel" aria-labelledby="assistant-title"
        aria-describedby="assistant-role" onClose={finishClose}>
        <div className="assistant-panel__header">
          <img className="assistant-panel__avatar" src={imageUrl('consultant-adolf.webp')} alt="" width="48" height="48" />
          <div className="assistant-panel__profile">
            <h2 id="assistant-title">Адольф</h2>
            <p id="assistant-role">Консультант Corekit</p>
          </div>
          <button className="assistant-panel__close" type="button" aria-label="Закрыть чат" autoFocus
            onClick={() => dialog.current.close()}><span aria-hidden="true">×</span></button>
        </div>
        <div ref={conversation} className="assistant-panel__conversation" role="log" aria-label="Сообщения чата"
          tabIndex={messages.length ? 0 : undefined}>
          {messages.map((message, index) => (
            <div className="assistant-panel__exchange" key={index}>
              <p className="assistant-message assistant-message--outgoing">{message}</p>
              <p className="assistant-message">{confirmation}</p>
            </div>
          ))}
        </div>
        <form className="assistant-panel__composer" onSubmit={sendMessage}>
          <input ref={input} type="text" aria-label="Сообщение" placeholder="Напишите сообщение"
            value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={1000} autoComplete="off" />
          <button className="assistant-panel__send" type="submit" aria-label="Отправить сообщение" disabled={!draft.trim()}>
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12h15m-6-6 6 6-6 6" />
            </svg>
          </button>
        </form>
      </dialog>
    </div>
  );
}
