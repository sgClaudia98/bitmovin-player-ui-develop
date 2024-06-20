import { ErrorMessageMap, ErrorMessageTranslator } from './components/errormessageoverlay';

export interface UIRecommendationConfig {
  title: string;
  url: string;
  slug?: string;
  thumbnail?: string;
  duration?: number;
  idint?: number;
}

export interface UINextItemConfig {
  title?: string;
  url?: string;
  slug?: string;
  thumbnail?: string;
  duration?: number;
  positionPercentatgeOffset?: number;
  idint?: number;
}
