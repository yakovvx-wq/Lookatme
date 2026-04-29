export type Language = 'en' | 'he';
export type Goal = 'daily' | 'work' | 'date' | 'event' | 'photo';
export type Style = 'natural' | 'clean' | 'softGlam' | 'fullGlam' | 'dramatic' | 'bold';

export interface Recommendation {
  area: string;
  title: string;
  compliment?: string;
  recommendation: string;
  quick_action: string;
  marker_color: string;
  marker_position: { x: number; y: number };
}

export interface AnalysisResult {
  score: number;
  summary: string;
  recommendations: Recommendation[];
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
