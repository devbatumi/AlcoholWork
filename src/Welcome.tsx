import { useState } from 'react';

type Props = {
  onClose: (dontShowAgain: boolean) => void;
  mode: 'fullscreen' | 'overlay';
  initialDontShow?: boolean;
};

const slides = [
  {
    icon: '⚓',
    title: 'Добро пожаловать на борт',
    body: (
      <>
        Это не трекер и не дневник. Это <b>корабль</b>, который ты строишь тем,
        что <i>не</i> пьёшь. Каждая порция, которую ты не выпил, — превращается в доску.
        1320 досок — и корабль уплывает в открытое море.
      </>
    ),
  },
  {
    icon: '🧠',
    title: 'Почему 66 дней, а не 21',
    body: (
      <>
        Миф про «21 день привычки» — маркетинг. Научное среднее (Lally et al., UCL 2010) —
        <b> 66 дней</b>. Острая отмена уходит к 3–5 дню. Психологическая автоматика —
        к ~66. Это тот срок, на который мы целимся.
      </>
    ),
  },
  {
    icon: '🌊',
    title: 'Срыв = корабль тонет',
    body: (
      <>
        Жёсткий режим. Один бокал — шторм, корабль идёт ко дну, доски теряются.
        Зачем так? Чтобы у мозга был <i>настоящий</i> вес у каждого «всего одного раза». Срывы —
        часть пути, встаём и начинаем заново. Причины и письмо себе сохраняются между рейсами.
      </>
    ),
  },
  {
    icon: '🛠',
    title: 'Что можно делать',
    body: (
      <>
        Когда тянет: красная кнопка <b>«Мне тяжело» (SOS)</b> — дыхание 4-7-8, письмо
        себе, факты. <b>Челленджи</b> (вода, прогулка, пережитая тяга) дают бонусные
        доски. <b>Журнал тяги</b> — тоже +1 доска за запись. Каждое действие — кирпич в корабль.
      </>
    ),
  },
  {
    icon: '🌅',
    title: 'И главное',
    body: (
      <>
        Тебе будет тяжело — особенно по вечерам и в пятницу. Это нормально. Это — плата за то,
        что ты забираешь свою жизнь обратно: ясные утра, спокойный сон, печень,
        деньги, отношения. Ты уже сделал самое сложное — решил.
      </>
    ),
  },
  {
    icon: '🎉',
    title: 'У тебя получится',
    body: (
      <>
        Так выглядит финал: корабль построен и уплывает на горизонт. Ты — молодец,
        серьёзно. Даже если сорвёшься десять раз — одиннадцатая попытка будет успешной.
        Поехали.
      </>
    ),
    final: true,
  },
];

function MiniSailingShip() {
  return (
    <div className="mini-sea">
      <svg viewBox="0 0 300 140" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="mw-sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#7ec8ff" />
            <stop offset="100%" stopColor="#ffb47a" />
          </linearGradient>
          <linearGradient id="mw-sea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#4fb9d6" />
            <stop offset="100%" stopColor="#1e6e9a" />
          </linearGradient>
          <radialGradient id="mw-sun" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#fff3c8" />
            <stop offset="60%" stopColor="#ffb47a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ffb47a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="300" height="90" fill="url(#mw-sky)" />
        <circle cx="240" cy="55" r="34" fill="url(#mw-sun)" />
        <circle cx="240" cy="55" r="16" fill="#fff3c8" />
        <rect x="0" y="85" width="300" height="55" fill="url(#mw-sea)" />
        <g className="mini-ship">
          <path d="M0 85 Q 15 82 30 85 L 28 92 L 2 92 Z" fill="#ddeaf3" />
          <rect x="13" y="60" width="2" height="25" fill="#4a7d9c" />
          <path d="M7 62 Q 14 58 21 62 L 20 78 Q 14 80 8 78 Z" fill="#fff" />
          <path d="M14 58 l 6 -2 l -6 -2 z" fill="#2bb673" />
        </g>
        <path d="M0 100 Q 40 96 80 100 T 160 100 T 240 100 T 300 100 L 300 140 L 0 140 Z"
          fill="#1e6e9a" opacity="0.7">
          <animate attributeName="d" dur="4s" repeatCount="indefinite"
            values="
              M0 100 Q 40 96 80 100 T 160 100 T 240 100 T 300 100 L 300 140 L 0 140 Z;
              M0 100 Q 40 104 80 100 T 160 100 T 240 100 T 300 100 L 300 140 L 0 140 Z;
              M0 100 Q 40 96 80 100 T 160 100 T 240 100 T 300 100 L 300 140 L 0 140 Z" />
        </path>
      </svg>
    </div>
  );
}

export function Welcome({ onClose, mode, initialDontShow = false }: Props) {
  const [i, setI] = useState(0);
  const [dontShow, setDontShow] = useState(initialDontShow);
  const s = slides[i];
  const last = i === slides.length - 1;

  return (
    <div className={`welcome ${mode}`}>
      <div className="welcome-card">
        {s.final ? <MiniSailingShip /> : <div className="welcome-icon">{s.icon}</div>}
        <h2>{s.title}</h2>
        <p>{s.body}</p>

        <div className="welcome-dots">
          {slides.map((_, idx) => (
            <span key={idx} className={`dot${idx === i ? ' on' : ''}`} />
          ))}
        </div>

        <div className="welcome-actions">
          <button
            className="ghost"
            disabled={i === 0}
            onClick={() => setI((v) => Math.max(0, v - 1))}
          >
            Назад
          </button>
          {!last ? (
            <button className="primary" onClick={() => setI((v) => v + 1)}>
              Дальше
            </button>
          ) : (
            <button className="primary" onClick={() => onClose(dontShow)}>
              Поехали
            </button>
          )}
        </div>

        <div className="welcome-footer">
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={dontShow}
              onChange={(e) => setDontShow(e.target.checked)}
            />
            <span className="toggle-track"><span className="toggle-thumb" /></span>
            <span className="toggle-label">
              {dontShow
                ? 'гайд не будет открываться автоматически'
                : 'показывать гайд при каждом запуске'}
            </span>
          </label>
          <button className="link-btn" onClick={() => onClose(dontShow)}>
            закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
