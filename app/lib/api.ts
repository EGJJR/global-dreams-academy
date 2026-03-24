/**
 * VANTAGE API Client
 * 
 * Connects to the vantage-engine Python backend
 * API Base URL should be set in .env.local as NEXT_PUBLIC_API_URL
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ============================================================
// TYPES - Matches backend schemas exactly
// ============================================================

// Bounding box format from backend
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Player data within a frame
export interface PlayerFrame {
  player_id: string;          // Backend uses "p0", "p1", etc.
  team_id: 0 | 1;
  bbox: BoundingBox;
  confidence: number;
  court_x: number;            // Homography-transformed (0-100 scale)
  court_y: number;
  jersey_number: string | null;
  keypoints: number[][] | null;
  mask?: number[][];          // SAM2 polygon mask [[x,y], [x,y], ...]
  velocity?: {                // Movement data
    speed: number;            // m/s
    direction?: number;       // degrees
  };
  // AI action classification
  action?: string;            // Current action: stationary, walking, running, sprinting, dribbling, cutting, screening, defending
  action_target?: string;     // Target player ID for actions like screening or defending
  has_ball?: boolean;         // True if player has possession of the ball
}

// Ball data within a frame
export interface BallFrame {
  bbox: BoundingBox;
  confidence: number;
  court_x: number;
  court_y: number;
}

// Defense formation types
export type DefenseType = 
  | 'packed_paint'    // All defenders collapsed in the paint
  | 'zone_2_3'        // 2-3 zone
  | 'zone_3_2'        // 3-2 zone
  | 'man_to_man'      // Man-to-man defense
  | 'press'           // Full court press
  | 'unknown';

// Defender reaction prediction
export interface DefenderReaction {
  defender_id: string;
  reaction_type: 'collapse' | 'switch' | 'hedge' | 'stay' | 'rotate';
  target_x: number;      // Predicted destination (0-100)
  target_y: number;
  confidence: number;
}

// Tactical analysis for a frame
export interface TacticalAnalysis {
  defense_type: DefenseType;
  defender_connections: [string, string][];  // Pairs of defenders moving in sync
  predict_defender_reactions?: DefenderReaction[];
  offensive_spacing_score?: number;  // 0-100
  paint_congestion?: number;         // 0-100
}

// Single frame data
export interface FrameData {
  frame_number: number;
  timestamp: number;
  players: PlayerFrame[];
  ball: BallFrame | null;
  homography_matrix: number[] | null;
  tactical?: TacticalAnalysis;  // Tactical data for this frame
  // AI action classification
  current_play?: string;       // Current play being run: pick_and_roll, isolation, etc.
  ball_possessor?: string;     // Player ID who has the ball
  offensive_team?: 0 | 1;      // Which team has possession
  narration?: string;          // AI-generated description of what's happening
}

// Tactical event types
export type TacticalEventType = 
  | 'screen_set'
  | 'fast_break'
  | 'isolation'
  | 'pick_and_roll'
  | 'post_up'
  | 'transition'
  | 'defensive_breakdown';

// Tactical event detected in the game
export interface TacticalEvent {
  event_id: string;
  event_type: TacticalEventType;
  timestamp: number;
  frame_number: number;
  description: string;
  involved_players: string[];
  court_x?: number;
  court_y?: number;
  success?: boolean;
}

// Shot event
export interface ShotEvent {
  event_id: string;
  frame_number: number;
  timestamp: number;
  player_id: string;
  team_id: 0 | 1;
  shot_type: 'layup' | 'mid_range' | 'three_pointer' | 'free_throw' | 'dunk';
  made: boolean;
  court_x: number;
  court_y: number;
}

// Team info
export interface TeamInfo {
  name: string;
  color_primary: string;
  color_secondary: string;
  player_ids: string[];
}

// Player statistics
export interface PlayerStats {
  player_id: string;
  team_id: 0 | 1;
  jersey_number: string | null;
  total_distance: number;
  avg_speed: number;
  max_speed: number;
  time_with_ball: number;
  shots_attempted: number;
  shots_made: number;
  heatmap: number[][];
}

// Full job results
export interface JobResults {
  job_id: string;
  video_url: string;
  /** Optional streaming path for local dashboard playback */
  video_stream_url?: string;
  duration_seconds: number;
  total_frames: number;
  processed_frames: number;
  fps: number;
  frames: FrameData[];
  shot_events: ShotEvent[];
  tactical_events?: TacticalEvent[];  // Detected plays/events
  teams: {
    team_0: TeamInfo;
    team_1: TeamInfo;
  };
  players: Record<string, PlayerStats>;
  processing_time_seconds: number;
  model_versions: {
    player: string;
    ball: string;
    court: string;
  };
}

// Job status
export type JobStatusType = 
  | 'queued'
  | 'downloading'
  | 'processing'
  | 'detecting_players'
  | 'detecting_ball'
  | 'computing_homography'
  | 'tracking'
  | 'analyzing'
  | 'completed'
  | 'failed';

export interface JobStatus {
  job_id: string;
  status: JobStatusType;
  progress: number | null;
  eta: number | null;          // seconds remaining
  error: string | null;
  created_at: string;
  updated_at: string;
}

// Create job request
export interface CreateJobRequest {
  video_url?: string;
  youtube_url?: string;
  team_0_name?: string;
  team_1_name?: string;
}

// Create job response
export interface CreateJobResponse {
  job_id: string;
  status: 'queued';
}

// Health check response
export interface HealthResponse {
  status: 'healthy';
  service: string;
  version: string;
}

// ============================================================
// API CLIENT
// ============================================================

export const api = {
  /**
   * Health check - verify backend is running
   */
  async healthCheck(): Promise<HealthResponse> {
    const res = await fetch(`${API_URL}/health`);
    if (!res.ok) throw new Error('Backend unavailable');
    return res.json();
  },

  /**
   * Create a new processing job
   */
  async createJob(params: CreateJobRequest): Promise<CreateJobResponse> {
    const res = await fetch(`${API_URL}/api/v1/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to create job: ${error}`);
    }
    return res.json();
  },

  /**
   * List all jobs
   */
  async listJobs(limit = 50, offset = 0): Promise<JobStatus[]> {
    const res = await fetch(`${API_URL}/api/v1/jobs?limit=${limit}&offset=${offset}`);
    if (!res.ok) throw new Error('Failed to list jobs');
    return res.json();
  },

  /**
   * Get job status (for polling)
   */
  async getJobStatus(jobId: string): Promise<JobStatus> {
    const res = await fetch(`${API_URL}/api/v1/jobs/${jobId}/status`);
    if (!res.ok) throw new Error('Job not found');
    return res.json();
  },

  /**
   * Get full results for a completed job
   */
  async getJobResults(jobId: string): Promise<JobResults> {
    const res = await fetch(`${API_URL}/api/v1/jobs/${jobId}/results`);
    if (!res.ok) throw new Error('Results not ready');
    return res.json();
  },

  /**
   * Delete a job
   */
  async deleteJob(jobId: string): Promise<{ message: string; job_id: string }> {
    const res = await fetch(`${API_URL}/api/v1/jobs/${jobId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete job');
    return res.json();
  },
};

// ============================================================
// POLLING UTILITIES
// ============================================================

/**
 * Poll job status until completion or failure
 */
export async function pollUntilComplete(
  jobId: string,
  onStatusUpdate: (status: JobStatus) => void,
  pollInterval = 2000
): Promise<JobResults> {
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const status = await api.getJobStatus(jobId);
        onStatusUpdate(status);

        if (status.status === 'completed') {
          const results = await api.getJobResults(jobId);
          resolve(results);
        } else if (status.status === 'failed') {
          reject(new Error(status.error || 'Job failed'));
        } else {
          setTimeout(poll, pollInterval);
        }
      } catch (error) {
        reject(error);
      }
    };

    poll();
  });
}

// ============================================================
// DATA UTILITIES
// ============================================================

/**
 * Convert bbox from backend format to [x1, y1, x2, y2] array
 */
export function bboxToArray(bbox: BoundingBox): [number, number, number, number] {
  return [bbox.x, bbox.y, bbox.x + bbox.width, bbox.y + bbox.height];
}

/**
 * Find frame data for a given video timestamp
 */
export function getFrameAtTimestamp(
  frames: FrameData[],
  timestamp: number,
  fps: number
): FrameData | null {
  if (frames.length === 0) return null;
  
  const targetFrame = Math.floor(timestamp * fps);
  
  // Binary search for efficiency
  let left = 0;
  let right = frames.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (frames[mid].frame_number === targetFrame) {
      return frames[mid];
    } else if (frames[mid].frame_number < targetFrame) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  // Return closest frame
  if (right < 0) return frames[0];
  if (left >= frames.length) return frames[frames.length - 1];
  
  const leftDiff = Math.abs(frames[left].frame_number - targetFrame);
  const rightDiff = Math.abs(frames[right].frame_number - targetFrame);
  
  return leftDiff < rightDiff ? frames[left] : frames[right];
}

/**
 * Get player by ID from results
 */
export function getPlayerById(
  results: JobResults,
  playerId: string
): PlayerStats | null {
  return results.players[playerId] || null;
}

/**
 * Get all players for a team
 */
export function getTeamPlayers(
  results: JobResults,
  teamId: 0 | 1
): PlayerStats[] {
  const team = teamId === 0 ? results.teams.team_0 : results.teams.team_1;
  return team.player_ids
    .map(id => results.players[id])
    .filter((p): p is PlayerStats => p !== undefined);
}

/**
 * Filter shot events by criteria
 */
export function filterShotEvents(
  events: ShotEvent[],
  filters: {
    playerId?: string;
    teamId?: 0 | 1;
    shotType?: ShotEvent['shot_type'];
    made?: boolean;
    minTimestamp?: number;
    maxTimestamp?: number;
  }
): ShotEvent[] {
  return events.filter(event => {
    if (filters.playerId && event.player_id !== filters.playerId) return false;
    if (filters.teamId !== undefined && event.team_id !== filters.teamId) return false;
    if (filters.shotType && event.shot_type !== filters.shotType) return false;
    if (filters.made !== undefined && event.made !== filters.made) return false;
    if (filters.minTimestamp && event.timestamp < filters.minTimestamp) return false;
    if (filters.maxTimestamp && event.timestamp > filters.maxTimestamp) return false;
    return true;
  });
}

/**
 * Calculate shooting percentage for a player
 */
export function getShootingPercentage(player: PlayerStats): number {
  if (player.shots_attempted === 0) return 0;
  return (player.shots_made / player.shots_attempted) * 100;
}

/**
 * Convert status to human-readable message
 */
export function getStatusMessage(status: JobStatusType): string {
  const messages: Record<JobStatusType, string> = {
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
  return messages[status] || status;
}

/**
 * Get team color for rendering
 */
export function getTeamColor(results: JobResults, teamId: 0 | 1): string {
  const team = teamId === 0 ? results.teams.team_0 : results.teams.team_1;
  return team.color_primary;
}

// ============================================================
// TACTICAL UTILITIES
// ============================================================

/**
 * Filter tactical events by type
 */
export function filterTacticalEvents(
  events: TacticalEvent[],
  eventTypes?: TacticalEventType[]
): TacticalEvent[] {
  if (!eventTypes || eventTypes.length === 0) return events;
  return events.filter(e => eventTypes.includes(e.event_type));
}

/**
 * Get defenders from a frame (team_id === 1 by default, but can be configured)
 */
export function getDefenders(
  frame: FrameData,
  defenseTeamId: 0 | 1 = 1
): PlayerFrame[] {
  return frame.players.filter(p => p.team_id === defenseTeamId);
}

/**
 * Get attackers from a frame
 */
export function getAttackers(
  frame: FrameData,
  offenseTeamId: 0 | 1 = 0
): PlayerFrame[] {
  return frame.players.filter(p => p.team_id === offenseTeamId);
}

/**
 * Calculate distance between two court positions
 */
export function courtDistance(
  x1: number, y1: number, 
  x2: number, y2: number
): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Calculate centroid of player positions
 */
export function calculateCentroid(
  players: { court_x: number; court_y: number }[]
): { x: number; y: number } {
  if (players.length === 0) return { x: 50, y: 50 };
  const sum = players.reduce(
    (acc, p) => ({ x: acc.x + p.court_x, y: acc.y + p.court_y }),
    { x: 0, y: 0 }
  );
  return { x: sum.x / players.length, y: sum.y / players.length };
}

/**
 * Get human-readable label for tactical event type
 */
export function getTacticalEventLabel(type: TacticalEventType): string {
  const labels: Record<TacticalEventType, string> = {
    screen_set: 'Screen Set',
    fast_break: 'Fast Break',
    isolation: 'Isolation',
    pick_and_roll: 'Pick & Roll',
    post_up: 'Post Up',
    transition: 'Transition',
    defensive_breakdown: 'Defensive Breakdown',
  };
  return labels[type] || type;
}

/**
 * Get icon/color for tactical event type
 */
export function getTacticalEventStyle(type: TacticalEventType): { color: string; icon: string } {
  const styles: Record<TacticalEventType, { color: string; icon: string }> = {
    screen_set: { color: '#3b82f6', icon: '🛡️' },
    fast_break: { color: '#ef4444', icon: '⚡' },
    isolation: { color: '#8b5cf6', icon: '👤' },
    pick_and_roll: { color: '#f97316', icon: '🔄' },
    post_up: { color: '#10b981', icon: '📍' },
    transition: { color: '#06b6d4', icon: '➡️' },
    defensive_breakdown: { color: '#f43f5e', icon: '⚠️' },
  };
  return styles[type] || { color: '#6b7280', icon: '📌' };
}
