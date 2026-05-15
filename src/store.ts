import { useEffect, useRef, useState } from 'react';
import type { Persist } from './types';
import { TOTAL_BRICKS } from './sections';
import { defaultPet } from './petLogic';

const KEY = 'alcoholwork.v1';

export function loadPersist(): Persist | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<Persist>;
    if (typeof p.perDay !== 'number' || typeof p.lastDrinkAt !== 'number') return null;
    return {
      onboarded: p.onboarded ?? true,
      startedAt: p.startedAt ?? Date.now(),
      lastDrinkAt: p.lastDrinkAt,
      perDay: p.perDay,
      pricePerBottle: p.pricePerBottle ?? 500,
      relapses: p.relapses ?? 0,
      status: p.status ?? 'building',
      bonusBricks: p.bonusBricks ?? 0,
      cooldowns: p.cooldowns ?? {},
      journal: p.journal ?? [],
      reasons: p.reasons ?? [],
      letterToSelf: p.letterToSelf ?? '',
      pet: p.pet ?? defaultPet(Date.now()),
    };
  } catch {
    return null;
  }
}

export function savePersist(p: Persist) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function clearPersist() {
  localStorage.removeItem(KEY);
}

export function intervalMs(perDay: number): number {
  return Math.floor((24 * 60 * 60 * 1000) / Math.max(1, perDay));
}

export function computeEarned(lastDrinkAt: number, perDay: number, now: number): number {
  const step = intervalMs(perDay);
  const elapsed = Math.max(0, now - lastDrinkAt);
  return Math.floor(elapsed / step);
}

// Дробное число «не выпитых» порций — для денег и минут жизни.
// Доски = целое, но сэкономлено/минуты считаются от реально прошедшего времени,
// иначе первый час показывает 0 ₽ при норме 5/день — это не сходится с «ты держишься 1ч».
export function computeAvoidedFloat(lastDrinkAt: number, perDay: number, now: number): number {
  const step = intervalMs(perDay);
  const elapsed = Math.max(0, now - lastDrinkAt);
  return elapsed / step;
}

export function computeTickProgress(lastDrinkAt: number, perDay: number, now: number): number {
  const step = intervalMs(perDay);
  const elapsed = Math.max(0, now - lastDrinkAt);
  return (elapsed % step) / step;
}

export function useNow(intervalMsTick = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMsTick);
    return () => clearInterval(id);
  }, [intervalMsTick]);
  return now;
}

export function usePersist() {
  const [state, setState] = useState<Persist | null>(() => loadPersist());
  const ref = useRef(state);
  ref.current = state;

  useEffect(() => {
    if (state) savePersist(state);
  }, [state]);

  const update = (patch: Partial<Persist>) =>
    setState((prev) => (prev ? { ...prev, ...patch } : prev));

  return { state, setState, update };
}

export { TOTAL_BRICKS };
