import { useState } from 'react';
import type { Persist } from './types';
import { Breathing } from './Breathing';
import { pickAffirmation } from './affirmations';
import { currentStage, nextStage } from './science';
import { computeAvoidedFloat, computeEarned, TOTAL_BRICKS } from './store';

type Props = {
  state: Persist;
  onClose: () => void;
  onOvercame: () => void;
};

const FACTS = [
  'Тяга — это волна. Она поднимается за 2-3 минуты и спадает ещё за 3-5. Ты это переждёшь.',
  'Острая отмена алкоголя занимает 24–72 часа. После — только привычка, которая разрушается от времени без неё.',
  'Каждая порция спиртного сокращает жизнь на ~30 минут (Burton & Sheron, Lancet 2018). Каждая невыпитая — возвращает их.',
  'Тяга сейчас кажется огромной. Через 15 минут ты даже не вспомнишь о ней — если переключишься.',
  'Если сорвёшься — потеряешь не только корабль, а все эти дни. А они — были.',
  'Печень регенерирует. Каждый день без алкоголя — реальный обратный ход жирового гепатоза.',
  'Завтрашнее утро ты заработаешь сейчас. Ясное, без головной боли, без стыда.',
];

function fmtElapsed(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d} д ${h} ч`;
  if (h > 0) return `${h} ч ${m} мин`;
  return `${m} мин`;
}

function fmtEta(ms: number) {
  if (ms <= 0) return 'сейчас';
  const h = ms / 3600000;
  if (h < 1) return `${Math.ceil(ms / 60000)} мин`;
  if (h < 24) return `${Math.ceil(h)} ч`;
  const d = h / 24;
  if (d < 30) return `${Math.ceil(d)} д`;
  const mo = d / 30;
  if (mo < 12) return `${Math.ceil(mo)} мес`;
  return `${Math.ceil(mo / 12)} лет`;
}

export function SOSModal({ state, onClose, onOvercame }: Props) {
  const [view, setView] = useState<'root' | 'breath'>('root');
  const [fact] = useState(() => FACTS[Math.floor(Math.random() * FACTS.length)]);
  const affirm = pickAffirmation(Math.floor(Date.now() / 60000));
  const now = Date.now();
  const since = now - state.startedAt;
  const stage = currentStage(since);
  const nxt = nextStage(since);
  const eta = nxt ? nxt.atHours * 3600 * 1000 - since : 0;
  const earned = Math.min(computeEarned(state.lastDrinkAt, state.perDay, now), TOTAL_BRICKS);
  const avoidedFloat = Math.min(
    computeAvoidedFloat(state.lastDrinkAt, state.perDay, now),
    TOTAL_BRICKS,
  );
  const savedMin = Math.floor(avoidedFloat * 30);

  if (view === 'breath') {
    return (
      <Breathing
        onComplete={() => setView('root')}
        onCancel={() => setView('root')}
      />
    );
  }

  return (
    <div className="modal">
      <div className="modal-card sos">
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="sos-heart">❤️</div>
        <h2>Ты молодец. Серьёзно.</h2>
        <p className="sos-lead">
          То, что ты нажал эту кнопку вместо того, чтобы налить — это уже победа.
        </p>

        <div className="sos-progress">
          <div className="sosp-row big">
            <span className="sosp-v">{fmtElapsed(since)}</span>
            <span className="sosp-l">ты держишься</span>
          </div>
          <div className="sosp-row">
            <div>
              <div className="sosp-v accent">{earned}</div>
              <div className="sosp-l">досок в корабле</div>
            </div>
            <div>
              <div className="sosp-v good">{savedMin}</div>
              <div className="sosp-l">минут жизни вернул</div>
            </div>
          </div>
          <div className="sosp-stage">
            <div className="sosp-stage-now">
              <span className="sub">сейчас:</span> {stage.label}
            </div>
            {nxt && (
              <div className="sosp-stage-next">
                Скоро будет <b>легче</b>: «{nxt.label}»
                — <b>через {fmtEta(eta)}</b>
              </div>
            )}
          </div>
        </div>

        <div className="sos-affirm">{affirm}</div>

        <div className="sos-grid">
          <button className="sos-big primary" onClick={() => setView('breath')}>
            🫁 Дышать 4-7-8 (1 мин)
          </button>
          <button className="sos-big" onClick={onOvercame}>
            💪 Я пережил волну (+3)
          </button>
        </div>
        <p className="honesty-note">
          Жми «пережил» только если тяга реально накрыла и отпустила — минимум 3–5 минут.
          Если кликнуть сразу «ради досок», ты обманешь не приложение, а себя: мозг запомнит,
          что награда даётся за ничего, и в следующий раз не поверит обещанию. Доски — это про <b>честность перед собой</b>.
        </p>

        {state.reasons.length > 0 && (
          <div className="sos-block">
            <div className="sos-sub">Ты бросаешь, потому что:</div>
            <ul className="reasons">
              {state.reasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}

        {state.letterToSelf && (
          <div className="sos-block letter">
            <div className="sos-sub">Ты писал это себе:</div>
            <blockquote>{state.letterToSelf}</blockquote>
          </div>
        )}

        <div className="sos-block fact">
          <div className="sos-sub">Факт:</div>
          <p>{fact}</p>
        </div>

        <div className="sos-footer">
          <button className="ghost" onClick={onClose}>Закрыть, мне легче</button>
        </div>
      </div>
    </div>
  );
}
