import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  MapPin,
  Sparkles,
  Tv,
  Smartphone,
  Square,
  Layers,
  ShoppingBag,
  Music,
  Upload,
} from 'lucide-react';
import { COMMERCIAL_SCENES } from '../data/scenes.ts';
import { VideoSettings, MusicTrackId } from '../types.ts';
import { commercialAudio } from '../services/audioEngine.ts';

interface CinematicPlayerProps {
  settings: VideoSettings;
  onUpdateSettings: (updater: (prev: VideoSettings) => VideoSettings) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentSecond: number;
  onSeek: (second: number) => void;
  onOpenExport: () => void;
}

export const CinematicPlayer: React.FC<CinematicPlayerProps> = ({
  settings,
  onUpdateSettings,
  isPlaying,
  onTogglePlay,
  currentSecond,
  onSeek,
  onOpenExport,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHoveringControls, setIsHoveringControls] = useState(true);
  const lastSpokenSceneRef = useRef<number>(-1);
  const hoverTimeoutRef = useRef<number | null>(null);

  const totalDuration = settings.duration;
  const sceneDuration = totalDuration / COMMERCIAL_SCENES.length;
  const currentSceneIndex = Math.min(
    Math.floor(currentSecond / sceneDuration),
    COMMERCIAL_SCENES.length - 1
  );
  const currentScene = COMMERCIAL_SCENES[currentSceneIndex];
  const sceneProgress = (currentSecond % sceneDuration) / sceneDuration;

  // Handle voiceover triggering when scene changes and playing
  useEffect(() => {
    if (isPlaying && settings.voiceoverLang !== 'none') {
      if (lastSpokenSceneRef.current !== currentSceneIndex) {
        lastSpokenSceneRef.current = currentSceneIndex;
        const textToSpeak =
          settings.voiceoverLang === 'bn'
            ? currentScene.narrationBn
            : currentScene.narrationEn;
        commercialAudio.speakNarration(textToSpeak, settings.voiceoverLang);
      }
    } else {
      lastSpokenSceneRef.current = -1;
      commercialAudio.stopSpeech();
    }
  }, [currentSceneIndex, isPlaying, settings.voiceoverLang, currentScene]);

  // Handle music play/pause
  useEffect(() => {
    if (isPlaying) {
      commercialAudio.resumeContext();
      commercialAudio.startCommercialTheme(
        totalDuration,
        settings.musicTrack,
        settings.customAudioUrl
      );
    } else {
      commercialAudio.stopCommercialTheme();
      commercialAudio.stopSpeech();
    }
  }, [isPlaying, totalDuration, settings.musicTrack, settings.customAudioUrl]);

  // Handle volume & mute
  useEffect(() => {
    commercialAudio.setVolume(settings.audioVolume, settings.isMuted);
  }, [settings.audioVolume, settings.isMuted]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const handleMouseMove = () => {
    setIsHoveringControls(true);
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) setIsHoveringControls(false);
    }, 2800);
  };

  // Keyboard shortcuts (Space = play/pause, F = fullscreen, M = mute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        onTogglePlay();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        onUpdateSettings(prev => ({ ...prev, isMuted: !prev.isMuted }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTogglePlay, toggleFullscreen, onUpdateSettings]);

  // Compute camera transforms for the active scene
  const { startScale, endScale, startX, endX, startY, endY } = currentScene.cameraMovement;
  const currentScale = startScale + (endScale - startScale) * sceneProgress;
  const currentTranslateX = startX + (endX - startX) * sceneProgress;
  const currentTranslateY = startY + (endY - startY) * sceneProgress;

  // Aspect ratio container styles
  const getAspectClass = () => {
    if (settings.aspectRatio === '9:16') return 'aspect-[9/16] max-w-[420px]';
    if (settings.aspectRatio === '1:1') return 'aspect-square max-w-[680px]';
    return 'aspect-video w-full max-w-[1080px]';
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <section id="player" className="w-full flex flex-col items-center py-6 px-4 md:px-8">
      {/* Aspect Ratio & Format Controls Header */}
      <div className="w-full max-w-[1080px] flex flex-wrap items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-400">Aspect Ratio:</span>
          <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-lg">
            <button
              onClick={() => onUpdateSettings(s => ({ ...s, aspectRatio: '16:9' }))}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                settings.aspectRatio === '16:9'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>16:9 Cinema</span>
            </button>
            <button
              onClick={() => onUpdateSettings(s => ({ ...s, aspectRatio: '9:16' }))}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                settings.aspectRatio === '9:16'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>9:16 Story/Reels</span>
            </button>
            <button
              onClick={() => onUpdateSettings(s => ({ ...s, aspectRatio: '1:1' }))}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                settings.aspectRatio === '1:1'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              <span>1:1 Square</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-neutral-400">Cut Duration:</span>
          <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-lg">
            {([10, 12, 15] as const).map(d => (
              <button
                key={d}
                onClick={() => onUpdateSettings(s => ({ ...s, duration: d }))}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  settings.duration === d
                    ? 'bg-amber-500 text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {d}s
              </button>
            ))}
          </div>

          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Download MP4/WebM</span>
          </button>
        </div>
      </div>

      {/* Commercial Background Music Track Selector */}
      <div className="w-full max-w-[1080px] flex flex-wrap items-center justify-between gap-3 mb-4 p-2.5 rounded-xl bg-neutral-900/70 border border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <Music className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-neutral-200">Commercial Music:</span>

          {/* Equalizer animation when playing */}
          {isPlaying && (
            <div className="flex items-end gap-0.5 h-3.5 px-1">
              <span className="w-0.5 h-3 bg-amber-400 animate-pulse" />
              <span className="w-0.5 h-2 bg-amber-400 animate-bounce" />
              <span className="w-0.5 h-3.5 bg-amber-400 animate-pulse" />
              <span className="w-0.5 h-1.5 bg-amber-400 animate-bounce" />
            </div>
          )}
        </div>

        {/* Music Track Options */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'festive', label: 'Festive Bangla Anthem', icon: '🇧🇩' },
            { id: 'acoustic', label: 'Retail Acoustic Strum', icon: '🎸' },
            { id: 'orchestral', label: 'Grand Orchestral', icon: '🎻' },
            { id: 'pop', label: 'Modern Pop Jingle', icon: '🎹' },
          ].map(track => (
            <button
              key={track.id}
              onClick={() => {
                commercialAudio.resumeContext();
                onUpdateSettings(s => ({ ...s, musicTrack: track.id as MusicTrackId }));
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                settings.musicTrack === track.id
                  ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                  : 'bg-neutral-950/60 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
              }`}
            >
              <span>{track.icon}</span>
              <span>{track.label}</span>
            </button>
          ))}

          {/* Custom Upload Music */}
          <label className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-neutral-950/60 text-amber-300 border border-amber-500/40 hover:bg-amber-500/10 transition-colors cursor-pointer">
            <Upload className="w-3 h-3" />
            <span>{settings.customAudioName || 'Upload Custom Audio'}</span>
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

      {/* Main Cinematic Video Screen */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setIsHoveringControls(false)}
        className={`relative overflow-hidden rounded-2xl bg-neutral-950 shadow-2xl border border-neutral-800/80 group select-none ${getAspectClass()}`}
      >
        {/* Render Layer: Active Scene Image with Ken Burns Pan/Zoom */}
        <div className="absolute inset-0 overflow-hidden bg-neutral-950">
          {COMMERCIAL_SCENES.map((scene, idx) => {
            const isActive = idx === currentSceneIndex;
            return (
              <div
                key={scene.id}
                className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <img
                  src={scene.imageSrc}
                  alt={scene.titleEn}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover origin-center transition-transform ease-out will-change-transform"
                  style={{
                    transform: isActive
                      ? `scale(${currentScale}) translate(${currentTranslateX}%, ${currentTranslateY}%)`
                      : 'scale(1)',
                    transitionDuration: isPlaying ? '100ms' : '300ms',
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Color Grading Filter Overlays */}
        {settings.colorGrade === 'golden' && (
          <div className="absolute inset-0 z-20 pointer-events-none mix-blend-soft-light bg-gradient-to-tr from-amber-600/30 via-amber-500/20 to-orange-400/25" />
        )}
        {settings.colorGrade === 'vibrant' && (
          <div className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay bg-amber-400/15" />
        )}
        {settings.colorGrade === 'dusk' && (
          <div className="absolute inset-0 z-20 pointer-events-none mix-blend-multiply bg-gradient-to-b from-indigo-950/20 to-neutral-950/40" />
        )}

        {/* Cinematic Film Grain */}
        {settings.filmGrain && (
          <div className="absolute inset-0 z-20 pointer-events-none film-grain opacity-60" />
        )}

        {/* Ambient Anamorphic Golden Lens Flare */}
        {settings.lensFlare && (
          <div className="absolute -top-1/4 -left-1/4 w-[150%] h-1/2 pointer-events-none z-20 bg-gradient-to-r from-transparent via-amber-400/15 to-transparent blur-3xl animate-anamorphic rotate-[-8deg]" />
        )}

        {/* Dark Scrim Gradients for Visual Legibility */}
        <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-black/85 via-black/25 to-black/60" />

        {/* Cinematic 2.39:1 Letterbox Bars */}
        {settings.cinemaBars && settings.aspectRatio === '16:9' && (
          <>
            <div className="absolute top-0 left-0 right-0 h-[8%] bg-black z-30 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-[8%] bg-black z-30 pointer-events-none" />
          </>
        )}

        {/* TOP BRAND OVERLAY: Glowing Sign "UNITY SUPER SHOP" & Slogan */}
        <div className="absolute top-6 md:top-8 left-0 right-0 z-30 flex flex-col items-center text-center px-4 pointer-events-none">
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-[10px] md:text-xs tracking-[0.25em] font-bold text-amber-300 uppercase">
              Rajshahi Premier Supermarket
            </span>
          </div>

          <h1 className="font-cinzel text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-100 to-amber-400 drop-shadow-[0_4px_16px_rgba(245,158,11,0.55)]">
            UNITY SUPER SHOP
          </h1>

          {settings.showSlogan && (
            <p className="mt-1 md:mt-2 text-xs md:text-sm lg:text-base font-semibold tracking-[0.2em] uppercase text-neutral-200 drop-shadow-md">
              Together for Better Living
            </p>
          )}
        </div>

        {/* CENTER SCENE BADGE (Briefly visible or floating) */}
        <div className="absolute top-1/2 left-6 z-30 pointer-events-none hidden md:flex flex-col gap-1 text-left">
          <span className="text-[10px] tracking-wider uppercase font-mono text-amber-400/90 font-semibold">
            Scene 0{currentScene.number} / 05
          </span>
          <span className="text-xs font-semibold text-white/90 drop-shadow">
            {currentScene.titleEn}
          </span>
          <span className="text-[10px] text-amber-300 font-bengali">
            {currentScene.titleBn}
          </span>
        </div>

        {/* BOTTOM OVERLAYS: Location Badge & Subtitles */}
        <div className="absolute bottom-20 md:bottom-24 left-0 right-0 z-30 flex flex-col items-center text-center px-4 pointer-events-none">
          {/* Subtitles / Closed Captions */}
          {settings.showSubtitles && (
            <div className="max-w-xl mx-auto mb-3 px-4 py-1.5 rounded-lg bg-neutral-950/80 backdrop-blur-md border border-neutral-800 text-amber-200 text-xs md:text-sm font-bengali font-medium shadow-lg animate-fadeIn">
              {settings.voiceoverLang === 'bn' ? currentScene.narrationBn : currentScene.narrationEn}
            </div>
          )}

          {/* Location Badge: "উপশহর, নিউমার্কেট, রাজশাহী" */}
          {settings.showLocationBadge && (
            <div className="inline-flex items-center gap-2.5 px-4 md:px-5 py-2 rounded-full bg-neutral-900/90 backdrop-blur-md border border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.25)] text-neutral-100">
              <div className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 shadow">
                <MapPin className="w-3 h-3 fill-current" />
              </div>
              <span className="font-bengali text-xs md:text-sm lg:text-base font-semibold tracking-wide text-white">
                উপশহর, নিউমার্কেট, রাজশাহী
              </span>
              <span className="hidden sm:inline-block text-[11px] text-amber-400/80 font-medium pl-1 border-l border-neutral-700">
                Uposhohor, New Market, Rajshahi
              </span>
            </div>
          )}
        </div>

        {/* CLICK TO TOGGLE PLAY OVERLAY */}
        <div
          onClick={onTogglePlay}
          className="absolute inset-0 z-20 cursor-pointer flex items-center justify-center"
        >
          {!isPlaying && (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-amber-500/90 text-neutral-950 flex items-center justify-center shadow-2xl shadow-amber-500/40 hover:scale-110 active:scale-95 transition-all duration-200 backdrop-blur-sm">
              <Play className="w-8 h-8 md:w-10 md:h-10 fill-current translate-x-0.5" />
            </div>
          )}
        </div>

        {/* CINEMATIC TIMELINE & PLAYER CONTROLS (Fades on inactivity during play) */}
        <div
          className={`absolute bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-black via-black/80 to-transparent transition-opacity duration-300 ${
            isHoveringControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Segmented Timeline Scrubber */}
          <div className="relative w-full mb-3 flex items-center group/scrubber cursor-pointer">
            {/* 5 Segment Markers */}
            <div className="w-full h-2 bg-neutral-800/80 rounded-full overflow-hidden flex relative">
              {COMMERCIAL_SCENES.map((s, idx) => (
                <div
                  key={s.id}
                  className="flex-1 h-full border-r border-neutral-900/60 last:border-r-0 relative"
                  onClick={e => {
                    e.stopPropagation();
                    const segStart = idx * sceneDuration;
                    onSeek(segStart);
                  }}
                  title={`Jump to Scene ${idx + 1}: ${s.titleEn}`}
                />
              ))}

              {/* Played Progress Bar */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-75"
                style={{ width: `${(currentSecond / totalDuration) * 100}%` }}
              />
            </div>

            {/* Hidden Input Range for smooth scrubbing */}
            <input
              type="range"
              min="0"
              max={totalDuration}
              step="0.05"
              value={currentSecond}
              onChange={e => onSeek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-3 text-neutral-200 text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={onTogglePlay}
                className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-100 flex items-center justify-center transition-colors cursor-pointer"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
              </button>

              <button
                onClick={() => onSeek(0)}
                className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Restart Commercial"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <div className="font-mono tabular-nums text-xs text-neutral-300">
                <span className="text-amber-400 font-semibold">{formatTime(currentSecond)}</span>
                <span className="text-neutral-500 mx-1">/</span>
                <span>{formatTime(totalDuration)}</span>
              </div>
            </div>

            {/* Scene Breadcrumb / Pill */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400">
              <span className="text-amber-400 font-bold">Scene {currentScene.number}:</span>
              <span className="text-neutral-200 truncate max-w-[200px]">{currentScene.titleEn}</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Volume & Mute */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onUpdateSettings(s => ({ ...s, isMuted: !s.isMuted }))}
                  className="p-1.5 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  title="Toggle Mute (M)"
                >
                  {settings.isMuted || settings.audioVolume === 0 ? (
                    <VolumeX className="w-4 h-4 text-neutral-500" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-amber-400" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.isMuted ? 0 : settings.audioVolume}
                  onChange={e =>
                    onUpdateSettings(s => ({
                      ...s,
                      audioVolume: parseFloat(e.target.value),
                      isMuted: false,
                    }))
                  }
                  className="w-16 h-1 accent-amber-500 bg-neutral-800 rounded cursor-pointer"
                />
              </div>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="Toggle Fullscreen (F)"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Scene Jump Bar */}
      <div className="w-full max-w-[1080px] grid grid-cols-5 gap-2 mt-4">
        {COMMERCIAL_SCENES.map((scene, idx) => {
          const isActive = idx === currentSceneIndex;
          return (
            <button
              key={scene.id}
              onClick={() => onSeek(idx * sceneDuration)}
              className={`flex flex-col text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className={isActive ? 'text-amber-400 font-bold' : 'text-neutral-500'}>
                  0{scene.number}
                </span>
                <span className="text-[10px] text-neutral-500">
                  {Math.round(idx * sceneDuration)}s
                </span>
              </div>
              <span className="text-xs font-semibold truncate leading-snug">
                {scene.titleEn}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
