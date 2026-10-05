export type AspectRatio = '16:9' | '9:16' | '1:1';

export type DurationOption = 10 | 12 | 15;

export type VoiceoverLanguage = 'bn' | 'en' | 'none';

export type ColorGrade = 'golden' | 'vibrant' | 'dusk' | 'clean';

export interface CommercialScene {
  id: string;
  number: number;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  imageSrc: string;
  locationLabelBn: string;
  locationLabelEn: string;
  cameraMovement: {
    startScale: number;
    endScale: number;
    startX: number;
    endX: number;
    startY: number;
    endY: number;
  };
  narrationBn: string;
  narrationEn: string;
  highlights: string[];
}

export type MusicTrackId = 'festive' | 'acoustic' | 'orchestral' | 'pop' | 'custom';

export interface VideoSettings {
  duration: DurationOption;
  aspectRatio: AspectRatio;
  voiceoverLang: VoiceoverLanguage;
  musicTrack: MusicTrackId;
  customAudioUrl?: string;
  customAudioName?: string;
  colorGrade: ColorGrade;
  cinemaBars: boolean;
  filmGrain: boolean;
  lensFlare: boolean;
  showLocationBadge: boolean;
  showSlogan: boolean;
  showSubtitles: boolean;
  audioVolume: number;
  isMuted: boolean;
}
