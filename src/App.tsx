/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TopNav } from './components/TopNav.tsx';
import { CinematicPlayer } from './components/CinematicPlayer.tsx';
import { SceneStoryboard } from './components/SceneStoryboard.tsx';
import { DirectorControls } from './components/DirectorControls.tsx';
import { StoreOverview } from './components/StoreOverview.tsx';
import { ExportModal } from './components/ExportModal.tsx';
import { VideoSettings } from './types.ts';
import { COMMERCIAL_SCENES } from './data/scenes.ts';

export default function App() {
  const [settings, setSettings] = useState<VideoSettings>({
    duration: 15,
    aspectRatio: '16:9',
    voiceoverLang: 'bn',
    musicTrack: 'festive',
    colorGrade: 'golden',
    cinemaBars: false,
    filmGrain: true,
    lensFlare: true,
    showLocationBadge: true,
    showSlogan: true,
    showSubtitles: true,
    audioVolume: 0.85,
    isMuted: false,
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSecond, setCurrentSecond] = useState(0);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const lastTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Playback loop using requestAnimationFrame
  const updatePlayback = useCallback((time: number) => {
    if (lastTimeRef.current !== null) {
      const delta = (time - lastTimeRef.current) / 1000;
      setCurrentSecond(prev => {
        const next = prev + delta;
        if (next >= settings.duration) {
          return 0; // Loop seamlessly
        }
        return next;
      });
    }
    lastTimeRef.current = time;
    animFrameRef.current = requestAnimationFrame(updatePlayback);
  }, [settings.duration]);

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = null;
      animFrameRef.current = requestAnimationFrame(updatePlayback);
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      lastTimeRef.current = null;
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, updatePlayback]);

  // Handle seeking
  const handleSeek = (newSec: number) => {
    setCurrentSecond(Math.max(0, Math.min(newSec, settings.duration)));
  };

  const handleTogglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const sceneDuration = settings.duration / COMMERCIAL_SCENES.length;
  const currentSceneIndex = Math.min(
    Math.floor(currentSecond / sceneDuration),
    COMMERCIAL_SCENES.length - 1
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-neutral-950">
      {/* Top Navigation conforming to Top Bar Contract */}
      <TopNav
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onOpenExport={() => setIsExportOpen(true)}
      />

      <main className="flex-1 flex flex-col items-center">
        {/* Editorial Subheader */}
        <section className="w-full max-w-[1080px] mx-auto pt-8 pb-3 px-4 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-neutral-400 mb-2 font-medium">
            <span>Rajshahi, Bangladesh</span>
            <span aria-hidden="true">·</span>
            <span>Commercial Broadcast Cut</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400 font-semibold">{settings.duration}s Cinematic</span>
          </div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-neutral-100 tracking-tight text-balance">
            Cinematic Promotional Showcase
          </h2>
          <p className="mt-2 text-sm md:text-base text-neutral-400 max-w-2xl mx-auto font-bengali">
            "UNITY SUPER SHOP" — টুগেদার ফর বেটার লিভিং · উপশহর, নিউমার্কেট, রাজশাহী
          </p>
        </section>

        {/* 1. Cinematic Video Player */}
        <CinematicPlayer
          settings={settings}
          onUpdateSettings={setSettings}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          currentSecond={currentSecond}
          onSeek={handleSeek}
          onOpenExport={() => setIsExportOpen(true)}
        />

        {/* 2. Scene Storyboard Breakdown */}
        <SceneStoryboard
          currentSceneIndex={currentSceneIndex}
          onSelectScene={idx => handleSeek(idx * sceneDuration)}
          totalDuration={settings.duration}
        />

        {/* 3. Director Controls Suite */}
        <DirectorControls
          settings={settings}
          onUpdateSettings={setSettings}
          onOpenExport={() => setIsExportOpen(true)}
        />

        {/* 4. Supermarket Store Profile */}
        <StoreOverview />
      </main>

      {/* Export Modal for MP4/WebM Generation */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        settings={settings}
      />

      {/* Quiet Footer */}
      <footer className="border-t border-neutral-800/80 py-8 px-6 bg-neutral-950 text-neutral-500 text-xs">
        <div className="max-w-[1080px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-cinzel font-bold text-neutral-300">UNITY SUPER SHOP</span>
            <span>—</span>
            <span>Together for Better Living</span>
          </div>
          <div className="flex items-center gap-3 text-neutral-400">
            <span>উপশহর, নিউমার্কেট, রাজশাহী</span>
            <span>·</span>
            <span>Commercial Ad Studio</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
