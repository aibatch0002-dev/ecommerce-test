import React, { useState } from 'react';
import { X, Download, Film, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { VideoSettings } from '../types.ts';
import { exportCommercialVideo, ExportProgress } from '../services/videoExporter.ts';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VideoSettings;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState<{ url: string; fileName: string } | null>(null);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsExporting(true);
    setDownloadInfo(null);
    try {
      const result = await exportCommercialVideo(settings, currentProgress => {
        setProgress(currentProgress);
      });
      setDownloadInfo({ url: result.url, fileName: result.fileName });
      setIsExporting(false);
    } catch {
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    if (!downloadInfo) return;
    const a = document.createElement('a');
    a.href = downloadInfo.url;
    a.download = downloadInfo.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isExporting}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-40 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-100">Export Commercial Video</h3>
            <p className="text-xs text-neutral-400">
              UNITY SUPER SHOP · {settings.duration}s Cut · {settings.aspectRatio}
            </p>
          </div>
        </div>

        {/* Video Specs Summary */}
        <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-4 mb-6 space-y-2 text-xs">
          <div className="flex justify-between text-neutral-300">
            <span className="text-neutral-500">Output Resolution:</span>
            <span className="font-mono text-amber-400 font-semibold">
              {settings.aspectRatio === '16:9'
                ? '1920 × 1080 (Full HD 1080p)'
                : settings.aspectRatio === '9:16'
                ? '1080 × 1920 (Vertical Reels)'
                : '1080 × 1080 (Square Feed)'}
            </span>
          </div>
          <div className="flex justify-between text-neutral-300">
            <span className="text-neutral-500">Frame Rate & Bitrate:</span>
            <span className="font-mono">30 FPS · 6.0 Mbps Master</span>
          </div>
          <div className="flex justify-between text-neutral-300">
            <span className="text-neutral-500">Audio Track:</span>
            <span>Web Audio Orchestral Synthesizer + Voiceover ({settings.voiceoverLang.toUpperCase()})</span>
          </div>
          <div className="flex justify-between text-neutral-300">
            <span className="text-neutral-500">Commercial Duration:</span>
            <span className="font-mono">{settings.duration} Seconds (5 Scenes)</span>
          </div>
        </div>

        {/* Export Progress or Status */}
        {progress && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-300 font-medium">
                {progress.status === 'preparing' && 'Preparing scene assets...'}
                {progress.status === 'recording' && `Rendering Frame: ${progress.currentSecond}s / ${progress.totalSeconds}s`}
                {progress.status === 'encoding' && 'Encoding high-bitrate video container...'}
                {progress.status === 'completed' && 'Commercial video rendered successfully!'}
                {progress.status === 'error' && 'Export encountered an issue'}
              </span>
              <span className="font-mono font-bold text-amber-400">
                {progress.percentage}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-150"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>

            {progress.status === 'error' && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/40 border border-red-800 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{progress.errorMessage || 'Unable to record video stream'}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {!downloadInfo ? (
            <button
              onClick={handleStartExport}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-98"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Rendering Commercial...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start Video Render</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 transition-all cursor-pointer shadow-lg shadow-emerald-400/20 active:scale-98 animate-pulse"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Download Video File ({downloadInfo.fileName})</span>
            </button>
          )}

          <button
            onClick={onClose}
            disabled={isExporting}
            className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-semibold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
