import { useState } from 'react';
import type { Persist } from './types';
import { ACTIONS, type ActionDef } from './actions';
import { Breathing } from './Breathing';
import { useNow } from './store';

type Props = {
  state: Persist;
  onBonus: (amount: number, actionId: string) => void;
};

function fmtCooldown(ms: number) {
  if (ms < 60_000) return `${Math.ceil(ms / 1000)}с`;
  if (ms < 3600_000) return `${Math.ceil(ms / 60_000)}мин`;
  return `${Math.ceil(ms / 3600_000)}ч`;
}

export function ActionsPanel({ state, onBonus }: Props) {
  const now = useNow(1000);
  const [breathingOpen, setBreathingOpen] = useState<ActionDef | null>(null);

  const claim = (a: ActionDef) => {
    if (a.kind === 'breathing') {
      setBreathingOpen(a);
      return;
    }
    const nextReady = state.cooldowns[a.id] ?? 0;
    if (Date.now() < nextReady) return;
    onBonus(a.reward, a.id);
  };

  const onBreathingComplete = () => {
    if (!breathingOpen) return;
    onBonus(breathingOpen.reward, breathingOpen.id);
    setBreathingOpen(null);
  };

  return (
    <>
      <p className="honesty-note" style={{ marginBottom: 12 }}>
        Жми только если реально сделал. Кулдауны не спасут от самообмана — если «зарабатывать»
        доски просто так, они обесценятся, и корабль перестанет быть твоим. Это проверка на
        честность с собой, а не игра.
      </p>
      <div className="actions-grid">
        {ACTIONS.map((a) => {
          const next = state.cooldowns[a.id] ?? 0;
          const ready = now >= next;
          const remain = ready ? 0 : next - now;
          return (
            <button
              key={a.id}
              className={`action-tile${ready ? '' : ' locked'}`}
              onClick={() => claim(a)}
              disabled={!ready}
              title={a.desc}
            >
              <div className="a-head">
                <span className="a-ico">{a.icon}</span>
                <span className="a-reward">+{a.reward} 🪵</span>
              </div>
              <div className="a-name">{a.name}</div>
              <div className="a-desc">{a.desc}</div>
              <div className="a-cd">
                {ready ? <span className="ok">Готово — жми</span> : <span>через {fmtCooldown(remain)}</span>}
              </div>
            </button>
          );
        })}
      </div>

      {breathingOpen && (
        <Breathing
          onComplete={onBreathingComplete}
          onCancel={() => setBreathingOpen(null)}
        />
      )}
    </>
  );
}
