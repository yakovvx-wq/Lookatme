export type Language = 'en' | 'he';
export type Goal = 'daily' | 'work' | 'date' | 'event' | 'photo';
export type Style = 'natural' | 'clean' | 'softGlam' | 'fullGlam' | 'dramatic' | 'bold';
export type ImageQuality = 'good' | 'medium' | 'poor';
export type NextAction = 'save_result' | 'continue_improving';
export type ImprovementLevel = 'none' | 'small' | 'medium' | 'strong';

export interface Recommendation {
  area: string;
  title: string;
  recommendation: string;
  quick_action: string;
  marker_color: string;
  marker_position: { x: number; y: number };
}

export interface ZoneScore {
  score: number;
  note: string;
}

export interface FullAnalysis {
  base?: ZoneScore;
  concealer?: ZoneScore;
  eyeshadow?: ZoneScore;
  eyeliner?: ZoneScore;
  lashes?: ZoneScore;
  brows?: ZoneScore;
  blush?: ZoneScore;
  contour?: ZoneScore;
  lips?: ZoneScore;
  harmony?: ZoneScore;
}

export interface AnalysisResult {
  is_valid: true;
  score: number;
  summary: string;
  photo_quality?: ImageQuality;
  photo_quality_note?: string;
  full_analysis?: FullAnalysis;
  recommendations: Recommendation[];
}

export interface AnalysisError {
  is_valid: false;
  error_type: string;
  message: string;
}

export interface RecommendationResult {
  previous_title: string;
  was_improved: boolean;
  result_text: string;
}

export interface RescanResult {
  is_valid: true;
  is_rescan: true;
  previous_score: number;
  new_score: number;
  change_detected: boolean;
  improvement_level: ImprovementLevel;
  summary: string;
  recommendation_results: RecommendationResult[];
  still_needs_work: boolean;
  next_recommendations: Recommendation[];
  next_action: NextAction;
}

export type AnalysisResponse = AnalysisResult | AnalysisError | RescanResult;

export type RootStackParamList = {
  Welcome: undefined;
  Capture: { isRescan?: boolean };
  Confirm: { imageUri: string; isRescan: boolean };
  Goal: undefined;
  Style: undefined;
  Analyzing: { isRescan: boolean };
  Results: undefined;
  Rescan: undefined;
  Paywall: undefined;
};
