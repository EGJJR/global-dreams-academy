'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Upload,
  Link2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Eye,
  EyeOff,
  Target,
  Activity,
  Zap,
  Clock,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Search,
  Download,
  Share2,
  Settings,
  User,
  Users,
  TrendingUp,
  TrendingDown,
  Crosshair,
  Layers,
  Grid,
  BarChart3,
  Send,
  X,
  Check,
  AlertCircle,
  FileVideo,
  Youtube,
  Loader2,
  Menu,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { LogoInline } from '../components/Logo';

// API & Hooks
import { 
  api, 
  JobResults, 
  JobStatus, 
  ShotEvent as APIShotEvent,
  PlayerStats,
  getStatusMessage,
  filterShotEvents,
  getShootingPercentage
} from '../lib/api';
import { useGameLoop, useJobPolling, useCourtMap } from '../hooks/useGameLoop';

// Components
import { PlayLab } from '../components/PlayLab';
import { AICoach } from '../components/AICoach';

// ============================================================
// TYPES
// ============================================================

interface ProcessingJob {
  id: string;
  status: 'queued' | 'processing' | 'complete' | 'failed';
  progress: number;
  eta: string | null;
  videoTitle: string;
  thumbnail?: string;
}

interface GameAnalysis {
  id: string;
  title: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  status: 'complete' | 'processing';
  thumbnail?: string;
  duration: string;
  shotEvents: number;
  insights: number;
  videoUrl?: string;
}

// ============================================================
// UTILITY COMPONENTS
// ============================================================

const StatusBadge = ({ status }: { status: 'live' | 'processing' | 'ready' | 'error' }) => {
  const colors = {
    live: 'bg-red-500',
    processing: 'bg-orange-500',
    ready: 'bg-green-500',
    error: 'bg-red-500',
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${colors[status]} animate-pulse`} />
      <span className="label text-white/60 uppercase">{status}</span>
    </div>
  );
};

const DataLabel = ({ label, value, unit, trend }: { label: string; value: string | number; unit?: string; trend?: 'up' | 'down' }) => (
  <div className="bg-white/[0.02] border border-white/5 p-3 sm:p-4">
    <div className="label text-white/30 mb-1">{label}</div>
    <div className="flex items-end gap-1">
      <span className="font-display text-xl sm:text-2xl font-bold text-white">{value}</span>
      {unit && <span className="label text-white/40 mb-0.5">{unit}</span>}
      {trend && (
        trend === 'up' 
          ? <TrendingUp className="w-4 h-4 text-green-500 ml-2" />
          : <TrendingDown className="w-4 h-4 text-red-500 ml-2" />
      )}
    </div>
  </div>
);

// ============================================================
// PHASE 1: INGESTION COMPONENTS
// ============================================================

const InputTerminal = ({ onComplete }: { onComplete: (job: ProcessingJob, videoUrl: string) => void }) => {
  const [inputType, setInputType] = useState<'upload' | 'youtube' | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [teams, setTeams] = useState({ team0: '', team1: '' });
  const [step, setStep] = useState(1);
  const [videoInfo, setVideoInfo] = useState<{ title: string; thumbnail: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleYoutubeSubmit = () => {
    // Extract video info from URL (in production, fetch from YouTube API)
    const videoId = youtubeUrl.match(/(?:v=|\/)([\w-]{11})/)?.[1];
    setVideoInfo({
      title: videoId ? `YouTube Video: ${videoId}` : 'Video Analysis',
      thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : ''
    });
    setStep(2);
  };

  const handleDeploy = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Call the real API
      const response = await api.createJob({
        youtube_url: inputType === 'youtube' ? youtubeUrl : undefined,
        team_0_name: teams.team0 || 'Home',
        team_1_name: teams.team1 || 'Away',
      });

      onComplete(
        {
          id: response.job_id,
          status: 'queued',
          progress: 0,
          eta: null,
          videoTitle: videoInfo?.title || 'Uploaded Video',
          thumbnail: videoInfo?.thumbnail
        },
        youtubeUrl
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="label text-orange-500 mb-2">PHASE 01 // SOURCE SELECTION</div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight">
                Input Terminal
              </h2>
              <p className="text-white/40 mt-2">Select your intelligence source</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Secure Upload */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setInputType('upload')}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); setInputType('upload'); setStep(2); }}
                className={`relative p-8 border-2 border-dashed transition-all ${
                  inputType === 'upload' 
                    ? 'border-orange-500 bg-orange-500/10' 
                    : isDragging 
                      ? 'border-white/40 bg-white/5' 
                      : 'border-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-white/60" />
                  </div>
                  <div>
                    <div className="font-display text-lg font-bold uppercase">Secure Upload</div>
                    <div className="text-white/40 text-sm mt-1">Drag & Drop Raw File</div>
                  </div>
                </div>
                {inputType === 'upload' && (
                  <div className="absolute top-3 right-3">
                    <Check className="w-5 h-5 text-orange-500" />
                  </div>
                )}
              </motion.button>

              {/* Public Intel (YouTube) */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setInputType('youtube')}
                className={`relative p-8 border-2 border-dashed transition-all ${
                  inputType === 'youtube' 
                    ? 'border-orange-500 bg-orange-500/10' 
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center">
                    <Youtube className="w-8 h-8 text-white/60" />
                  </div>
                  <div>
                    <div className="font-display text-lg font-bold uppercase">Public Intel</div>
                    <div className="text-white/40 text-sm mt-1">Paste YouTube URL</div>
                  </div>
                </div>
                {inputType === 'youtube' && (
                  <div className="absolute top-3 right-3">
                    <Check className="w-5 h-5 text-orange-500" />
                  </div>
                )}
              </motion.button>
            </div>

            {inputType === 'youtube' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                <div className="relative">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-4 text-white font-mono text-sm focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
                <button
                  onClick={handleYoutubeSubmit}
                  disabled={!youtubeUrl}
                  className="w-full bg-white text-black py-4 font-display font-bold uppercase tracking-wide hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Fetch Target
                </button>
              </motion.div>
            )}

            {inputType === 'upload' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-white text-black py-4 font-display font-bold uppercase tracking-wide hover:bg-white/90 transition-colors"
                >
                  Continue
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="label text-orange-500 mb-2">PHASE 02 // CONTEXT INJECTION</div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight">
                Team Identification
              </h2>
              <p className="text-white/40 mt-2">Assign team names to detected clusters</p>
            </div>

            {/* Video Preview */}
            {videoInfo && (
              <div className="bg-white/5 border border-white/10 p-4 flex gap-4">
                <div className="w-32 h-20 bg-black/50 flex-shrink-0 relative overflow-hidden">
                  {videoInfo.thumbnail ? (
                    <img src={videoInfo.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileVideo className="w-6 h-6 text-white/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="label text-white/40 mb-1">TARGET CONFIRMED</div>
                  <div className="font-body text-white truncate">{videoInfo.title}</div>
                </div>
              </div>
            )}

            {/* Team Assignment */}
            <div className="space-y-4">
              <div className="label text-white/40">JERSEY CLUSTER ASSIGNMENT</div>
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Team 0 (Cluster 0) */}
                <div className="bg-white/5 border border-white/10 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-white/20" />
                    <span className="label text-white/40">CLUSTER 0 — WHITE</span>
                  </div>
                  <input
                    type="text"
                    value={teams.team0}
                    onChange={(e) => setTeams({ ...teams, team0: e.target.value })}
                    placeholder="e.g., Chicago Bulls"
                    className="w-full bg-transparent border-b border-white/20 py-2 text-white font-body focus:outline-none focus:border-orange-500 transition-colors placeholder:text-white/20"
                  />
                </div>

                {/* Team 1 (Cluster 1) */}
                <div className="bg-white/5 border border-white/10 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#CCFF00] border-2 border-[#CCFF00]/20" />
                    <span className="label text-white/40">CLUSTER 1 — VOLT</span>
                  </div>
                  <input
                    type="text"
                    value={teams.team1}
                    onChange={(e) => setTeams({ ...teams, team1: e.target.value })}
                    placeholder="e.g., Boston Celtics"
                    className="w-full bg-transparent border-b border-white/20 py-2 text-white font-body focus:outline-none focus:border-orange-500 transition-colors placeholder:text-white/20"
                  />
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-500 text-sm">{error}</span>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className="flex-1 border-2 border-white/20 py-4 font-display font-bold uppercase tracking-wide hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleDeploy}
                disabled={isSubmitting}
                className="flex-1 bg-orange-500 text-black py-4 font-display font-bold uppercase tracking-wide hover:bg-orange-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  'Initiate Compute'
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================
// LIBRARY VIEW
// ============================================================

const GameCard = ({ 
  game, 
  onSelect 
}: { 
  game: GameAnalysis; 
  onSelect: (game: GameAnalysis) => void;
}) => (
  <motion.button
    whileHover={{ scale: 1.02, y: -4 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onSelect(game)}
    className="w-full text-left bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all overflow-hidden group"
  >
    {/* Thumbnail Area */}
    <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-black overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <Play className="w-12 h-12 text-white/20 group-hover:text-white/40 transition-colors" />
      </div>
      
      {/* Status Badge */}
      <div className={`absolute top-3 right-3 px-2 py-1 text-xs font-bold uppercase ${
        game.status === 'complete' 
          ? 'bg-green-500/20 text-green-500 border border-green-500/30' 
          : 'bg-orange-500/20 text-orange-500 border border-orange-500/30'
      }`}>
        {game.status}
      </div>
      
      {/* Duration */}
      <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 text-white/60 text-xs font-mono">
        {game.duration}
      </div>
    </div>
    
    {/* Content */}
    <div className="p-4">
      <div className="label text-white/40 mb-1">
        {new Date(game.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })}
      </div>
      <h3 className="font-display text-lg font-bold text-white mb-2 truncate group-hover:text-white/90 transition-colors">
        {game.title}
      </h3>
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1 text-white/40">
          <Target className="w-3 h-3" />
          <span>{game.shotEvents} shots</span>
        </div>
        <div className="flex items-center gap-1 text-white/40">
          <Zap className="w-3 h-3" />
          <span>{game.insights} insights</span>
        </div>
      </div>
    </div>
  </motion.button>
);

const LibraryView = ({ 
  onSelectGame, 
  onNewAnalysis 
}: { 
  onSelectGame: (game: GameAnalysis) => void;
  onNewAnalysis: () => void;
}) => {
  const [jobs, setJobs] = useState<JobStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'complete' | 'processing'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await api.listJobs();
        setJobs(data);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
    // Refresh every 10 seconds
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, []);

  // Convert jobs to GameAnalysis format
  const games: GameAnalysis[] = jobs.map(job => ({
    id: job.job_id,
    title: `Analysis ${job.job_id.slice(0, 8)}`,
    homeTeam: 'Team A',
    awayTeam: 'Team B',
    date: job.created_at || new Date().toISOString(),
    status: job.status === 'completed' ? 'complete' : 'processing',
    duration: '--:--',
    shotEvents: 0,
    insights: 0,
  }));

  const filteredGames = games.filter(game => {
    const matchesFilter = filter === 'all' || 
      (filter === 'complete' && game.status === 'complete') ||
      (filter === 'processing' && game.status === 'processing');
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="label text-orange-500 mb-2">COMMAND CENTER</div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight">
              Game Library
            </h1>
            <p className="text-white/40 mt-2">Select a game to view analysis or start a new one</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewAnalysis}
            className="flex items-center gap-2 bg-orange-500 text-black px-6 py-4 font-display font-bold uppercase tracking-wide hover:bg-orange-400 transition-colors"
          >
            <Upload className="w-5 h-5" />
            New Analysis
          </motion.button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games..."
              className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-3 text-white font-body focus:outline-none focus:border-orange-500 transition-colors placeholder:text-white/30"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'complete', 'processing'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-3 font-display text-sm uppercase transition-colors ${
                  filter === f 
                    ? 'bg-white text-black' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/[0.02] border border-white/10 p-4">
            <div className="label text-white/40 mb-1">TOTAL JOBS</div>
            <div className="font-display text-3xl font-bold text-white">{jobs.length}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/10 p-4">
            <div className="label text-white/40 mb-1">COMPLETED</div>
            <div className="font-display text-3xl font-bold text-green-500">
              {jobs.filter(j => j.status === 'completed').length}
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/10 p-4">
            <div className="label text-white/40 mb-1">PROCESSING</div>
            <div className="font-display text-3xl font-bold text-orange-500">
              {jobs.filter(j => j.status !== 'completed' && j.status !== 'failed').length}
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/10 p-4">
            <div className="label text-white/40 mb-1">FAILED</div>
            <div className="font-display text-3xl font-bold text-red-500">
              {jobs.filter(j => j.status === 'failed').length}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-12 h-12 text-orange-500 mx-auto mb-4 animate-spin" />
            <p className="text-white/40">Loading analyses...</p>
          </div>
        ) : filteredGames.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {/* New Analysis Card */}
            <motion.button
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNewAnalysis}
              className="w-full aspect-[4/3] border-2 border-dashed border-white/20 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all flex flex-col items-center justify-center gap-4 group"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-orange-500/10 group-hover:border-orange-500/30 transition-colors">
                <Upload className="w-8 h-8 text-white/40 group-hover:text-orange-500 transition-colors" />
              </div>
              <div>
                <div className="font-display text-lg font-bold text-white/60 group-hover:text-white transition-colors">
                  Upload New Game
                </div>
                <div className="text-white/30 text-sm mt-1">
                  Start a new analysis
                </div>
              </div>
            </motion.button>

            {/* Game Cards */}
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} onSelect={onSelectGame} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FileVideo className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-white/40 mb-2">No analyses found</h3>
            <p className="text-white/30 mb-6">
              {searchQuery ? 'Try a different search term' : 'Upload your first game to get started'}
            </p>
            <button
              onClick={onNewAnalysis}
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-display font-bold uppercase hover:bg-white/90 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// MISSION STATUS (Processing View)
// ============================================================

const MissionStatus = ({ 
  job, 
  pollingStatus,
  onViewResults 
}: { 
  job: ProcessingJob; 
  pollingStatus: { progress: number; statusMessage: string; eta: number | null };
  onViewResults: () => void;
}) => {
  const isComplete = job.status === 'complete';
  const isFailed = job.status === 'failed';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto text-center"
    >
      <div className="bg-white/5 border border-white/10 p-8">
        {/* Progress Ring */}
        <div className="w-32 h-32 mx-auto mb-6 relative">
          {isComplete ? (
            <div className="absolute inset-0 border-4 border-green-500 rounded-full flex items-center justify-center">
              <Check className="w-12 h-12 text-green-500" />
            </div>
          ) : isFailed ? (
            <div className="absolute inset-0 border-4 border-red-500 rounded-full flex items-center justify-center">
              <X className="w-12 h-12 text-red-500" />
            </div>
          ) : (
            <>
              {/* Background ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - pollingStatus.progress / 100)}`}
                  className="transition-all duration-500"
                />
              </svg>
              {/* Percentage text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-2xl font-bold text-white">
                  {Math.round(pollingStatus.progress)}%
                </span>
              </div>
            </>
          )}
        </div>
        
        <div className={`label mb-2 ${
          isComplete ? 'text-green-500' : isFailed ? 'text-red-500' : 'text-orange-500'
        }`}>
          {isComplete ? 'COMPLETE' : isFailed ? 'FAILED' : pollingStatus.statusMessage.toUpperCase()}
        </div>
        
        <div className="font-display text-2xl font-bold uppercase mb-1">
          Job #{job.id.slice(0, 8)}
        </div>
        
        {!isComplete && !isFailed && (
          <>
            <div className="font-body text-white/40 mb-6">
              {pollingStatus.eta ? `ETA: ${Math.round(pollingStatus.eta / 60)} min` : 'Calculating...'}
            </div>
            <div className="bg-white/5 p-4 mb-6">
              <div className="font-mono text-sm text-white/60">{job.videoTitle}</div>
            </div>
            <p className="text-white/30 text-sm">
              Deep Compute is analyzing your footage. This window will update automatically.
            </p>
          </>
        )}

        {isComplete && (
          <>
            <div className="font-body text-white/40 mb-6">
              Analysis complete. Your briefing is ready.
            </div>
            <button
              onClick={onViewResults}
              className="w-full bg-white text-black py-4 font-display font-bold uppercase tracking-wide hover:bg-white/90 transition-colors"
            >
              View Morning Briefing
            </button>
          </>
        )}

        {isFailed && (
          <div className="font-body text-red-400/80 mt-4">
            Processing failed. Please try again with a different video.
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ============================================================
// ANNOTATED CINEMA (Video + Canvas Overlay)
// ============================================================

const AnnotatedCinema = ({ 
  videoRef,
  canvasRef,
  videoUrl,
  isPlaying, 
  onTogglePlay, 
  currentTime, 
  duration,
  ghostMode,
  onToggleGhost,
  shotEvents,
  onSeek 
}: { 
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  videoUrl: string | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number;
  duration: number;
  ghostMode: boolean;
  onToggleGhost: () => void;
  shotEvents: APIShotEvent[];
  onSeek: (time: number) => void;
}) => {
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate heatmap intensity for timeline
  const getTimelineHeat = (position: number) => {
    if (!duration) return 0;
    const timeAtPosition = (position / 100) * duration;
    const nearbyEvents = shotEvents.filter(e => Math.abs(e.timestamp - timeAtPosition) < 30);
    return Math.min(nearbyEvents.length / 3, 1);
  };

  return (
    <div className="bg-black/30 border border-white/10 overflow-hidden">
      {/* Video Container */}
      <div className="relative aspect-video bg-black">
        {/* HTML5 Video */}
        {videoUrl ? (
          <video 
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            muted={isMuted}
            playsInline
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
            <div className="text-center">
              <Play className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <div className="label text-white/30">NO VIDEO LOADED</div>
            </div>
          </div>
        )}

        {/* Canvas Overlay for Ghost Mode */}
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none w-full h-full"
        />

        {/* Ghost Mode Indicator */}
        {ghostMode && (
          <div className="absolute top-4 left-4 label text-[#CCFF00] flex items-center gap-2">
            <div className="w-2 h-2 bg-[#CCFF00] rounded-full animate-pulse" />
            X-RAY ACTIVE
          </div>
        )}

        {/* Timestamp Overlay */}
        <div className="absolute bottom-4 left-4 font-mono text-xs text-white/60 bg-black/50 px-2 py-1">
          TC: {formatTime(currentTime)} / {formatTime(duration || 0)}
        </div>

        {/* Corner Markers */}
        <div className="absolute top-2 left-2 w-8 h-8 border-l-2 border-t-2 border-white/20" />
        <div className="absolute top-2 right-2 w-8 h-8 border-r-2 border-t-2 border-white/20" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-l-2 border-b-2 border-white/20" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-r-2 border-b-2 border-white/20" />
      </div>

      {/* Controls Bar */}
      <div className="bg-black/50 border-t border-white/10 p-4">
        {/* Timeline with Heatmap */}
        <div className="relative h-2 bg-white/10 mb-4 cursor-pointer group" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const position = (e.clientX - rect.left) / rect.width;
          onSeek(position * (duration || 1));
        }}>
          {/* Heatmap Background */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: 100 }).map((_, i) => (
              <div 
                key={i} 
                className="flex-1 h-full"
                style={{ 
                  backgroundColor: `rgba(249, 115, 22, ${getTimelineHeat(i) * 0.5})` 
                }}
              />
            ))}
          </div>
          
          {/* Progress */}
          <div 
            className="absolute left-0 top-0 h-full bg-white/60"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
          
          {/* Shot Event Markers */}
          {shotEvents.map((event) => (
            <button
              key={event.event_id}
              onClick={(e) => { e.stopPropagation(); onSeek(event.timestamp - 3); }}
              className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-transform hover:scale-150 ${
                event.made 
                  ? 'bg-green-500 border-green-400' 
                  : 'bg-red-500 border-red-400'
              }`}
              style={{ left: `${duration ? (event.timestamp / duration) * 100 : 0}%` }}
              title={`${event.made ? '✓' : '✗'} ${event.shot_type} by ${event.player_id}`}
            />
          ))}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onSeek(Math.max(0, currentTime - 10))}
              className="p-2 hover:bg-white/10 transition-colors"
            >
              <SkipBack className="w-5 h-5 text-white/60" />
            </button>
            <button 
              onClick={onTogglePlay}
              className="p-3 bg-white text-black hover:bg-white/90 transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => onSeek(Math.min(duration || 0, currentTime + 10))}
              className="p-2 hover:bg-white/10 transition-colors"
            >
              <SkipForward className="w-5 h-5 text-white/60" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Volume */}
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMuted(!isMuted)} className="p-2 hover:bg-white/10 transition-colors">
                {isMuted ? <VolumeX className="w-5 h-5 text-white/60" /> : <Volume2 className="w-5 h-5 text-white/60" />}
              </button>
            </div>

            {/* X-Ray Toggle */}
            <button 
              onClick={onToggleGhost}
              className={`flex items-center gap-2 px-3 py-2 border transition-colors ${
                ghostMode 
                  ? 'border-[#CCFF00] text-[#CCFF00] bg-[#CCFF00]/10' 
                  : 'border-white/20 text-white/60 hover:border-white/40'
              }`}
            >
              {ghostMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span className="label hidden sm:inline">X-RAY</span>
            </button>

            {/* Fullscreen */}
            <button className="p-2 hover:bg-white/10 transition-colors">
              <Maximize2 className="w-5 h-5 text-white/60" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// TACTICAL MAP (2D Court View)
// ============================================================

const TacticalMap = ({ 
  courtPositions,
  shotEvents,
  showHeatmap,
  onToggleHeatmap,
  team0Color,
  team1Color
}: { 
  courtPositions: { id: string; x: number; y: number; teamId: 0 | 1; label?: string }[];
  shotEvents: APIShotEvent[];
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
  team0Color?: string;
  team1Color?: string;
}) => {
  const t0Color = team0Color || '#FFFFFF';
  const t1Color = team1Color || '#CCFF00';

  return (
    <div className="bg-black/30 border border-white/10 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div>
          <div className="label text-white/40">PANE B</div>
          <div className="font-display text-lg font-bold uppercase">Tactical Map</div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onToggleHeatmap}
            className={`p-2 border transition-colors ${
              showHeatmap 
                ? 'border-orange-500 text-orange-500 bg-orange-500/10' 
                : 'border-white/20 text-white/40 hover:border-white/40'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Court View */}
      <div className="flex-1 p-4 relative">
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full"
          style={{ maxHeight: '300px' }}
        >
          {/* Court Background */}
          <rect x="0" y="0" width="100" height="100" fill="#0a0a0a" />
          
          {/* Court Lines */}
          <rect x="5" y="5" width="90" height="90" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          
          {/* Center Circle */}
          <circle cx="50" cy="50" r="10" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.2)" />
          
          {/* Half Court Line */}
          <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          
          {/* Three Point Lines */}
          <path d="M 5 20 Q 30 15, 30 50 Q 30 85, 5 80" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <path d="M 95 20 Q 70 15, 70 50 Q 70 85, 95 80" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          
          {/* Paint Areas */}
          <rect x="5" y="35" width="15" height="30" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <rect x="80" y="35" width="15" height="30" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          
          {/* Hoops */}
          <circle cx="8" cy="50" r="2" fill="none" stroke="rgba(249,115,22,0.5)" strokeWidth="0.5" />
          <circle cx="92" cy="50" r="2" fill="none" stroke="rgba(249,115,22,0.5)" strokeWidth="0.5" />
          
          {/* Heatmap Overlay */}
          {showHeatmap && (
            <g opacity="0.4">
              <defs>
                <radialGradient id="heatGradient">
                  <stop offset="0%" stopColor="rgba(249,115,22,0.8)" />
                  <stop offset="100%" stopColor="rgba(249,115,22,0)" />
                </radialGradient>
              </defs>
              <ellipse cx="75" cy="50" rx="15" ry="20" fill="url(#heatGradient)" />
              <ellipse cx="25" cy="50" rx="12" ry="15" fill="url(#heatGradient)" />
            </g>
          )}
          
          {/* Shot Events */}
          {shotEvents.map((shot) => (
            <g key={shot.event_id}>
              <circle 
                cx={shot.court_x} 
                cy={shot.court_y} 
                r="1.5"
                fill={shot.made ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)'}
                stroke={shot.made ? '#22c55e' : '#ef4444'}
                strokeWidth="0.3"
              />
            </g>
          ))}
          
          {/* Player Positions - Real-time from Frame Data */}
          {courtPositions.map((pos) => (
            <g key={pos.id}>
              <circle 
                cx={pos.x} 
                cy={pos.y} 
                r="3"
                fill={pos.teamId === 0 ? t0Color : t1Color}
                stroke={pos.teamId === 0 ? t0Color : t1Color}
                strokeWidth="0.5"
                opacity="0.9"
                style={{
                  filter: `drop-shadow(0 0 4px ${pos.teamId === 0 ? t0Color : t1Color})`,
                  transition: 'cx 75ms, cy 75ms'
                }}
              />
              {pos.label && (
                <text 
                  x={pos.x} 
                  y={pos.y + 1}
                  textAnchor="middle"
                  fontSize="2"
                  fill={pos.teamId === 0 ? '#000' : '#000'}
                  fontWeight="bold"
                >
                  {pos.label}
                </text>
              )}
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t0Color }} />
            <span className="text-white/40">Team 0</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t1Color }} />
            <span className="text-white/40">Team 1</span>
          </div>
        </div>
      </div>

      {/* Sync Info */}
      <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/30">
        <span>COURT: 100x100</span>
        <span>PLAYERS: {courtPositions.length}</span>
      </div>
    </div>
  );
};

// ============================================================
// BIOMETRIC PROFILE
// ============================================================

const BiometricProfile = ({ 
  players,
  selectedPlayerId,
  onSelectPlayer,
  team0Color,
  team1Color
}: { 
  players: Record<string, PlayerStats>;
  selectedPlayerId: string | null;
  onSelectPlayer: (id: string) => void;
  team0Color?: string;
  team1Color?: string;
}) => {
  const playerList = Object.values(players);
  const selectedPlayer = selectedPlayerId ? players[selectedPlayerId] : playerList[0] || null;
  const t0Color = team0Color || '#FFFFFF';
  const t1Color = team1Color || '#CCFF00';

  return (
    <div className="bg-black/30 border border-white/10 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="label text-white/40">PANE C</div>
        <div className="font-display text-lg font-bold uppercase">Biometric Profile</div>
      </div>

      {/* Player Selector */}
      <div className="p-4 border-b border-white/10">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {playerList.slice(0, 10).map((p) => (
            <button
              key={p.player_id}
              onClick={() => onSelectPlayer(p.player_id)}
              className={`flex-shrink-0 px-4 py-2 border transition-colors ${
                selectedPlayer?.player_id === p.player_id 
                  ? 'border-orange-500 bg-orange-500/10 text-orange-500' 
                  : 'border-white/10 text-white/40 hover:border-white/30'
              }`}
            >
              <span className="font-display font-bold">
                {p.jersey_number || p.player_id.slice(0, 4)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Player Stats */}
      {selectedPlayer ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Player Header */}
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 border flex items-center justify-center"
              style={{ 
                borderColor: selectedPlayer.team_id === 0 ? t0Color : t1Color,
                backgroundColor: `${selectedPlayer.team_id === 0 ? t0Color : t1Color}20`
              }}
            >
              <span className="font-display text-2xl font-bold" style={{ color: selectedPlayer.team_id === 0 ? t0Color : t1Color }}>
                {selectedPlayer.jersey_number || '#'}
              </span>
            </div>
            <div>
              <div className="font-display text-xl font-bold uppercase">
                Player {selectedPlayer.player_id}
              </div>
              <div className="label text-white/40">
                Team {selectedPlayer.team_id}
              </div>
            </div>
          </div>

          {/* Distance & Speed */}
          <div className="grid grid-cols-2 gap-3">
            <DataLabel 
              label="DISTANCE" 
              value={selectedPlayer.total_distance?.toFixed(1) || '0'} 
              unit="m" 
            />
            <DataLabel 
              label="AVG SPEED" 
              value={selectedPlayer.avg_speed?.toFixed(1) || '0'} 
              unit="m/s" 
            />
          </div>

          {/* Shooting Split */}
          <div className="bg-white/5 border border-white/10 p-4">
            <div className="label text-white/40 mb-3">SHOOTING SPLIT</div>
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="font-display text-3xl font-bold text-green-500">
                  {selectedPlayer.shots_made || 0}
                </div>
                <div className="label text-white/40">MAKES</div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-center">
                <div className="font-display text-3xl font-bold text-red-500">
                  {(selectedPlayer.shots_attempted || 0) - (selectedPlayer.shots_made || 0)}
                </div>
                <div className="label text-white/40">MISSES</div>
              </div>
            </div>
            {selectedPlayer.shots_attempted > 0 && (
              <div className="mt-4">
                <div className="h-2 bg-white/10 flex overflow-hidden">
                  <div 
                    className="h-full bg-green-500"
                    style={{ width: `${getShootingPercentage(selectedPlayer)}%` }}
                  />
                </div>
                <div className="text-center mt-2 font-mono text-sm text-white/60">
                  {getShootingPercentage(selectedPlayer).toFixed(1)}% FG
                </div>
              </div>
            )}
          </div>

          {/* Max Speed */}
          <DataLabel 
            label="MAX SPEED" 
            value={selectedPlayer.max_speed?.toFixed(1) || '0'} 
            unit="m/s" 
            trend={selectedPlayer.max_speed > 5 ? 'up' : undefined}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center p-8">
          <div>
            <Target className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <div className="label text-white/40">NO PLAYER DATA</div>
            <p className="text-white/20 text-sm mt-2">Analysis data will appear here</p>
          </div>
        </div>
      )}
    </div>
  );
};

// PlayLab is now imported from '../components/PlayLab'

// ============================================================
// MAIN DASHBOARD PAGE
// ============================================================

export default function DashboardPage() {
  // Phase State
  const [phase, setPhase] = useState<'library' | 'ingestion' | 'processing' | 'dashboard'>('library');
  
  // Job State
  const [currentJob, setCurrentJob] = useState<ProcessingJob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  // Analysis Data (from Backend)
  const [analysisData, setAnalysisData] = useState<JobResults | null>(null);
  
  // UI State
  const [showGhost, setShowGhost] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ============================================================
  // POLLING INTEGRATION
  // ============================================================
  const { 
    status: pollingStatus, 
    isPolling, 
    progress, 
    eta, 
    statusMessage 
  } = useJobPolling({
    jobId: phase === 'processing' ? currentJob?.id || null : null,
    onComplete: (data) => {
      console.log('Analysis Complete:', data);
      setAnalysisData(data);
      setCurrentJob(prev => prev ? { ...prev, status: 'complete' } : null);
    },
    onError: (err) => {
      console.error('Job Failed:', err);
      setCurrentJob(prev => prev ? { ...prev, status: 'failed' } : null);
    },
    pollInterval: 2000
  });

  // ============================================================
  // GAME LOOP INTEGRATION
  // ============================================================
  const { 
    currentFrameData, 
    isPlaying, 
    currentTime, 
    duration,
    play,
    pause,
    seek
  } = useGameLoop(
    videoRef,
    canvasRef,
    analysisData,
    { showGhost, showStats: true, showBall: true }
  );

  // ============================================================
  // COURT MAP INTEGRATION
  // ============================================================
  const { getCourtPositions } = useCourtMap();
  const courtPositions = getCourtPositions(currentFrameData);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleIngestionComplete = (job: ProcessingJob, url: string) => {
    setCurrentJob(job);
    setVideoUrl(url);
    setPhase('processing');
  };

  const handleSelectGame = async (game: GameAnalysis) => {
    if (game.status === 'complete') {
      try {
        const results = await api.getJobResults(game.id);
        setAnalysisData(results);
        // Use video_stream_url for local playback, with fallback to video_url
        const streamUrl = results.video_stream_url 
          ? `http://localhost:8000${results.video_stream_url}`
          : results.video_url;
        setVideoUrl(streamUrl || null);
        setPhase('dashboard');
      } catch (err) {
        console.error('Failed to load results:', err);
      }
    } else {
      // Resume polling for in-progress job
      setCurrentJob({
        id: game.id,
        status: 'processing',
        progress: 0,
        eta: null,
        videoTitle: game.title,
      });
      setPhase('processing');
    }
  };

  const handleBackToLibrary = () => {
    setPhase('library');
    setAnalysisData(null);
    setCurrentJob(null);
    setVideoUrl(null);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  // Extract data from analysis
  const shotEvents = analysisData?.shot_events || [];
  const players = analysisData?.players || {};

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/">
              <LogoInline />
            </Link>
            <div className="hidden md:flex items-center gap-1 text-white/40">
              <ChevronRight className="w-4 h-4" />
              <span className="label">COMMAND CENTER</span>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-4">
            <StatusBadge status={
              phase === 'dashboard' ? 'ready' : 
              phase === 'processing' ? 'processing' : 
              'ready'
            } />
            {phase === 'dashboard' && (
              <>
                <button className="p-2 hover:bg-white/5 transition-colors">
                  <Share2 className="w-5 h-5 text-white/40" />
                </button>
                <button className="p-2 hover:bg-white/5 transition-colors">
                  <Download className="w-5 h-5 text-white/40" />
                </button>
              </>
            )}
          </div>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-14 sm:pt-16 min-h-screen">
        <AnimatePresence mode="wait">
          {/* Library View (Default) */}
          {phase === 'library' && (
            <motion.div
              key="library"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LibraryView 
                onSelectGame={handleSelectGame}
                onNewAnalysis={() => setPhase('ingestion')}
              />
            </motion.div>
          )}

          {/* Phase 1: Ingestion */}
          {phase === 'ingestion' && (
            <motion.div
              key="ingestion"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-8"
            >
              <div className="w-full max-w-2xl">
                <button
                  onClick={handleBackToLibrary}
                  className="inline-flex items-center gap-2 text-white/40 hover:text-white label mb-8 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  BACK TO LIBRARY
                </button>
                <InputTerminal onComplete={handleIngestionComplete} />
              </div>
            </motion.div>
          )}

          {/* Phase 1.5: Processing */}
          {phase === 'processing' && currentJob && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-8"
            >
              <MissionStatus 
                job={currentJob}
                pollingStatus={{ progress, statusMessage, eta }}
                onViewResults={() => setPhase('dashboard')} 
              />
            </motion.div>
          )}

          {/* Phase 2 & 3: Dashboard */}
          {phase === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 sm:p-6"
            >
              {/* Dashboard Header */}
              <div className="max-w-[1800px] mx-auto mb-6">
                <button
                  onClick={handleBackToLibrary}
                  className="inline-flex items-center gap-2 text-white/40 hover:text-white label mb-4 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  BACK TO LIBRARY
                </button>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="label text-orange-500 mb-1">
                      MORNING BRIEFING // {new Date().toLocaleDateString()}
                    </div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight">
                      {analysisData?.teams?.team_0?.name || 'Team A'} vs {analysisData?.teams?.team_1?.name || 'Team B'}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPhase('ingestion')}
                      className="px-4 py-2 border border-white/20 label text-white/60 hover:bg-white/5 transition-colors"
                    >
                      New Analysis
                    </button>
                    <button className="px-4 py-2 bg-orange-500 text-black label font-bold hover:bg-orange-400 transition-colors flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>
              </div>

              {/* Three-Pane Layout */}
              <div className="max-w-[1800px] mx-auto grid lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Pane A: Annotated Cinema */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                  <AnnotatedCinema 
                    videoRef={videoRef}
                    canvasRef={canvasRef}
                    videoUrl={videoUrl}
                    isPlaying={isPlaying}
                    onTogglePlay={handleTogglePlay}
                    currentTime={currentTime}
                    duration={duration}
                    ghostMode={showGhost}
                    onToggleGhost={() => setShowGhost(!showGhost)}
                    shotEvents={shotEvents}
                    onSeek={seek}
                  />
                  
                  {/* Pane B: Tactical Map */}
                  <div className="hidden lg:block">
                    <TacticalMap 
                      courtPositions={courtPositions}
                      shotEvents={shotEvents}
                      showHeatmap={showHeatmap}
                      onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
                      team0Color={analysisData?.teams?.team_0?.color_primary}
                      team1Color={analysisData?.teams?.team_1?.color_primary}
                    />
                  </div>
                </div>

                {/* Pane C: Biometric Profile */}
                <div className="space-y-4 sm:space-y-6">
                  <BiometricProfile 
                    players={players}
                    selectedPlayerId={selectedPlayerId}
                    onSelectPlayer={setSelectedPlayerId}
                    team0Color={analysisData?.teams?.team_0?.color_primary}
                    team1Color={analysisData?.teams?.team_1?.color_primary}
                  />
                  
                  {/* Tactical Map (mobile) */}
                  <div className="lg:hidden">
                    <TacticalMap 
                      courtPositions={courtPositions}
                      shotEvents={shotEvents}
                      showHeatmap={showHeatmap}
                      onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
                    />
                  </div>
                </div>
              </div>

              {/* Phase 3: Play Lab */}
              <div className="max-w-[1800px] mx-auto mt-4 sm:mt-6">
                <PlayLab 
                  analysisData={analysisData}
                  currentFrameData={currentFrameData}
                  currentTime={currentTime}
                  isPlaying={isPlaying}
                  onSeek={seek}
                  onPause={pause}
                  onPlay={play}
                  team0Color={analysisData?.teams?.team_0?.color_primary || '#FFFFFF'}
                  team1Color={analysisData?.teams?.team_1?.color_primary || '#CCFF00'}
                />
              </div>
              
              {/* AI Coach Chat */}
              <div className="max-w-[1800px] mx-auto mt-4 sm:mt-6">
                <AICoach 
                  jobId={analysisData?.job_id || currentJob?.id || null}
                  currentFrame={currentFrameData?.frame_number}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
