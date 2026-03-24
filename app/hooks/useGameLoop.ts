'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { 
  FrameData, 
  PlayerFrame,
  BallFrame,
  JobResults,
  JobStatus,
  getFrameAtTimestamp,
  bboxToArray,
  api,
  pollUntilComplete,
} from '../lib/api';

// ============================================================
// TYPES
// ============================================================

interface Point { 
  x: number; 
  y: number; 
}

// Extended PlayerFrame with mask support for SAM2
interface PlayerFrameWithMask extends PlayerFrame {
  mask?: number[][]; // [[x,y], [x,y], ...] - Polygon from SAM2
  velocity?: { speed: number; direction?: number };
}

interface FrameDataWithMasks extends Omit<FrameData, 'players'> {
  players: PlayerFrameWithMask[];
}

// ============================================================
// useGameLoop - Main video sync hook with polygon rendering
// ============================================================

interface UseGameLoopOptions {
  showGhost: boolean;
  showStats: boolean;
  showBall?: boolean;
  team0Color?: string;
  team1Color?: string;
}

interface UseGameLoopReturn {
  currentFrameData: FrameDataWithMasks | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
}

/**
 * useGameLoop Hook
 * 
 * Synchronizes video playback with frame data from the analysis API.
 * Renders player masks (SAM2 polygons) and stats on canvas overlay.
 */
export function useGameLoop(
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  analysisData: JobResults | null,
  options: UseGameLoopOptions
): UseGameLoopReturn {
  const [currentFrameData, setCurrentFrameData] = useState<FrameDataWithMasks | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const animationRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number>(-1);

  // Default colors
  const team0Color = options.team0Color || '#FFFFFF';
  const team1Color = options.team1Color || '#CCFF00';

  // ============================================================
  // Draw Function - With Polygon Mask Support
  // ============================================================
  const drawFrame = useCallback((frameData: FrameDataWithMasks) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !frameData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get the video's displayed dimensions (CSS size)
    const displayWidth = video.clientWidth;
    const displayHeight = video.clientHeight;
    
    // Get the video's intrinsic (natural) dimensions
    const videoWidth = video.videoWidth || displayWidth;
    const videoHeight = video.videoHeight || displayHeight;

    // Sync canvas internal resolution to display size for crisp rendering
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      console.log(`[useGameLoop] Canvas resized to ${displayWidth}x${displayHeight}`);
    }

    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Scale factors: convert from video native coords to canvas display coords
    const scaleX = displayWidth / videoWidth;
    const scaleY = displayHeight / videoHeight;
    
    console.log(`[useGameLoop] Drawing frame ${frameData.frame_number} with ${frameData.players?.length || 0} players`);

    // Draw each player
    frameData.players.forEach((player: PlayerFrameWithMask) => {
      // Team Colors
      const isTeamZero = player.team_id === 0;
      const fillColor = isTeamZero 
        ? `${team0Color}26` // 15% opacity
        : `${team1Color}26`;
      const strokeColor = isTeamZero ? team0Color : team1Color;

      // --- A. POLYGON MASK (Ghost Mode / SAM2) ---
      if (options.showGhost && player.mask && player.mask.length > 0) {
        ctx.beginPath();
        
        // Move to first point (scaled)
        const startX = player.mask[0][0] * scaleX;
        const startY = player.mask[0][1] * scaleY;
        ctx.moveTo(startX, startY);
        
        // Draw lines to subsequent points
        for (let i = 1; i < player.mask.length; i++) {
          const px = player.mask[i][0] * scaleX;
          const py = player.mask[i][1] * scaleY;
          ctx.lineTo(px, py);
        }
        ctx.closePath();
        
        // Fill with semi-transparent team color
        ctx.fillStyle = fillColor;
        ctx.fill();
        
        // Stroke outline
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Add glow effect
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
      } 
      // --- B. BOUNDING BOX FALLBACK ---
      else if (options.showGhost && player.bbox) {
        const x = player.bbox.x * scaleX;
        const y = player.bbox.y * scaleY;
        const w = player.bbox.width * scaleX;
        const h = player.bbox.height * scaleY;
        
        // Fill
        ctx.fillStyle = fillColor;
        ctx.fillRect(x, y, w, h);
        
        // Stroke
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
        
        // Corner accents (tactical look)
        const cornerLen = Math.min(w, h) * 0.2;
        ctx.beginPath();
        // Top-left
        ctx.moveTo(x, y + cornerLen);
        ctx.lineTo(x, y);
        ctx.lineTo(x + cornerLen, y);
        // Top-right
        ctx.moveTo(x + w - cornerLen, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w, y + cornerLen);
        // Bottom-right
        ctx.moveTo(x + w, y + h - cornerLen);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x + w - cornerLen, y + h);
        // Bottom-left
        ctx.moveTo(x + cornerLen, y + h);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x, y + h - cornerLen);
        ctx.stroke();
      }

      // --- C. STATS LABEL ---
      if (options.showStats) {
        // Position label above the player
        let labelX: number, labelY: number;
        
        if (player.mask && player.mask.length > 0) {
          // Find top-center of mask
          const minY = Math.min(...player.mask.map(p => p[1]));
          const avgX = player.mask.reduce((sum, p) => sum + p[0], 0) / player.mask.length;
          labelX = avgX * scaleX;
          labelY = (minY - 15) * scaleY;
        } else if (player.bbox) {
          labelX = (player.bbox.x + player.bbox.width / 2) * scaleX;
          labelY = (player.bbox.y - 10) * scaleY;
        } else {
          return;
        }

        // Player ID label
        const label = player.jersey_number || player.player_id;
        ctx.font = 'bold 11px "JetBrains Mono", "SF Mono", monospace';
        ctx.textAlign = 'center';
        
        // Background pill
        const textMetrics = ctx.measureText(label);
        const pillWidth = textMetrics.width + 12;
        const pillHeight = 18;
        
        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.roundRect(labelX - pillWidth / 2, labelY - pillHeight / 2, pillWidth, pillHeight, 3);
        ctx.fill();
        
        // Text
        ctx.fillStyle = isTeamZero ? '#000000' : '#000000';
        ctx.fillText(label, labelX, labelY + 4);

        // Velocity stat (if available)
        if (player.velocity?.speed !== undefined) {
          const speedLabel = `${player.velocity.speed.toFixed(1)} m/s`;
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillStyle = `${strokeColor}CC`;
          ctx.fillText(speedLabel, labelX, labelY + 20);
        }
      }
    });

    // --- D. BALL ---
    if (options.showBall !== false && frameData.ball) {
      const ball = frameData.ball;
      const centerX = (ball.bbox.x + ball.bbox.width / 2) * scaleX;
      const centerY = (ball.bbox.y + ball.bbox.height / 2) * scaleY;
      const radius = Math.max(ball.bbox.width, ball.bbox.height) / 2 * scaleX;

      // Orange ball with glow
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#f97316';
      ctx.fill();
      
      // White border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Glow effect
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // --- E. FRAME INFO OVERLAY ---
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.textAlign = 'left';
    ctx.fillText(`FRAME: ${frameData.frame_number}`, 10, canvas.height - 10);

  }, [options.showGhost, options.showStats, options.showBall, team0Color, team1Color, canvasRef, videoRef]);

  // ============================================================
  // The Game Loop - Sync Video Time to Frame Data
  // ============================================================
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !analysisData) return;

    const frames = analysisData.frames || [];
    const fps = analysisData.fps || 30;

    // Handle time updates (fires ~4 times/sec)
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      
      // Use binary search + nearest neighbor to find frame
      const frame = getFrameAtTimestamp(frames, video.currentTime, fps);
      
      if (frame && frame.frame_number !== lastFrameRef.current) {
        lastFrameRef.current = frame.frame_number;
        setCurrentFrameData(frame as FrameDataWithMasks);
        drawFrame(frame as FrameDataWithMasks);
      }
    };

    // Handle seek events (immediate update)
    const handleSeeked = () => {
      const frame = getFrameAtTimestamp(frames, video.currentTime, fps);
      if (frame) {
        lastFrameRef.current = frame.frame_number;
        setCurrentFrameData(frame as FrameDataWithMasks);
        drawFrame(frame as FrameDataWithMasks);
      }
    };

    // Handle play/pause state
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadedMetadata = () => setDuration(video.duration);
    
    // Handle when video data is loaded (dimensions available)
    const handleLoadedData = () => {
      console.log(`[useGameLoop] Video loaded: ${video.videoWidth}x${video.videoHeight}`);
      // Draw initial frame when video is ready
      if (frames.length > 0) {
        const initialFrame = getFrameAtTimestamp(frames, video.currentTime, fps);
        if (initialFrame) {
          console.log(`[useGameLoop] Drawing initial frame ${initialFrame.frame_number}`);
          setCurrentFrameData(initialFrame as FrameDataWithMasks);
          drawFrame(initialFrame as FrameDataWithMasks);
        }
      }
    };

    // Attach listeners
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', handleLoadedData);

    // Initial state
    if (video.duration) setDuration(video.duration);
    if (!video.paused) setIsPlaying(true);

    // Draw initial frame if video is already loaded
    if (video.readyState >= 2 && frames.length > 0) {
      const initialFrame = getFrameAtTimestamp(frames, video.currentTime, fps);
      if (initialFrame) {
        console.log(`[useGameLoop] Drawing initial frame (already loaded) ${initialFrame.frame_number}`);
        setCurrentFrameData(initialFrame as FrameDataWithMasks);
        drawFrame(initialFrame as FrameDataWithMasks);
      }
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [analysisData, drawFrame, videoRef]);

  // ============================================================
  // Playback Controls
  // ============================================================
  const play = useCallback(() => {
    videoRef.current?.play();
  }, [videoRef]);

  const pause = useCallback(() => {
    videoRef.current?.pause();
  }, [videoRef]);

  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  }, [videoRef]);

  return {
    currentFrameData,
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    seek,
  };
}

// ============================================================
// useJobPolling - Poll job status until completion
// ============================================================

interface UseJobPollingOptions {
  jobId: string | null;
  onComplete?: (results: JobResults) => void;
  onError?: (error: Error) => void;
  onStatusChange?: (status: JobStatus) => void;
  pollInterval?: number;
}

interface UseJobPollingReturn {
  status: JobStatus | null;
  isPolling: boolean;
  error: Error | null;
  progress: number;
  eta: number | null;
  statusMessage: string;
}

/**
 * useJobPolling Hook
 * 
 * Polls the backend for job status until completion or failure.
 * Automatically fetches results when job completes.
 */
export function useJobPolling({
  jobId,
  onComplete,
  onError,
  onStatusChange,
  pollInterval = 2000,
}: UseJobPollingOptions): UseJobPollingReturn {
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const pollingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!jobId) {
      setStatus(null);
      setError(null);
      setIsPolling(false);
      return;
    }

    // Prevent duplicate polling
    if (pollingRef.current) return;
    pollingRef.current = true;
    setIsPolling(true);
    setError(null);

    pollUntilComplete(
      jobId,
      (newStatus) => {
        setStatus(newStatus);
        onStatusChange?.(newStatus);
      },
      pollInterval
    )
      .then((results) => {
        setIsPolling(false);
        pollingRef.current = false;
        onComplete?.(results);
      })
      .catch((err) => {
        setIsPolling(false);
        pollingRef.current = false;
        setError(err);
        onError?.(err);
      });

    return () => {
      pollingRef.current = false;
    };
  }, [jobId, pollInterval, onComplete, onError, onStatusChange]);

  // Status message mapping
  const getStatusMessage = (s: string | undefined): string => {
    const messages: Record<string, string> = {
      queued: 'Waiting in queue...',
      downloading: 'Downloading video...',
      processing: 'Processing video...',
      detecting_players: 'Detecting players...',
      detecting_ball: 'Tracking ball...',
      computing_homography: 'Mapping court coordinates...',
      tracking: 'Tracking player movements...',
      analyzing: 'Computing statistics...',
      completed: 'Analysis complete!',
      failed: 'Processing failed',
    };
    return messages[s || ''] || s || 'Unknown';
  };

  return {
    status,
    isPolling,
    error,
    progress: status?.progress ?? 0,
    eta: status?.eta ?? null,
    statusMessage: getStatusMessage(status?.status),
  };
}

// ============================================================
// useCourtMap - Render 2D court positions from frame data
// ============================================================

interface CourtPosition {
  id: string;
  x: number;  // 0-100 court coordinates
  y: number;
  teamId: 0 | 1;
  label?: string;
}

export function useCourtMap() {
  /**
   * Convert frame players to court positions for rendering
   */
  const getCourtPositions = useCallback((frameData: FrameDataWithMasks | null): CourtPosition[] => {
    if (!frameData) return [];

    const positions: CourtPosition[] = frameData.players
      .filter(p => p.court_x !== null && p.court_y !== null)
      .map(p => ({
        id: p.player_id,
        x: p.court_x,
        y: p.court_y,
        teamId: p.team_id as 0 | 1,
        label: p.jersey_number || undefined,
      }));

    // Add ball if present
    if (frameData.ball && frameData.ball.court_x !== null && frameData.ball.court_y !== null) {
      positions.push({
        id: 'ball',
        x: frameData.ball.court_x,
        y: frameData.ball.court_y,
        teamId: 0,
        label: '●',
      });
    }

    return positions;
  }, []);

  return { getCourtPositions };
}
