import React, { createContext, useContext, useState, useCallback } from 'react';
import { Language, Goal, Style, AnalysisResult } from '../types';

interface SessionState {
  imageUri: string | null;
  goal: Goal | null;
  style: Style | null;
  inspirationImageUri: string | null;
  result: AnalysisResult | null;
  previousResult: AnalysisResult | null;
  previousImageUri: string | null;
  isPro: boolean;
}

interface AppContextType extends SessionState {
  language: Language;
  setLanguage: (lang: Language) => void;
  setImage: (uri: string) => void;
  setGoal: (goal: Goal) => void;
  setStyle: (style: Style) => void;
  setInspirationImage: (uri: string | null) => void;
  setResult: (result: AnalysisResult) => void;
  startRescan: () => void;
  resetSession: () => void;
  setIsPro: (val: boolean) => void;
  prepareRescan: (newImageUri: string) => void;
}

const defaultSession: SessionState = {
  imageUri: null,
  goal: null,
  style: null,
  inspirationImageUri: null,
  result: null,
  previousResult: null,
  previousImageUri: null,
  isPro: false,
};

export const AppContext = createContext<AppContextType>({
  ...defaultSession,
  language: 'en',
  setLanguage: () => {},
  setImage: () => {},
  setGoal: () => {},
  setStyle: () => {},
  setInspirationImage: () => {},
  setResult: () => {},
  startRescan: () => {},
  resetSession: () => {},
  setIsPro: () => {},
  prepareRescan: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [session, setSession] = useState<SessionState>(defaultSession);

  const setImage = useCallback((uri: string) => {
    setSession(prev => ({ ...prev, imageUri: uri }));
  }, []);

  const setGoal = useCallback((goal: Goal) => {
    setSession(prev => ({ ...prev, goal }));
  }, []);

  const setStyle = useCallback((style: Style) => {
    setSession(prev => ({ ...prev, style }));
  }, []);

  const setInspirationImage = useCallback((uri: string | null) => {
    setSession(prev => ({ ...prev, inspirationImageUri: uri }));
  }, []);

  const setResult = useCallback((result: AnalysisResult) => {
    setSession(prev => ({ ...prev, result }));
  }, []);

  const startRescan = useCallback(() => {
    setSession(prev => ({
      ...prev,
      previousResult: prev.result,
      previousImageUri: prev.imageUri,
      imageUri: null,
      result: null,
    }));
  }, []);

  const prepareRescan = useCallback((newImageUri: string) => {
    setSession(prev => ({
      ...prev,
      previousResult: prev.result,
      previousImageUri: prev.imageUri,
      imageUri: newImageUri,
      result: null,
    }));
  }, []);

  const resetSession = useCallback(() => {
    setSession(defaultSession);
  }, []);

  const setIsPro = useCallback((val: boolean) => {
    setSession(prev => ({ ...prev, isPro: val }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...session,
        language,
        setLanguage,
        setImage,
        setGoal,
        setStyle,
        setInspirationImage,
        setResult,
        startRescan,
        resetSession,
        setIsPro,
        prepareRescan,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
