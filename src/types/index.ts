export type Language = 'en' | 'he';
export type Goal = 'daily' | 'work' | 'date' | 'event' | 'photo';
export type Style = 'natural' | 'clean' | 'softGlam' | 'fullGlam' | 'dramatic' | 'bold';

export interface MarkerPosition {
  x: number;
  y: number;
}

export interface Fix {
  area: string;
  title: string;
  compliment: string;
  recommendation: string;
  location_explanation: string;
  marker_position: MarkerPosition;
}

export interface AnalysisResult {
  score: number;
  summary: string;
  fixes: Fix[];
}

export interface AnalysisError {
  is_valid: false;
  message: string;
}

export interface AnalysisSuccess extends AnalysisResult {
  is_valid: true;
}

export type AnalysisResponse = AnalysisSuccess | AnalysisError;

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
