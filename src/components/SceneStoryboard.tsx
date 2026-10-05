import React from 'react';
import { Film, Camera, Clock, Play, MapPin } from 'lucide-react';
import { COMMERCIAL_SCENES } from '../data/scenes.ts';

interface SceneStoryboardProps {
  currentSceneIndex: number;
  onSelectScene: (sceneIndex: number) => void;
  totalDuration: number;
}

export const SceneStoryboard: React.FC<SceneStoryboardProps> = ({
  currentSceneIndex,
  onSelectScene,
  totalDuration,
}) => {
  const sceneDuration = totalDuration / COMMERCIAL_SCENES.length;

  return (
    <section id="storyboard" className="w-full max-w-[1080px] mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-neutral-800">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-neutral-100 flex items-center gap-2.5">
            <Film className="w-5 h-5 text-amber-400" />
            <span>Cinematic Commercial Storyboard</span>
          </h2>
          <p className="text-xs md:text-sm text-neutral-400 mt-1">
            5-Beat Narrative Structure: Exterior establishing shot to fresh produce, grocery aisles, and family checkout.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Total Cut: {totalDuration}s ({sceneDuration.toFixed(1)}s per scene)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COMMERCIAL_SCENES.map((scene, idx) => {
          const isActive = idx === currentSceneIndex;
          const startSec = idx * sceneDuration;
          const endSec = (idx + 1) * sceneDuration;

          return (
            <div
              key={scene.id}
              onClick={() => onSelectScene(idx)}
              className={`group flex flex-col justify-between rounded-xl overflow-hidden border transition-all cursor-pointer ${
                isActive
                  ? 'bg-neutral-900 border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/50'
                  : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
              }`}
            >
              <div>
                {/* Scene Image with Timecode & Badge */}
                <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
                  <img
                    src={scene.imageSrc}
                    alt={scene.titleEn}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Scene Number & Timing */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-[11px] font-mono text-amber-300 border border-neutral-700/60">
                    <span className="font-bold">Scene 0{scene.number}</span>
                    <span className="text-neutral-500">·</span>
                    <span>{startSec.toFixed(1)}s - {endSec.toFixed(1)}s</span>
                  </div>

                  {/* Active Play Indicator */}
                  {isActive && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-neutral-950 text-[10px] font-bold shadow-md">
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>ON AIR</span>
                    </div>
                  )}

                  {/* Camera motion note */}
                  <div className="absolute bottom-2 left-2.5 flex items-center gap-1.5 text-[11px] text-neutral-300 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded border border-neutral-800">
                    <Camera className="w-3 h-3 text-amber-400" />
                    <span>Zoom {scene.cameraMovement.startScale}x → {scene.cameraMovement.endScale}x</span>
                  </div>
                </div>

                {/* Scene Content */}
                <div className="p-4">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <h3 className="text-sm font-bold text-neutral-100 group-hover:text-amber-400 transition-colors">
                      {scene.titleEn}
                    </h3>
                  </div>
                  <h4 className="text-xs font-semibold text-amber-400/90 font-bengali mb-1.5">
                    {scene.titleBn}
                  </h4>
                  {idx > 0 && (
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span className="truncate">
                        {idx === 1 && 'Photo Match: Spectacles & Goatee + Henna Beard in Navy Blazer'}
                        {idx === 2 && 'Photo Match: Olive Bomber Jacket (Fruit) + Grey Puffer Jacket'}
                        {idx === 3 && 'Photo Match: Khaki Jacket Father + Child in Shopping Cart'}
                        {idx === 4 && 'Photo Match: All 5 Friends Reunited at Billing Desk'}
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2 mb-3">
                    {scene.descriptionEn}
                  </p>

                  {/* Spoken Narration Script Box */}
                  <div className="p-2.5 rounded-lg bg-neutral-950/70 border border-neutral-800/80 mb-3">
                    <div className="text-[10px] uppercase font-mono text-amber-500 font-semibold mb-1">
                      Voiceover Script
                    </div>
                    <p className="text-xs text-neutral-200 font-bengali leading-snug">
                      "{scene.narrationBn}"
                    </p>
                    <p className="text-[11px] text-neutral-400 italic mt-1 leading-snug">
                      "{scene.narrationEn}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Highlights rendered as clean unboxed text (anti-slop rule) */}
              <div className="px-4 pb-4 pt-1 flex items-center gap-2 text-[11px] text-neutral-500 border-t border-neutral-800/60 flex-wrap">
                {scene.highlights.map((item, hIdx) => (
                  <React.Fragment key={item}>
                    <span>{item}</span>
                    {hIdx < scene.highlights.length - 1 && <span aria-hidden="true">·</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
