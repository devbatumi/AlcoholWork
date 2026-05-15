import { useEffect, useMemo, useRef, useState } from 'react';
import type { JournalEntry, Persist, VisualPart } from './types';
import { buildProgress, SECTIONS, TOTAL_BRICKS } from './sections';
import { Ship } from './Ship';
import {
  computeAvoidedFloat,
  computeEarned,
  computeTickProgress,
  intervalMs,
  useNow,
} from './store';
import { ActionsPanel } from './ActionsPanel';
import { JournalPanel } from './JournalPanel';
import { StagesTimeline } from './StagesTimeline';
import { Pet } from './Pet';
import { pickAffirmation } from './affirmations';
import { downloadMd } from './exportMd';

type Tab = 'ship' | 'do' | 'body' | 'journal' | 'pet';

type Props = {
  state: Persist;
  onRelapse: () => void;
  onReset: () => void;
  onSailed: () => void;
  onBonus: (amount: number, actionId: string) => void;
  onJournalAdd: (e: JournalEntry) => void;
  onPetAction: (actionId: string) => void;
  onShowGuide: () => void;
};

function fmtDur(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}ч ${m}м ${String(sec).padStart(2, '0')}с`;
  if (m > 0) return `${m}м ${String(sec).padStart(2, '0')}с`;
  return `${sec}с`;
}

function fmtDurCompact(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}д ${h}ч`;
  if (h > 0) return `${h}ч ${m}м`;
  return `${m}м`;
}

function fmtDays(ms: number) {
  const d = ms / (24 * 3600 * 1000);
  if (d < 1) return `${(d * 24).toFixed(1)} ч`;
  return `${d.toFixed(1)} дн`;
}

function Ring({ pct }: { pct: number }) {
  const R = 50;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - Math.max(0, Math.min(1, pct)));
  return (
    <svg viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
      <circle
        cx="60" cy="60" r={R}
        fill="none"
        stroke="url(#ringg)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.6s linear' }}
      />
      <defs>
        <linearGradient id="ringg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffb13a" />
          <stop offset="100%" stopColor="#6cf0c2" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Dashboard({
  state, onRelapse, onReset, onSailed, onBonus, onJournalAdd, onPetAction, onShowGuide,
}: Props) {
  const now = useNow(1000);
  const [confirmRelapse, setConfirmRelapse] = useState(false);
  const [tab, setTab] = useState<Tab>('ship');

  const step = intervalMs(state.perDay);
  const earnedRaw = computeEarned(state.lastDrinkAt, state.perDay, now);
  const earnedCapped = Math.min(earnedRaw, TOTAL_BRICKS);
  const built = Math.min(earnedCapped + state.bonusBricks, TOTAL_BRICKS);
  const tick = computeTickProgress(state.lastDrinkAt, state.perDay, now);
  const timeToNextMs = (1 - tick) * step;

  const sections = useMemo(() => buildProgress(built), [built]);

  // Тосты + glow при закрытии подсекции.
  // Сравниваем completed-флаги с предыдущим тиком: если в этом проходе
  // флаг сменился false → true, секция только что закрылась.
  type Toast = { id: number; sectionId: string; name: string; visualId: VisualPart };
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [glowing, setGlowing] = useState<VisualPart | null>(null);
  const prevDoneRef = useRef<Set<string> | null>(null);
  const toastIdRef = useRef(0);
  const glowTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const currentDone = new Set(
      sections.filter((s) => s.filled >= s.cost).map((s) => s.id),
    );
    const prev = prevDoneRef.current;
    if (prev) {
      const justClosed = sections.filter(
        (s) => s.filled >= s.cost && !prev.has(s.id),
      );
      if (justClosed.length > 0) {
        // На редкий случай нескольких закрытий за один тик показываем все.
        const next = justClosed.map((s) => ({
          id: ++toastIdRef.current,
          sectionId: s.id,
          name: s.name,
          visualId: s.visualId,
        }));
        setToasts((t) => [...t, ...next]);
        // Снимаем тост через 4с (анимация уходит на 3.6с).
        next.forEach((toast) => {
          window.setTimeout(() => {
            setToasts((cur) => cur.filter((x) => x.id !== toast.id));
          }, 4200);
        });
        // Glow по последней закрытой части (если их несколько за тик).
        const last = justClosed[justClosed.length - 1];
        setGlowing(last.visualId);
        if (glowTimeoutRef.current) window.clearTimeout(glowTimeoutRef.current);
        glowTimeoutRef.current = window.setTimeout(() => {
          setGlowing(null);
          glowTimeoutRef.current = null;
        }, 1700);
      }
    }
    prevDoneRef.current = currentDone;
  }, [sections]);

  useEffect(
    () => () => {
      if (glowTimeoutRef.current) window.clearTimeout(glowTimeoutRef.current);
    },
    [],
  );

  const sinceStartMs = now - state.startedAt;
  const avoidedFloat = Math.min(
    computeAvoidedFloat(state.lastDrinkAt, state.perDay, now),
    TOTAL_BRICKS,
  );
  // ~5 порций на бутылку (вино — 5 бокалов, упаковка пива — 6 банок ≈ 5 эквивалентов).
  const savedMoney = Math.floor((avoidedFloat / 5) * state.pricePerBottle * 100) / 100;
  // ~30 минут жизни за каждую несвыпитую порцию (Burton & Sheron, Lancet 2018).
  const savedMinutes = Math.floor(avoidedFloat * 30);

  const pct = Math.floor((built / TOTAL_BRICKS) * 100);
  const done = built >= TOTAL_BRICKS;

  useEffect(() => {
    if (done && state.status === 'building') onSailed();
  }, [done, state.status, onSailed]);

  const affirm = pickAffirmation(Math.floor(now / (60 * 1000 * 5)));

  return (
    <div className="container">
      {toasts.length > 0 && (
        <div className="toast-stack" role="status" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className="toast">
              <span className="t-title">✓ Секция готова</span>
              <span className="t-name">{t.name}</span>
              <span className="t-sub">часть корабля собрана</span>
            </div>
          ))}
        </div>
      )}

      <div className="affirm-bar">
        <span className="affirm-label">💭</span>
        <span className="affirm-text">{affirm}</span>
      </div>

      <div className="grid">
        <div className="panel ship-panel">
          <div className="panel-head">
            <h3>Корабль</h3>
            <div className="status-pill">
              {state.status === 'building' ? '🟢 в море' :
                state.status === 'sailed' ? '🎉 уплыл' : '🌊 утонул'}
            </div>
          </div>

          <div className="sea">
            <Ship sections={sections} status={state.status} totalBuilt={built} glowing={glowing} />
          </div>

          <div className="progress-wrap">
            <div className="progress-meta">
              <span>{built} / {TOTAL_BRICKS} досок · {fmtDays(sinceStartMs)} в море</span>
              <span className="pct">{pct}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="bottom-actions">
            <button className="link-btn" onClick={onShowGuide}>📖 гайд</button>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {!confirmRelapse ? (
                <button className="danger" onClick={() => setConfirmRelapse(true)}>
                  Сорвался
                </button>
              ) : (
                <>
                  <button className="ghost" onClick={() => setConfirmRelapse(false)}>Отмена</button>
                  <button className="danger" onClick={() => { setConfirmRelapse(false); onRelapse(); }}>
                    Корабль тонет
                  </button>
                </>
              )}
              <button className="ghost" onClick={() => downloadMd(state)}>Экспорт</button>
              <button className="ghost" onClick={onReset}>Сброс</button>
            </div>
          </div>
        </div>

        <div className="panel now-panel">
          <h3>Сейчас</h3>

          <div className="now-top">
            <div className="timer-ring">
              <Ring pct={tick} />
              <div className="val">
                <div className="t">{fmtDur(timeToNextMs)}</div>
                <div className="s">до доски</div>
              </div>
            </div>
            <div className="now-headline">
              <div className="nh-v">{fmtDurCompact(sinceStartMs)}</div>
              <div className="nh-l">ты держишься</div>
            </div>
          </div>

          <div className="now-stats">
            <div className="ns-item">
              <div className="ns-v accent">{built}</div>
              <div className="ns-l">досок</div>
              {state.bonusBricks > 0 && (
                <div className="ns-sub">+{state.bonusBricks} бонусных</div>
              )}
            </div>
            <div className="ns-item">
              <div className="ns-v good">{savedMoney.toLocaleString('ru-RU')}<span className="ns-u"> ₽</span></div>
              <div className="ns-l">сэкономлено</div>
            </div>
            <div className="ns-item">
              <div className="ns-v">{savedMinutes}</div>
              <div className="ns-l">мин жизни</div>
            </div>
            <div className="ns-item">
              <div className={`ns-v ${state.relapses > 0 ? 'danger' : ''}`}>{state.relapses}</div>
              <div className="ns-l">срывов</div>
            </div>
            <div className="ns-item">
              <div className="ns-v small">{state.perDay}<span className="ns-u">/день</span></div>
              <div className="ns-l">норма</div>
            </div>
            <div className="ns-item">
              <div className="ns-v small">{pct}<span className="ns-u">%</span></div>
              <div className="ns-l">прогресс</div>
            </div>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab${tab === 'ship' ? ' on' : ''}`} onClick={() => setTab('ship')}>🏗 Секции</button>
        <button className={`tab${tab === 'do' ? ' on' : ''}`} onClick={() => setTab('do')}>🎯 Что сделать</button>
        <button className={`tab${tab === 'pet' ? ' on' : ''}`} onClick={() => setTab('pet')}>🐬 Игра</button>
        <button className={`tab${tab === 'body' ? ' on' : ''}`} onClick={() => setTab('body')}>🧬 Тело</button>
        <button className={`tab${tab === 'journal' ? ' on' : ''}`} onClick={() => setTab('journal')}>📔 Журнал</button>
      </div>

      <div className="panel tab-panel">
        {tab === 'ship' && (
          <>
            <h3>Секции корабля</h3>
            <div className="sections-list">
              {sections.map((s, i) => {
                const ready = s.filled >= s.cost;
                const active = !ready && s.filled > 0;
                return (
                  <div key={s.id} className={`section-row${ready ? ' done' : ''}`}>
                    <span className="n">#{i + 1}</span>
                    <span className="sec-name">{s.name}</span>
                    <div className="bar">
                      <span style={{ width: `${(s.filled / s.cost) * 100}%` }} />
                    </div>
                    <span className="c">
                      {s.filled}/{s.cost} {ready ? '✓' : active ? '…' : ''}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="tiny" style={{ marginTop: 10 }}>
              Всего {SECTIONS.length} секций, {TOTAL_BRICKS} досок. При {state.perDay}/день цель — 66 дней.
            </p>
          </>
        )}

        {tab === 'do' && (
          <>
            <h3>Челленджи — бонусные доски</h3>
            <p className="tiny" style={{ marginBottom: 12 }}>
              Каждое действие даёт сверх обычного таймера. Кулдауны — чтобы не читерить.
              Жми когда реально сделал.
            </p>
            <ActionsPanel state={state} onBonus={onBonus} />
          </>
        )}

        {tab === 'pet' && (
          <>
            <h3>Корабельный дельфин</h3>
            <p className="tiny" style={{ marginBottom: 12 }}>
              Когда накатывает тяга — займи руки тут. Корми, мой, играй.
              Питомец стареет от заботы, а не от времени: чем чаще приходишь — тем взрослее становится.
            </p>
            <Pet pet={state.pet} onAction={onPetAction} />
          </>
        )}

        {tab === 'body' && <StagesTimeline sinceMs={sinceStartMs} />}

        {tab === 'journal' && (
          <>
            <h3>Журнал тяги</h3>
            <p className="tiny" style={{ marginBottom: 12 }}>
              Записывая тягу и триггер, ты учишься распознавать её. Каждая запись = +1 доска.
            </p>
            <JournalPanel state={state} onAdd={onJournalAdd} />
          </>
        )}
      </div>
    </div>
  );
}
