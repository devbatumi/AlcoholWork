import { useMemo } from 'react';
import type { PetState } from './types';
import {
  PET_ACTIONS,
  currentStats,
  moodMessage,
  petMood,
  petStage,
  stageLabel,
  type PetCurrent,
  type PetMood,
  type PetStage,
} from './petLogic';
import { useNow } from './store';

type Props = {
  pet: PetState;
  onAction: (actionId: string) => void;
};

function fmtCooldown(ms: number) {
  if (ms <= 0) return '';
  if (ms < 60_000) return `${Math.ceil(ms / 1000)}с`;
  if (ms < 3600_000) return `${Math.ceil(ms / 60_000)}мин`;
  return `${Math.ceil(ms / 3600_000)}ч`;
}

function StatBar({
  label,
  value,
  icon,
  warn,
}: {
  label: string;
  value: number;
  icon: string;
  warn: boolean;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const tone =
    pct > 60 ? 'good' : pct > 30 ? 'mid' : 'low';
  return (
    <div className={`pet-stat tone-${tone}${warn ? ' warn' : ''}`}>
      <div className="pet-stat-head">
        <span className="pet-stat-icon">{icon}</span>
        <span className="pet-stat-label">{label}</span>
        <span className="pet-stat-val">{Math.round(pct)}</span>
      </div>
      <div className="pet-stat-bar">
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function DolphinSVG({
  mood,
  stage,
  bored,
}: {
  mood: PetMood;
  stage: PetStage;
  bored: boolean;
}) {
  const sleeping = mood === 'sleep';
  const happy = mood === 'happy';
  const sad = mood === 'sad' || mood === 'sick';
  // По стадии меняем размер тела
  const scale =
    stage === 'egg'
      ? 0.55
      : stage === 'chick'
      ? 0.7
      : stage === 'fledgling'
      ? 0.85
      : 1;

  if (stage === 'egg') {
    return (
      <svg viewBox="0 0 200 200" className={`pet-svg ${sleeping ? 'pet-sleep' : happy ? 'pet-happy' : ''}`}>
        <defs>
          <linearGradient id="egg-water" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#7fd8e8" />
            <stop offset="100%" stopColor="#3a8aa8" />
          </linearGradient>
        </defs>
        <rect x="0" y="120" width="200" height="80" fill="url(#egg-water)" opacity="0.4" />
        <ellipse cx="100" cy="180" rx="50" ry="5" fill="#000" opacity="0.25" />
        {/* Икринка-шарик */}
        <circle cx="100" cy="105" r="36" fill="#cfeff3" stroke="#5aa9bf" strokeWidth="2" />
        <circle cx="100" cy="105" r="22" fill="#ffd1a3" opacity="0.7" />
        <circle cx="92" cy="98" r="6" fill="#fff" opacity="0.6" />
        {!sleeping && bored && (
          <text x="100" y="148" textAnchor="middle" fontSize="13" fill="#2a6478" opacity="0.7">
            буль-буль?
          </text>
        )}
      </svg>
    );
  }

  // Параметры для разных настроений
  const eyeY = sleeping ? 82 : sad ? 86 : 80;
  const eyeR = sleeping ? 0.5 : 4;
  const finRot = happy ? -12 : sad ? 8 : 0;

  return (
    <svg
      viewBox="0 0 200 200"
      className={`pet-svg ${sleeping ? 'pet-sleep' : happy ? 'pet-happy' : sad ? 'pet-sad' : ''}`}
    >
      <defs>
        <linearGradient id="dolph-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#6aa9d6" />
          <stop offset="100%" stopColor="#2b5d82" />
        </linearGradient>
        <linearGradient id="dolph-belly" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#eaf3f9" />
          <stop offset="100%" stopColor="#b8d5e8" />
        </linearGradient>
        <linearGradient id="dolph-water" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#7fd8e8" />
          <stop offset="100%" stopColor="#2a6478" />
        </linearGradient>
      </defs>

      {/* water */}
      <rect x="0" y="130" width="200" height="70" fill="url(#dolph-water)" opacity="0.55" />
      <path d="M0 135 Q 50 130 100 135 T 200 135 L 200 200 L 0 200 Z" fill="#3a8aa8" opacity="0.7">
        <animate attributeName="d" dur="6s" repeatCount="indefinite"
          values="
            M0 135 Q 50 130 100 135 T 200 135 L 200 200 L 0 200 Z;
            M0 135 Q 50 140 100 135 T 200 135 L 200 200 L 0 200 Z;
            M0 135 Q 50 130 100 135 T 200 135 L 200 200 L 0 200 Z" />
      </path>

      <ellipse cx="100" cy="178" rx="58" ry="5" fill="#000" opacity="0.2" />

      <g transform={`translate(100 ${110}) scale(${scale}) translate(-100 -110)`}>
        {/* tail */}
        <path
          d="M40 110 Q 22 96 18 80 L 40 96 Z"
          fill="#2b5d82"
          opacity="0.95"
        />
        <path
          d="M40 110 Q 22 124 18 138 L 40 122 Z"
          fill="#2b5d82"
          opacity="0.95"
        />

        {/* body */}
        <path
          d="M40 110 Q 60 80 100 78 Q 145 78 165 100 Q 162 122 130 130 Q 90 138 60 130 Q 45 122 40 110 Z"
          fill="url(#dolph-body)"
        />
        {/* belly */}
        <path
          d="M60 122 Q 100 132 150 122 Q 140 138 100 138 Q 70 138 60 122 Z"
          fill="url(#dolph-belly)"
        />

        {/* dorsal fin */}
        <g transform={`rotate(${finRot} 110 80)`} style={{ transition: 'transform 0.3s ease' }}>
          <path
            d="M105 80 Q 115 60 130 78 L 122 86 Z"
            fill="#2b5d82"
          />
        </g>

        {/* side fin */}
        <path
          d="M80 116 Q 70 130 78 138 L 96 124 Z"
          fill="#1f4863"
          opacity="0.9"
        />

        {/* rostrum (beak) */}
        <path
          d="M155 100 Q 178 102 185 110 Q 175 116 158 114 Z"
          fill="#1f4863"
        />
        <line x1="160" y1="108" x2="178" y2="110" stroke="#0e2c40" strokeWidth="1" opacity="0.5" />

        {/* eye */}
        <g>
          {sleeping ? (
            <path
              d="M138 82 Q 144 86 150 82"
              stroke="#1a1a1a"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          ) : (
            <>
              <circle cx="144" cy={eyeY} r={eyeR + 1} fill="#fff" />
              <circle cx="144" cy={eyeY} r={eyeR} fill="#1a1a1a" />
              <circle cx="145" cy={eyeY - 1} r="1" fill="#fff" />
            </>
          )}
        </g>

        {/* smile */}
        {happy && (
          <path
            d="M160 112 Q 170 118 180 114"
            stroke="#0e2c40"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        )}
        {sad && (
          <path
            d="M160 116 Q 170 112 180 116"
            stroke="#0e2c40"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* sleep zzz */}
        {sleeping && (
          <g fill="#8a97c4" opacity="0.85">
            <text x="60" y="60" fontSize="14">
              z
            </text>
            <text x="46" y="48" fontSize="18">
              Z
            </text>
            <text x="34" y="32" fontSize="22">
              Z
            </text>
          </g>
        )}

        {/* happy bubbles */}
        {happy && (
          <g fill="#cfeff3" opacity="0.9">
            <circle cx="170" cy="60" r="5" />
            <circle cx="184" cy="48" r="3" />
            <circle cx="178" cy="38" r="4" />
          </g>
        )}

        {/* sad tear */}
        {sad && (
          <ellipse cx="142" cy="98" rx="2" ry="4" fill="#6cb8f0" opacity="0.85" />
        )}
      </g>
    </svg>
  );
}

export function Pet({ pet, onAction }: Props) {
  const now = useNow(2000);
  const stats: PetCurrent = useMemo(() => currentStats(pet, now), [pet, now]);
  const mood = petMood(stats);
  const stage = petStage(pet.totalActions);
  const ageDays = Math.max(0, (now - pet.bornAt) / 86_400_000);
  const ageLabel =
    ageDays < 1 ? `${Math.floor(ageDays * 24)}ч` : `${Math.floor(ageDays)}д`;
  const lowestStat = Math.min(
    stats.hunger,
    stats.happiness,
    stats.energy,
    stats.cleanliness,
  );
  const bored = lowestStat < 25;

  return (
    <div className="pet-wrap">
      <div className="pet-stage-card">
        <div className="pet-figure">
          <DolphinSVG mood={mood} stage={stage} bored={bored} />
        </div>
        <div className="pet-id">
          <div className="pet-name">{pet.name}</div>
          <div className="pet-meta">
            {stageLabel(stage)} · {ageLabel} · {pet.totalActions} забот
          </div>
          <div className={`pet-mood pet-mood-${mood}`}>
            {moodMessage(mood, pet.name)}
          </div>
        </div>
      </div>

      <div className="pet-stats">
        <StatBar label="Сытость" value={stats.hunger} icon="🐟" warn={stats.hunger < 25} />
        <StatBar label="Настроение" value={stats.happiness} icon="🏐" warn={stats.happiness < 25} />
        <StatBar label="Энергия" value={stats.energy} icon="💤" warn={stats.energy < 25} />
        <StatBar label="Чистота" value={stats.cleanliness} icon="🛁" warn={stats.cleanliness < 25} />
      </div>

      <div className="pet-actions-grid">
        {PET_ACTIONS.map((a) => {
          const cdEnd = pet.cooldowns?.[a.id] ?? 0;
          const remain = Math.max(0, cdEnd - now);
          const ready = remain <= 0;
          return (
            <button
              key={a.id}
              className={`pet-action${ready ? '' : ' is-cooldown'}`}
              onClick={() => ready && onAction(a.id)}
              disabled={!ready}
              title={a.hint}
            >
              <div className="pa-emoji">{a.emoji}</div>
              <div className="pa-body">
                <div className="pa-label">{a.label}</div>
                <div className="pa-hint">{a.hint}</div>
                <div className="pa-meta">
                  {ready ? `+${a.amount} ${statShort(a.stat)}` : `через ${fmtCooldown(remain)}`}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="tiny" style={{ marginTop: 12 }}>
        Тяга накатила — займи руки тут. Чем дольше держится корабль,
        тем взрослее становится {pet.name}: {pet.totalActions}/200 действий до вожака стаи.
      </p>
    </div>
  );
}

function statShort(stat: string): string {
  switch (stat) {
    case 'hunger':
      return 'к сытости';
    case 'happiness':
      return 'к настроению';
    case 'energy':
      return 'к энергии';
    case 'cleanliness':
      return 'к чистоте';
    default:
      return '';
  }
}
