export type Language = 'en' | 'he';
export type Goal = 'daily' | 'work' | 'date' | 'event' | 'photo';
export type Style = 'natural' | 'clean' | 'softGlam' | 'fullGlam' | 'dramatic' | 'bold';

export interface Zone {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  number: number;
}

export interface Fix {
  area: string;
  title: string;
  compliment: string;
  recommendation: string;
  location_explanation: string;
  zone: Zone;
}

export interface AnalysisResult {
  score: number;
  summary: string;
  fixes: Fix[];
  face_image?: string;
}

export type AnalysisResponse = AnalysisResult;

export type RootStackParamList = {
  Welcome: undefined;
  Capture: { isRescan?: boolean };
  Goal: undefined;
  Style: undefined;
  Analyzing: { isRescan: boolean };
  Results: undefined;
  Rescan: undefined;
  Paywall: undefined;
};
