/**
 * Real Video Exporter Service
 * Uses HTML5 Canvas + MediaRecorder API to record the full commercial with audio into a downloadable video file.
 */

import { COMMERCIAL_SCENES } from '../data/scenes.ts';
import { VideoSettings } from '../types.ts';
import { commercialAudio } from './audioEngine.ts';

export interface ExportProgress {
  percentage: number;
  currentSecond: number;
  totalSeconds: number;
  status: 'preparing' | 'recording' | 'encoding' | 'completed' | 'error';
  downloadUrl?: string;
  errorMessage?: string;
}

export async function exportCommercialVideo(
  settings: VideoSettings,
  onProgress: (p: ExportProgress) => void
): Promise<{ blob: Blob; url: string; fileName: string }> {
  return new Promise((resolve, reject) => {
    try {
      const totalDuration = settings.duration;
      const sceneDuration = totalDuration / COMMERCIAL_SCENES.length;

      // Determine dimensions based on aspect ratio
      let width = 1920;
      let height = 1080;
      if (settings.aspectRatio === '9:16') {
        width = 1080;
        height = 1920;
      } else if (settings.aspectRatio === '1:1') {
        width = 1080;
        height = 1080;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const rawCtx = canvas.getContext('2d', { alpha: false });
      if (!rawCtx) throw new Error('Could not create 2D canvas context');
      const ctx: CanvasRenderingContext2D = rawCtx;

      onProgress({
        percentage: 5,
        currentSecond: 0,
        totalSeconds: totalDuration,
        status: 'preparing',
      });

      // Preload all scene images into Image objects
      const loadedImages: HTMLImageElement[] = [];
      let loadedCount = 0;

      COMMERCIAL_SCENES.forEach((scene, idx) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          loadedCount++;
          if (loadedCount === COMMERCIAL_SCENES.length) {
            startRecording();
          }
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === COMMERCIAL_SCENES.length) {
            startRecording();
          }
        };
        img.src = scene.imageSrc;
        loadedImages[idx] = img;
      });

      function startRecording() {
        try {
          // Setup canvas stream
          const canvasStream = canvas.captureStream(30);

          // Setup audio stream
          const audioDestination = commercialAudio.getStreamDestination();
          const combinedStream = new MediaStream();

          canvasStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
          if (audioDestination && !settings.isMuted) {
            audioDestination.stream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
          }

          // Choose supported mimeType
          let mimeType = 'video/webm;codecs=vp9,opus';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm;codecs=vp8,opus';
          }
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm';
          }

          const recorder = new MediaRecorder(combinedStream, {
            mimeType,
            videoBitsPerSecond: 6_000_000,
          });

          const chunks: Blob[] = [];
          recorder.ondataavailable = e => {
            if (e.data && e.data.size > 0) chunks.push(e.data);
          };

          recorder.onstop = () => {
            onProgress({
              percentage: 98,
              currentSecond: totalDuration,
              totalSeconds: totalDuration,
              status: 'encoding',
            });

            const blob = new Blob(chunks, { type: mimeType });
            const url = URL.createObjectURL(blob);
            const fileName = `unity-super-shop-commercial-${settings.duration}s-${settings.aspectRatio.replace(':', 'x')}.webm`;

            onProgress({
              percentage: 100,
              currentSecond: totalDuration,
              totalSeconds: totalDuration,
              status: 'completed',
              downloadUrl: url,
            });

            resolve({ blob, url, fileName });
          };

          // Start audio and recorder
          commercialAudio.startCommercialTheme(totalDuration, settings.musicTrack, settings.customAudioUrl);
          recorder.start(100);

          const startTime = performance.now();
          const fps = 30;
          const frameInterval = 1000 / fps;
          let currentElapsedSec = 0;

          const renderInterval = setInterval(() => {
            currentElapsedSec = (performance.now() - startTime) / 1000;
            const progressRatio = Math.min(currentElapsedSec / totalDuration, 1);

            onProgress({
              percentage: Math.round(progressRatio * 90),
              currentSecond: Math.min(Math.round(currentElapsedSec * 10) / 10, totalDuration),
              totalSeconds: totalDuration,
              status: 'recording',
            });

            if (currentElapsedSec >= totalDuration) {
              clearInterval(renderInterval);
              setTimeout(() => {
                recorder.stop();
              }, 200);
              return;
            }

            // Draw current commercial frame onto canvas
            drawCommercialFrame(ctx, width, height, currentElapsedSec, sceneDuration, loadedImages, settings);
          }, frameInterval);

        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          onProgress({
            percentage: 0,
            currentSecond: 0,
            totalSeconds: totalDuration,
            status: 'error',
            errorMessage: msg,
          });
          reject(err);
        }
      }

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      onProgress({
        percentage: 0,
        currentSecond: 0,
        totalSeconds: settings.duration,
        status: 'error',
        errorMessage: msg,
      });
      reject(err);
    }
  });
}

function drawCommercialFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsedSec: number,
  sceneDuration: number,
  images: HTMLImageElement[],
  settings: VideoSettings
) {
  // Clear canvas
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, width, height);

  const sceneIndex = Math.min(Math.floor(elapsedSec / sceneDuration), COMMERCIAL_SCENES.length - 1);
  const sceneProgress = (elapsedSec % sceneDuration) / sceneDuration;
  const currentScene = COMMERCIAL_SCENES[sceneIndex];
  const currentImg = images[sceneIndex];

  // Camera movement interpolation
  const { startScale, endScale, startX, endX, startY, endY } = currentScene.cameraMovement;
  const currentScale = startScale + (endScale - startScale) * sceneProgress;
  const currentShiftX = (startX + (endX - startX) * sceneProgress) * (width * 0.01);
  const currentShiftY = (startY + (endY - startY) * sceneProgress) * (height * 0.01);

  // Crossfade transition between scenes (0.4s dissolve)
  const crossfadeDuration = 0.4;
  const timeIntoScene = elapsedSec % sceneDuration;
  let opacity = 1.0;
  if (timeIntoScene < crossfadeDuration && sceneIndex > 0) {
    // Fade in
    opacity = timeIntoScene / crossfadeDuration;
    // Draw previous image underneath
    const prevImg = images[sceneIndex - 1];
    if (prevImg && prevImg.complete) {
      drawImageCover(ctx, prevImg, width, height, 1.0, 0, 0);
    }
  }

  // Draw current scene image with zoom & pan
  ctx.save();
  ctx.globalAlpha = opacity;
  if (currentImg && currentImg.complete) {
    drawImageCover(ctx, currentImg, width, height, currentScale, currentShiftX, currentShiftY);
  }
  ctx.restore();

  // Color grade adjustment
  applyColorGrade(ctx, width, height, settings.colorGrade);

  // Cinematic warm vignette & dark contrast scrim for text
  drawVignetteAndScrim(ctx, width, height);

  // Overlays: Glowing UNITY SUPER SHOP Sign & Slogan
  drawBrandOverlays(ctx, width, height, elapsedSec, settings, currentScene);

  // Anamorphic Cinema Bars if enabled
  if (settings.cinemaBars && settings.aspectRatio === '16:9') {
    const barHeight = height * 0.09;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, barHeight);
    ctx.fillRect(0, height - barHeight, width, barHeight);
  }
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasW: number,
  canvasH: number,
  scale: number,
  shiftX: number,
  shiftY: number
) {
  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;
  if (!imgW || !imgH) return;

  const canvasRatio = canvasW / canvasH;
  const imgRatio = imgW / imgH;

  let renderW = canvasW;
  let renderH = canvasH;
  if (imgRatio > canvasRatio) {
    renderW = canvasH * imgRatio;
  } else {
    renderH = canvasW / imgRatio;
  }

  renderW *= scale;
  renderH *= scale;

  const x = (canvasW - renderW) / 2 + shiftX;
  const y = (canvasH - renderH) / 2 + shiftY;

  ctx.drawImage(img, x, y, renderW, renderH);
}

function applyColorGrade(ctx: CanvasRenderingContext2D, width: number, height: number, grade: string) {
  if (grade === 'golden') {
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
    grad.addColorStop(1, 'rgba(217, 119, 6, 0.15)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  } else if (grade === 'vibrant') {
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(255, 215, 0, 0.08)';
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  } else if (grade === 'dusk') {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, 'rgba(24, 24, 45, 0.1)');
    grad.addColorStop(1, 'rgba(15, 10, 30, 0.25)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}

function drawVignetteAndScrim(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Vignette
  const radius = Math.max(width, height) * 0.75;
  const vignette = ctx.createRadialGradient(width / 2, height / 2, radius * 0.3, width / 2, height / 2, radius);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  // Bottom gradient scrim for high contrast legibility
  const bottomScrim = ctx.createLinearGradient(0, height * 0.6, 0, height);
  bottomScrim.addColorStop(0, 'rgba(0, 0, 0, 0)');
  bottomScrim.addColorStop(0.7, 'rgba(0, 0, 0, 0.75)');
  bottomScrim.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
  ctx.fillStyle = bottomScrim;
  ctx.fillRect(0, height * 0.6, width, height * 0.4);

  // Top gentle gradient scrim for header branding
  const topScrim = ctx.createLinearGradient(0, 0, 0, height * 0.25);
  topScrim.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  topScrim.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = topScrim;
  ctx.fillRect(0, 0, width, height * 0.25);
}

function drawBrandOverlays(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  _elapsedSec: number,
  settings: VideoSettings,
  currentScene: typeof COMMERCIAL_SCENES[0]
) {
  ctx.save();

  const isVertical = height > width;
  const baseScale = isVertical ? 0.8 : 1.0;

  // 1. Top Header: UNITY SUPER SHOP Glowing Sign
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const brandTopY = isVertical ? height * 0.08 : height * 0.06;

  // Sign Glow
  ctx.shadowColor = '#F59E0B';
  ctx.shadowBlur = 18;
  ctx.font = `800 ${Math.round(42 * baseScale)}px "Cinzel", "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('UNITY SUPER SHOP', width / 2, brandTopY);

  // Gold metallic text accent
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#FCD34D';
  ctx.fillText('UNITY SUPER SHOP', width / 2, brandTopY);

  // Slogan: "Together for Better Living"
  if (settings.showSlogan) {
    ctx.font = `600 ${Math.round(18 * baseScale)}px "Plus Jakarta Sans", sans-serif`;
    ctx.letterSpacing = '3px';
    ctx.fillStyle = '#E2E8F0';
    ctx.fillText('TOGETHER FOR BETTER LIVING', width / 2, brandTopY + 48 * baseScale);
  }

  // 2. Bottom Location Badge: "উপশহর, নিউমার্কেট, রাজশাহী"
  if (settings.showLocationBadge) {
    const badgeY = isVertical ? height * 0.86 : height * 0.88;
    const badgeText = 'উপশহর, নিউমার্কেট, রাজশাহী';

    ctx.font = `600 ${Math.round(22 * baseScale)}px "Hind Siliguri", "Plus Jakarta Sans", sans-serif`;
    const textWidth = ctx.measureText(badgeText).width;
    const boxW = textWidth + 80 * baseScale;
    const boxH = 46 * baseScale;
    const boxX = (width - boxW) / 2;

    // Badge container
    ctx.fillStyle = 'rgba(17, 24, 39, 0.88)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(boxX, badgeY, boxW, boxH, 24);
    ctx.fill();
    ctx.stroke();

    // Map pin icon circle
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(boxX + 26 * baseScale, badgeY + boxH / 2, 7 * baseScale, 0, Math.PI * 2);
    ctx.fill();

    // Text inside badge
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#F8FAFC';
    ctx.fillText(badgeText, boxX + 44 * baseScale, badgeY + boxH / 2);
  }

  // 3. Subtitles / Scene Narration in center bottom
  if (settings.showSubtitles) {
    const subY = isVertical ? height * 0.77 : height * 0.80;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const subText = settings.voiceoverLang === 'bn' ? currentScene.narrationBn : currentScene.narrationEn;
    ctx.font = `500 ${Math.round(20 * baseScale)}px "Hind Siliguri", "Plus Jakarta Sans", sans-serif`;

    // Drop shadow for legibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#FDE68A';
    ctx.fillText(subText, width / 2, subY);
  }

  ctx.restore();
}
