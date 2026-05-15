import { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  value: Date | null;
  onChange: (d: Date | null) => void;
  max?: Date;
  min?: Date;
};

type Seg = { key: 'd' | 'm' | 'y' | 'hh' | 'mm'; len: number; placeholder: string; label: string };

const SEGMENTS: Seg[] = [
  { key: 'd',  len: 2, placeholder: 'ДД',   label: 'день' },
  { key: 'm',  len: 2, placeholder: 'ММ',   label: 'месяц' },
  { key: 'y',  len: 4, placeholder: 'ГГГГ', label: 'год' },
  { key: 'hh', len: 2, placeholder: 'ЧЧ',   label: 'часы' },
  { key: 'mm', len: 2, placeholder: 'ММ',   label: 'минуты' },
];

function pad(v: number, len: number) { return String(v).padStart(len, '0'); }

function parse(parts: Record<Seg['key'], string>): Date | null {
  for (const s of SEGMENTS) {
    if (parts[s.key].length !== s.len) return null;
  }
  const d = parseInt(parts.d, 10);
  const m = parseInt(parts.m, 10);
  const y = parseInt(parts.y, 10);
  const hh = parseInt(parts.hh, 10);
  const mm = parseInt(parts.mm, 10);
  if (m < 1 || m > 12) return null;
  if (d < 1 || d > 31) return null;
  if (hh > 23 || mm > 59) return null;
  if (y < 2000 || y > 2100) return null;
  const date = new Date(y, m - 1, d, hh, mm, 0, 0);
  if (date.getDate() !== d || date.getMonth() !== m - 1) return null; // 31 февраля и т.п.
  return date;
}

export function SmartDateInput({ value, onChange, max, min }: Props) {
  const initial = value ?? new Date();
  const [parts, setParts] = useState<Record<Seg['key'], string>>(() => ({
    d:  pad(initial.getDate(), 2),
    m:  pad(initial.getMonth() + 1, 2),
    y:  String(initial.getFullYear()),
    hh: pad(initial.getHours(), 2),
    mm: pad(initial.getMinutes(), 2),
  }));

  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const focusSeg = (idx: number) => {
    const el = refs.current[idx];
    if (el) { el.focus(); el.select(); }
  };

  const setPart = (key: Seg['key'], v: string) => setParts((p) => ({ ...p, [key]: v }));

  const onInput = (idx: number, seg: Seg, raw: string) => {
    const clean = raw.replace(/\D/g, '').slice(0, seg.len);
    setPart(seg.key, clean);
    if (clean.length === seg.len && idx < SEGMENTS.length - 1) {
      focusSeg(idx + 1);
    }
  };

  const onKey = (idx: number, seg: Seg, e: React.KeyboardEvent<HTMLInputElement>) => {
    const cur = parts[seg.key];
    if (e.key === 'Backspace' && cur.length === 0 && idx > 0) {
      e.preventDefault();
      focusSeg(idx - 1);
      const prev = SEGMENTS[idx - 1];
      setPart(prev.key, parts[prev.key].slice(0, -1));
    } else if (e.key === 'ArrowRight' && idx < SEGMENTS.length - 1) {
      const el = e.currentTarget;
      if (el.selectionStart === cur.length) { e.preventDefault(); focusSeg(idx + 1); }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      const el = e.currentTarget;
      if (el.selectionStart === 0) { e.preventDefault(); focusSeg(idx - 1); }
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    const digits = text.replace(/\D/g, '');
    if (digits.length >= 12) {
      e.preventDefault();
      setParts({
        d:  digits.slice(0, 2),
        m:  digits.slice(2, 4),
        y:  digits.slice(4, 8),
        hh: digits.slice(8, 10),
        mm: digits.slice(10, 12),
      });
      focusSeg(SEGMENTS.length - 1);
    }
  };

  const parsed = useMemo(() => parse(parts), [parts]);

  useEffect(() => {
    if (!parsed) { onChange(null); return; }
    if (max && parsed > max) { onChange(null); return; }
    if (min && parsed < min) { onChange(null); return; }
    onChange(parsed);
  }, [parsed]);

  const invalid = parts.d.length === 2 && parts.m.length === 2 && parts.y.length === 4 && !parsed;
  const outOfRange = parsed && ((max && parsed > max) || (min && parsed < min));

  return (
    <div>
      <div className={`smartdate${invalid || outOfRange ? ' bad' : ''}`} onClick={(e) => {
        if (e.target === e.currentTarget) focusSeg(0);
      }}>
        {SEGMENTS.map((seg, idx) => (
          <span key={seg.key} className="sd-seg-wrap">
            <input
              ref={(el) => { refs.current[idx] = el; }}
              className="sd-seg"
              style={{ width: `${seg.len}ch` }}
              value={parts[seg.key]}
              placeholder={seg.placeholder}
              inputMode="numeric"
              aria-label={seg.label}
              onChange={(e) => onInput(idx, seg, e.target.value)}
              onKeyDown={(e) => onKey(idx, seg, e)}
              onPaste={onPaste}
              onFocus={(e) => e.currentTarget.select()}
            />
            {idx < SEGMENTS.length - 1 && (
              <span className="sd-sep">
                {idx === 1 ? '.' : idx === 2 ? ' ' : idx === 3 ? ':' : '.'}
              </span>
            )}
          </span>
        ))}
      </div>
      {invalid && <div className="sd-hint bad">Проверь дату — такой не существует</div>}
      {outOfRange && <div className="sd-hint bad">Дата должна быть в прошлом (не в будущем и не старше года)</div>}
    </div>
  );
}
