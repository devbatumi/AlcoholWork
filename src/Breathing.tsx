import { useEffect, useRef, useState } from 'react';

type Phase = 'in' | 'hold' | 'out' | 'rest';

type Props = {
  onComplete: () => void;
  onCancel: () => void;
};

const PLAN: { p: Phase; sec: number; label: string }[] = [
  { p: 'in', sec: 4, label: 'Вдох через нос' },
  { p: 'hold', sec: 7, label: 'Задержка' },
  { p: 'out', sec: 8, label: 'Медленный выдох ртом' },
];

const CYCLES = 4;

export function Breathing({ onComplete, onCancel }: Props) {
  const [cycle, setCycle] = useState(0);
  const [step, setStep] = useState(0);
  const [t, setT] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    startRef.current = Date.now();
    const tick = () => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const dur = PLAN[step].sec;
      if (elapsed >= dur) {
        const nextStep = step + 1;
        if (nextStep >= PLAN.length) {
          if (cycle + 1 >= CYCLES) {
            onComplete();
            return;
          }
          setCycle((c) => c + 1);
          setStep(0);
          startRef.current = Date.now();
          setT(0);
        } else {
          setStep(nextStep);
          startRef.current = Date.now();
          setT(0);
        }
      } else {
        setT(elapsed);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [step, cycle, onComplete]);

  const cur = PLAN[step];
  const pct = Math.min(1, t / cur.sec);
  const scale = cur.p === 'in' ? 0.6 + 0.4 * pct :
                cur.p === 'hold' ? 1.0 :
                cur.p === 'out' ? 1.0 - 0.4 * pct : 0.6;

  return (
    <div className="modal">
      <div className="modal-card breathing">
        <h2>Техника 4-7-8</h2>
        <p className="tiny">
          Цикл {cycle + 1} / {CYCLES}. Это активирует парасимпатическую нервную систему
          и гасит острую тягу за 1-2 минуты.
        </p>
        <div className="breath-ring">
          <div
            className="breath-ball"
            style={{ transform: `scale(${scale})` }}
          />
          <div className="breath-label">
            <div className="bl-phase">{cur.label}</div>
            <div className="bl-count">{Math.max(0, Math.ceil(cur.sec - t))}</div>
          </div>
        </div>
        <div className="breath-steps">
          {PLAN.map((p, i) => (
            <div key={i} className={`bs${i === step ? ' on' : ''}${i < step ? ' done' : ''}`}>
              {p.sec}с · {p.label.split(' ')[0]}
            </div>
          ))}
        </div>
        <div className="actions center">
          <button className="ghost" onClick={onCancel}>Прервать</button>
        </div>
      </div>
    </div>
  );
}
