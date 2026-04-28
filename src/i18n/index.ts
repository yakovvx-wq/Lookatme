import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { en } from './en';
import { he } from './he';

export function useT() {
  const { language } = useContext(AppContext);
  return language === 'he' ? he : en;
}

export function useRTL(): boolean {
  const { language } = useContext(AppContext);
  return language === 'he';
}

export function rtlText(isRTL: boolean) {
  return isRTL
    ? ({ textAlign: 'right' as const, writingDirection: 'rtl' as const })
    : ({ textAlign: 'left' as const, writingDirection: 'ltr' as const });
}
