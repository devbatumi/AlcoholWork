import type { Status, VisualPart } from './types';
import type { SectionView } from './sections';
import { visualProgress, type VisualProgress } from './sections';

type Props = {
  sections: SectionView[];
  status: Status;
  totalBuilt: number;
  glowing?: VisualPart | null;
};

// Степовая opacity: completedSubs/subs + 0.4 * fraction внутри текущей
// подсекции. Так каждое закрытие даёт заметный «щёлк» (60% шага),
// а внутри подсекции часть проявляется плавно (40% шага).
function op(p: VisualProgress, min = 0) {
  if (p.subs <= 0) return min;
  const v = (p.completedSubs + 0.4 * p.currentFraction) / p.subs;
  return Math.max(min, Math.min(1, v));
}

export function Ship({ sections, status, totalBuilt, glowing }: Props) {
  const v = visualProgress(sections);
  const keel = v.keel;
  const hull = v.hull;
  const deck = v.deck;
  const cabin = v.cabin;
  const mFore = v['mast-fore'];
  const mMain = v['mast-main'];
  const mMizzen = v['mast-mizzen'];
  const sails = v.sails;
  const flag = v.flag;
  const glowCls = (id: VisualPart) => (glowing === id ? ' part-glow' : '');

  const shipClass =
    status === 'sailed' ? 'ship-group sailing' :
    status === 'sunk' ? 'ship-group sinking' :
    'ship-group';

  // Спутники появляются по мере прогресса.
  const dolphinA = totalBuilt >= 100 ? 1 : 0;
  const dolphinB = totalBuilt >= 300 ? 1 : 0;
  const lifebuoy = totalBuilt >= 500 ? 1 : 0;
  const anchor = totalBuilt >= 700 ? 1 : 0;
  const gull = totalBuilt >= 900 ? 1 : 0;
  const lantern = totalBuilt >= 1100 ? 1 : 0;

  return (
    <svg className="ship-svg" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid meet">
      <defs>
        {/* Дневное закатное небо. */}
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#7ec8ff" />
          <stop offset="55%" stopColor="#ffd9a8" />
          <stop offset="100%" stopColor="#ffb47a" />
        </linearGradient>
        <linearGradient id="sea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#5fc4d8" />
          <stop offset="100%" stopColor="#1e6e9a" />
        </linearGradient>
        <linearGradient id="hullPaint" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="75%" stopColor="#eef4f9" />
          <stop offset="100%" stopColor="#c4d6e3" />
        </linearGradient>
        <linearGradient id="hullStripe" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2bb673" />
          <stop offset="100%" stopColor="#1d8a55" />
        </linearGradient>
        <linearGradient id="deckTeak" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#e7c79a" />
          <stop offset="100%" stopColor="#b5895a" />
        </linearGradient>
        <linearGradient id="sail" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e4eef5" />
        </linearGradient>
        <linearGradient id="mastChrome" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#dde6ec" />
          <stop offset="50%" stopColor="#9bb0bf" />
          <stop offset="100%" stopColor="#5e7787" />
        </linearGradient>
        <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fff3c8" />
          <stop offset="55%" stopColor="#ffb47a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffb47a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fff3c8" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#fff3c8" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="800" height="300" fill="url(#sky)" />

      {/* Солнце низко над горизонтом — закат. */}
      <circle cx="640" cy="220" r="72" fill="url(#sun)" />
      <circle cx="640" cy="220" r="32" fill="#fff3c8" opacity="0.95" />

      {/* Облака. */}
      <g fill="#ffffff" opacity="0.85">
        <ellipse cx="120" cy="70" rx="42" ry="12" />
        <ellipse cx="150" cy="62" rx="30" ry="10" />
        <ellipse cx="95" cy="78" rx="22" ry="8" />
      </g>
      <g fill="#ffffff" opacity="0.7">
        <ellipse cx="430" cy="50" rx="36" ry="10" />
        <ellipse cx="460" cy="44" rx="22" ry="8" />
      </g>
      <g fill="#ffffff" opacity="0.6">
        <ellipse cx="710" cy="100" rx="28" ry="8" />
        <ellipse cx="735" cy="106" rx="18" ry="6" />
      </g>

      {/* Чайка-спутник. */}
      {gull === 1 && (
        <g opacity="0.85">
          <path d="M320 110 q 6 -5 12 0 q 6 -5 12 0" stroke="#3a4a5a" strokeWidth="2.2" fill="none">
            <animateTransform attributeName="transform" type="translate"
              values="0 0; 60 -10; 0 0" dur="16s" repeatCount="indefinite" />
          </path>
        </g>
      )}

      {/* Море. */}
      <rect x="0" y="300" width="800" height="150" fill="url(#sea)" />

      {/* Солнечная дорожка на воде. */}
      <ellipse cx="640" cy="310" rx="120" ry="6" fill="#fff3c8" opacity="0.35">
        <animate attributeName="opacity" values="0.35;0.55;0.35" dur="4s" repeatCount="indefinite" />
      </ellipse>

      {/* Линия горизонта. */}
      <path d="M0 310 Q 80 304 160 310 T 320 310 T 480 310 T 640 310 T 800 310 L 800 320 L 0 320 Z"
        fill="#9ad9e5" opacity="0.75">
        <animate attributeName="d" dur="7s" repeatCount="indefinite"
          values="
            M0 310 Q 80 304 160 310 T 320 310 T 480 310 T 640 310 T 800 310 L 800 320 L 0 320 Z;
            M0 310 Q 80 316 160 310 T 320 310 T 480 310 T 640 310 T 800 310 L 800 320 L 0 320 Z;
            M0 310 Q 80 304 160 310 T 320 310 T 480 310 T 640 310 T 800 310 L 800 320 L 0 320 Z" />
      </path>

      {/* Дельфины-спутники. */}
      {dolphinA === 1 && (
        <g opacity="0.9">
          <g>
            <path d="M150 322 Q 165 314 180 322 Q 178 326 174 326 L 156 326 Q 152 326 150 322 Z" fill="#2b5d82" />
            <path d="M170 318 Q 175 312 180 320 L 175 322 Z" fill="#2b5d82" />
            <animateTransform attributeName="transform" type="translate"
              values="0 0; 30 -4; 0 0" dur="6s" repeatCount="indefinite" />
          </g>
        </g>
      )}
      {dolphinB === 1 && (
        <g opacity="0.9">
          <g>
            <path d="M610 332 Q 625 324 640 332 Q 638 336 634 336 L 616 336 Q 612 336 610 332 Z" fill="#2b5d82" />
            <path d="M630 328 Q 635 322 640 330 L 635 332 Z" fill="#2b5d82" />
            <animateTransform attributeName="transform" type="translate"
              values="0 0; -28 -3; 0 0" dur="7s" repeatCount="indefinite" />
          </g>
        </g>
      )}

      <g className={shipClass} style={{ transformOrigin: '400px 340px', transformBox: 'fill-box' }}>
        <ellipse cx="400" cy="392" rx="200" ry="6" fill="#000" opacity="0.28" />

        {/* Киль — узкая синяя плавниковая полоска под корпусом. */}
        <g className={`ship-part${glowCls('keel')}`} opacity={op(keel)}>
          <path d="M240 372 L560 372 L530 390 L270 390 Z" fill="#1a4a6e" />
          <line x1="240" y1="372" x2="560" y2="372" stroke="#0e2c40" strokeWidth="1.5" />
        </g>

        {/* Корпус — белая яхта с зелёной ватерлинией. */}
        <g className={`ship-part${glowCls('hull')}`} opacity={op(hull)}>
          <path
            d="M170 320 Q 200 310 270 308 L 540 308 Q 600 310 630 320 L 580 372 L 240 372 Z"
            fill="url(#hullPaint)"
            stroke="#9bb0bf"
            strokeWidth="1"
          />
          <path
            d="M180 358 L 620 358 L 605 372 L 240 372 L 180 358 Z"
            fill="url(#hullStripe)"
            opacity="0.9"
          />
          <path d="M210 315 L 590 315 L 590 320 L 210 320 Z" fill="#2bb673" opacity="0.7" />
          <g>
            <circle cx="260" cy="338" r="6" fill="#1a4a6e" />
            <circle cx="260" cy="338" r="4" fill="#5fc4d8" />
            <circle cx="310" cy="338" r="6" fill="#1a4a6e" />
            <circle cx="310" cy="338" r="4" fill="#5fc4d8" />
            <circle cx="360" cy="338" r="6" fill="#1a4a6e" />
            <circle cx="360" cy="338" r="4" fill="#5fc4d8" />
            <circle cx="440" cy="338" r="6" fill="#1a4a6e" />
            <circle cx="440" cy="338" r="4" fill="#5fc4d8" />
            <circle cx="490" cy="338" r="6" fill="#1a4a6e" />
            <circle cx="490" cy="338" r="4" fill="#5fc4d8" />
            <circle cx="540" cy="338" r="6" fill="#1a4a6e" />
            <circle cx="540" cy="338" r="4" fill="#5fc4d8" />
          </g>
          <text x="400" y="354" textAnchor="middle" fontSize="11" fill="#2b5d82" opacity="0.7" fontWeight="bold" fontFamily="sans-serif">
            SOBER
          </text>
        </g>

        {/* Палуба — тик. */}
        <g className={`ship-part${glowCls('deck')}`} opacity={op(deck)}>
          <path d="M200 308 L 600 308 L 630 320 L 170 320 Z" fill="url(#deckTeak)" />
          <g stroke="#7a5a3a" strokeWidth="0.7" opacity="0.45">
            <line x1="240" y1="310" x2="240" y2="320" />
            <line x1="290" y1="310" x2="290" y2="320" />
            <line x1="340" y1="310" x2="340" y2="320" />
            <line x1="390" y1="310" x2="390" y2="320" />
            <line x1="440" y1="310" x2="440" y2="320" />
            <line x1="490" y1="310" x2="490" y2="320" />
            <line x1="540" y1="310" x2="540" y2="320" />
          </g>
          <line x1="200" y1="305" x2="600" y2="305" stroke="#ffffff" strokeWidth="1.5" opacity="0.85" />
          <g fill="#ffffff" opacity="0.85">
            <circle cx="220" cy="305" r="1.8" />
            <circle cx="280" cy="305" r="1.8" />
            <circle cx="340" cy="305" r="1.8" />
            <circle cx="400" cy="305" r="1.8" />
            <circle cx="460" cy="305" r="1.8" />
            <circle cx="520" cy="305" r="1.8" />
            <circle cx="580" cy="305" r="1.8" />
          </g>
        </g>

        {/* Спасательный круг. */}
        {lifebuoy === 1 && (
          <g>
            <circle cx="225" cy="298" r="9" fill="none" stroke="#ff5d73" strokeWidth="4" />
            <circle cx="225" cy="298" r="9" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="6 3" />
          </g>
        )}

        {/* Якорь. */}
        {anchor === 1 && (
          <g stroke="#9bb0bf" strokeWidth="2" fill="none" opacity="0.95">
            <circle cx="370" cy="298" r="3" />
            <line x1="370" y1="301" x2="370" y2="316" />
            <path d="M362 314 Q 370 322 378 314" strokeLinecap="round" />
          </g>
        )}

        {/* Каюта — современная надстройка с тонированной лентой окон. */}
        <g className={`ship-part${glowCls('cabin')}`} opacity={op(cabin)}>
          <path
            d="M470 268 Q 470 260 478 260 L 582 260 Q 590 260 590 268 L 590 308 L 470 308 Z"
            fill="#ffffff"
            stroke="#9bb0bf"
            strokeWidth="1"
          />
          <rect x="478" y="272" width="104" height="14" rx="2" fill="#1a4a6e" opacity="0.8" />
          <rect x="478" y="272" width="104" height="4" rx="2" fill="#5fc4d8" opacity="0.6" />
          <g stroke="#ffffff" strokeWidth="1.5">
            <line x1="504" y1="272" x2="504" y2="286" />
            <line x1="530" y1="272" x2="530" y2="286" />
            <line x1="556" y1="272" x2="556" y2="286" />
          </g>
          <rect x="470" y="290" width="120" height="2" fill="#2bb673" opacity="0.85" />
        </g>

        {/* Навигационный огонёк. */}
        {lantern === 1 && (
          <g>
            <circle cx="530" cy="252" r="14" fill="url(#glow)" />
            <rect x="527" y="248" width="6" height="8" rx="1" fill="#fff3c8" />
            <line x1="530" y1="256" x2="530" y2="260" stroke="#9bb0bf" strokeWidth="1.5" />
          </g>
        )}

        {/* Фок-мачта — хром. */}
        <g className={`ship-part${glowCls('mast-fore')}`} opacity={op(mFore)}>
          <rect x="258" y="170" width="5" height="138" fill="url(#mastChrome)" />
          <rect x="226" y="200" width="72" height="3" fill="#5e7787" />
          <circle cx="260.5" cy="168" r="3" fill="#5e7787" />
        </g>

        {/* Грот-мачта. */}
        <g className={`ship-part${glowCls('mast-main')}`} opacity={op(mMain)}>
          <rect x="397" y="138" width="6" height="170" fill="url(#mastChrome)" />
          <rect x="346" y="172" width="106" height="3" fill="#5e7787" />
          <rect x="358" y="215" width="82" height="3" fill="#5e7787" />
          <circle cx="400" cy="136" r="3.5" fill="#5e7787" />
        </g>

        {/* Бизань. */}
        <g className={`ship-part${glowCls('mast-mizzen')}`} opacity={op(mMizzen)}>
          <rect x="536" y="180" width="5" height="80" fill="url(#mastChrome)" />
          <rect x="510" y="205" width="58" height="3" fill="#5e7787" />
          <circle cx="538.5" cy="178" r="3" fill="#5e7787" />
        </g>

        {/* Паруса — треугольные, как у современной яхты. */}
        <g className={`ship-part${glowCls('sails')}`} opacity={op(sails)}>
          {/* Передний стаксель. */}
          <path
            d="M260 173 L 260 305 L 200 305 Z"
            fill="url(#sail)"
            stroke="#c4d6e3"
            strokeWidth="1"
          />
          {/* Грот. */}
          <path
            d="M403 142 L 403 305 L 470 305 L 470 270 Z"
            fill="url(#sail)"
            stroke="#c4d6e3"
            strokeWidth="1"
          />
          {/* Кливер между фок-мачтой и гротом. */}
          <path
            d="M400 142 L 270 173 L 270 230 Z"
            fill="url(#sail)"
            stroke="#c4d6e3"
            strokeWidth="1"
            opacity="0.95"
          />
          {/* Бизань. */}
          <path
            d="M539 182 L 539 295 L 590 295 L 590 260 Z"
            fill="url(#sail)"
            stroke="#c4d6e3"
            strokeWidth="1"
          />
          {/* Тёплые блики заката на парусах. */}
          <g fill="#ffd9a8" opacity="0.18">
            <path d="M403 142 L 403 305 L 425 305 Z" />
            <path d="M260 173 L 260 305 L 235 305 Z" />
            <path d="M539 182 L 539 295 L 558 295 Z" />
          </g>
        </g>

        {/* Флаг и такелаж. */}
        <g className={`ship-part${glowCls('flag')}`} opacity={op(flag)}>
          <g stroke="#5e7787" strokeWidth="0.8" opacity="0.7">
            <line x1="400" y1="138" x2="310" y2="305" />
            <line x1="400" y1="138" x2="490" y2="305" />
            <line x1="260.5" y1="170" x2="220" y2="305" />
            <line x1="260.5" y1="170" x2="298" y2="305" />
            <line x1="538.5" y1="180" x2="512" y2="295" />
            <line x1="538.5" y1="180" x2="582" y2="295" />
          </g>
          {/* Зелёный вымпел — цвет «свободы». */}
          <path d="M400 134 L 442 128 L 432 134 L 442 140 L 400 134 Z" fill="#2bb673">
            <animateTransform attributeName="transform" type="translate"
              values="0 0; 2 -1; 0 0" dur="3s" repeatCount="indefinite" />
          </path>
          <path d="M260.5 165 L 282 161 L 260.5 157 Z" fill="#5fc4d8" />
          <path d="M538.5 175 L 558 171 L 538.5 167 Z" fill="#ffb47a" />
        </g>
      </g>

      {/* Передние волны. */}
      <path d="M0 360 Q 80 354 160 360 T 320 360 T 480 360 T 640 360 T 800 360 L 800 450 L 0 450 Z"
        fill="#3aa1c0" opacity="0.85">
        <animate attributeName="d" dur="5s" repeatCount="indefinite"
          values="
            M0 360 Q 80 354 160 360 T 320 360 T 480 360 T 640 360 T 800 360 L 800 450 L 0 450 Z;
            M0 360 Q 80 366 160 360 T 320 360 T 480 360 T 640 360 T 800 360 L 800 450 L 0 450 Z;
            M0 360 Q 80 354 160 360 T 320 360 T 480 360 T 640 360 T 800 360 L 800 450 L 0 450 Z" />
      </path>
      <path d="M0 380 Q 60 374 120 380 T 240 380 T 360 380 T 480 380 T 600 380 T 720 380 T 800 380 L 800 450 L 0 450 Z"
        fill="#1e6e9a">
        <animate attributeName="d" dur="4s" repeatCount="indefinite"
          values="
            M0 380 Q 60 374 120 380 T 240 380 T 360 380 T 480 380 T 600 380 T 720 380 T 800 380 L 800 450 L 0 450 Z;
            M0 380 Q 60 386 120 380 T 240 380 T 360 380 T 480 380 T 600 380 T 720 380 T 800 380 L 800 450 L 0 450 Z;
            M0 380 Q 60 374 120 380 T 240 380 T 360 380 T 480 380 T 600 380 T 720 380 T 800 380 L 800 450 L 0 450 Z" />
      </path>

      {/* Пенные барашки. */}
      <g fill="#ffffff" opacity="0.5">
        <ellipse cx="120" cy="386" rx="8" ry="2" />
        <ellipse cx="280" cy="392" rx="6" ry="1.5" />
        <ellipse cx="500" cy="384" rx="9" ry="2" />
        <ellipse cx="680" cy="390" rx="7" ry="1.5" />
      </g>
    </svg>
  );
}
