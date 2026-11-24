import { useRef, useState } from 'react';
import { BackToTop } from './components';
import { shopQuestions } from './home-faq';

export function FloatingTools({ showTop }) {
  const dialog = useRef(null);
  const launcher = useRef(null);
  const [topic, setTopic] = useState(null);

  function openAssistant() {
    dialog.current.showModal();
  }

  function finishClose() {
    launcher.current.focus({ preventScroll: true });
  }

  return (
    <div className="floating-tools">
      <BackToTop visible={showTop} />
      <button ref={launcher} className="assistant-launcher" type="button" aria-label="Открыть помощник Corekit"
        aria-haspopup="dialog" onClick={openAssistant}>
        <span className="assistant-launcher__icon" aria-hidden="true"><span /></span>
      </button>
      <dialog ref={dialog} id="shop-assistant" className="assistant-panel" aria-labelledby="assistant-title" onClose={finishClose}>
        <div className="assistant-panel__header">
          <h2 id="assistant-title">Помощник Corekit</h2>
          <button className="assistant-panel__close" type="button" aria-label="Закрыть помощник" autoFocus
            onClick={() => dialog.current.close()}><span aria-hidden="true">×</span></button>
        </div>
        <div className="assistant-panel__body">
          <p>Выберите вопрос о магазине</p>
          <ul className="assistant-panel__topics">
            {shopQuestions.map((item) => (
              <li key={item.topic}>
                <button className="button button--outline" type="button" aria-pressed={topic === item.topic}
                  onClick={() => setTopic(item.topic)}>{item.topic}</button>
              </li>
            ))}
          </ul>
          <div className="assistant-panel__answer" aria-live="polite">
            {topic && <p>{shopQuestions.find((item) => item.topic === topic)?.answer}</p>}
          </div>
        </div>
      </dialog>
    </div>
  );
}
