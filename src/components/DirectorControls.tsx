import React from 'react';
import {
  Sliders,
  Sparkles,
  Volume2,
  Tv,
  Eye,
  Film,
  Globe2,
  Palette,
  MapPin,
  Clock,
  Layers,
  Music,
  Upload,
} from 'lucide-react';
import { VideoSettings, VoiceoverLanguage, ColorGrade, MusicTrackId } from '../types.ts';
import { commercialAudio } from '../services/audioEngine.ts';

interface DirectorControlsProps {
  settings: VideoSettings;
  onUpdateSettings: (updater: (prev: VideoSettings) => VideoSettings) => void;
  onOpenExport: () => void;
}

export const DirectorControls: React.FC<DirectorControlsProps> = ({
  settings,
  onUpdateSettings,
  onOpenExport,
}) => {
  return (
    <section id="director" className="w-full max-w-[1080px] mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-neutral-800">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-neutral-100 flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-amber-400" />
            <span>Director's Commercial Suite</span>
          </h2>
          <p className="text-xs md:text-sm text-neutral-400 mt-1">
            Fine-tune broadcast pacing, typography overlays, audio mix, and cinematic aesthetics.
          </p>
        </div>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-neutral-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-all shadow-md shadow-amber-400/20 active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Render & Export</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Voiceover & Audio Configuration */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200 mb-3">
              <Globe2 className="w-4 h-4 text-amber-400" />
              <span>Voiceover Narration</span>
            </div>
            <p className="text-xs text-neutral-400 mb-4">
              Synced commercial voice narration in English or native Bengali for Rajshahi audiences.
            </p>

            <div className="flex flex-col gap-2">
              {[
                { id: 'bn', label: 'Bengali (বাংলা)', sub: 'উপশহর, নিউমার্কেট, রাজশাহী' },
                { id: 'en', label: 'English (EN)', sub: 'Together for Better Living' },
                { id: 'none', label: 'Instrumental Theme Only', sub: 'No spoken narration' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() =>
                    onUpdateSettings(s => ({
                      ...s,
                      voiceoverLang: opt.id as VoiceoverLanguage,
                    }))
                  }
                  className={`flex flex-col text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                    settings.voiceoverLang === opt.id
                      ? 'bg-amber-500/15 border-amber-500/80 text-white'
                      : 'bg-neutral-950/60 border-neutral-800/80 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  <span className="text-xs font-semibold">{opt.label}</span>
                  <span className="text-[11px] text-neutral-500">{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
            <span className="text-xs text-neutral-400">Audio Volume</span>
            <span className="text-xs font-mono text-amber-400">
              {settings.isMuted ? 'Muted' : `${Math.round(settings.audioVolume * 100)}%`}
            </span>
          </div>
        </div>

        {/* 2. Commercial Background Music Track Selection */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200 mb-3">
              <Music className="w-4 h-4 text-amber-400" />
              <span>Background Soundtrack</span>
            </div>
            <p className="text-xs text-neutral-400 mb-4">
              Select or upload commercial background music suited for broadcast advertisements.
            </p>

            <div className="space-y-2">
              {[
                { id: 'festive', title: 'Festive Bangla Anthem', desc: 'Dhol beat, energetic acoustic melody & chimes' },
                { id: 'acoustic', title: 'Retail Acoustic Strum', desc: 'Bright acoustic chords, clapping rhythm & bass' },
                { id: 'orchestral', title: 'Grand Orchestral Anthem', desc: 'Inspiring strings, warm brass, retail crescendo' },
                { id: 'pop', title: 'Modern Pop Jingle', desc: 'Catchy synth bells & driving retail groove' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    commercialAudio.resumeContext();
                    onUpdateSettings(s => ({ ...s, musicTrack: item.id as MusicTrackId }));
                  }}
                  className={`w-full flex flex-col text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                    settings.musicTrack === item.id
                      ? 'bg-amber-500/15 border-amber-500/80 text-white'
                      : 'bg-neutral-950/60 border-neutral-800/80 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  <span className="text-xs font-semibold">{item.title}</span>
                  <span className="text-[11px] text-neutral-500">{item.desc}</span>
                </button>
              ))}

              {/* Upload Custom Audio File */}
              <label className="w-full flex items-center justify-between p-2.5 rounded-lg bg-neutral-950/60 border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer text-xs">
                <span className="flex items-center gap-2 font-medium">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{settings.customAudioName ? `Selected: ${settings.customAudioName}` : 'Upload Custom MP3/Audio'}</span>
                </span>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      commercialAudio.resumeContext();
                      const url = URL.createObjectURL(file);
                      onUpdateSettings(s => ({
                        ...s,
                        musicTrack: 'custom',
                        customAudioUrl: url,
                        customAudioName: file.name,
                      }));
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <span>Audio Master: 48kHz Stereo</span>
            <span className="text-amber-400 font-mono">Synced to Cuts</span>
          </div>
        </div>

        {/* 3. Color Grading LUTs */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200 mb-3">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>Commercial Color Grade</span>
            </div>
            <p className="text-xs text-neutral-400 mb-4">
              Select post-production color grading suited for supermarket luxury commercials.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'golden', name: 'Golden Glow', desc: 'Warm commercial dusk' },
                { id: 'vibrant', name: 'Vibrant Fresh', desc: 'Rich organic colors' },
                { id: 'dusk', name: 'Velvet Twilight', desc: 'Dramatic contrast' },
                { id: 'clean', name: 'Pristine Clean', desc: 'Neutral modern tint' },
              ].map(grade => (
                <button
                  key={grade.id}
                  onClick={() =>
                    onUpdateSettings(s => ({
                      ...s,
                      colorGrade: grade.id as ColorGrade,
                    }))
                  }
                  className={`flex flex-col text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                    settings.colorGrade === grade.id
                      ? 'bg-amber-500/15 border-amber-500/80 text-white'
                      : 'bg-neutral-950/60 border-neutral-800/80 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  <span className="text-xs font-semibold">{grade.name}</span>
                  <span className="text-[10px] text-neutral-500">{grade.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <span>Color Profile: Rec.709 D65</span>
            <span className="text-amber-400 font-mono">35mm Anamorphic</span>
          </div>
        </div>

        {/* 4. On-Screen Overlays & Brand Elements */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between md:col-span-2 lg:col-span-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200 mb-3">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Overlays & Lower Thirds</span>
            </div>
            <p className="text-xs text-neutral-400 mb-4">
              Toggle prominent brand markings and location badges on the video frame.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {
                  key: 'showSlogan' as const,
                  label: 'Slogan: "Together for Better Living"',
                  desc: 'Signature brand promise',
                },
                {
                  key: 'showLocationBadge' as const,
                  label: 'Location: উপশহর, নিউমার্কেট, রাজশাহী',
                  desc: 'Rajshahi branch location marker',
                },
                {
                  key: 'showSubtitles' as const,
                  label: 'Closed Captions / Subtitles',
                  desc: 'Synced scene voiceover transcription',
                },
                {
                  key: 'cinemaBars' as const,
                  label: '2.39:1 Cinema Letterbox',
                  desc: 'Classic theatrical widescreen bars',
                },
                {
                  key: 'filmGrain' as const,
                  label: 'Cinematic 35mm Film Grain',
                  desc: 'Texture & organic realism',
                },
                {
                  key: 'lensFlare' as const,
                  label: 'Anamorphic Warm Light Streaks',
                  desc: 'Horizontal warm golden lighting shimmer',
                },
              ].map(toggle => (
                <label
                  key={toggle.key}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg bg-neutral-950/40 hover:bg-neutral-950/70 transition-colors cursor-pointer select-none"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-neutral-200">
                      {toggle.label}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {toggle.desc}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings[toggle.key]}
                    onChange={e =>
                      onUpdateSettings(s => ({
                        ...s,
                        [toggle.key]: e.target.checked,
                      }))
                    }
                    className="mt-0.5 w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
