'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Eye,
  EyeOff,
  Layers,
  Move,
  RotateCcw,
  Zap,
  Clock,
  ChevronRight,
  Filter,
  Search,
  Crosshair,
  Shield,
  Users,
  Activity,
  Target,
  AlertTriangle,
} from 'lucide-react';

import {
  FrameData,
  PlayerFrame,
  TacticalEvent,
  TacticalEventType,
  DefenderReaction,
  JobResults,
  getDefenders,
  getAttackers,
  courtDistance,
  calculateCentroid,
  getTacticalEventLabel,
  getTacticalEventStyle,
  filterTacticalEvents,
} from '../lib/api';

// ============================================================
// TYPES
// ============================================================

interface CourtPosition {
  id: string;
  x: number;
  y: number;
  teamId: 0 | 1;
  label?: string;
  isDragging?: boolean;
  isGhost?: boolean;
}

interface SimulationState {
  isActive: boolean;
  draggedPlayer: string | null;
  originalPositions: Map<string, { x: number; y: number }>;
  modifiedPositions: Map<string, { x: number; y: number }>;
  ghostPaths: DefenderReaction[];
}

// ============================================================
// TACTICAL MAP WITH FORMATIONS
// ============================================================

interface TacticalMapProps {
  frameData: FrameData | null;
  shotEvents?: { court_x: number; court_y: number; made: boolean }[];
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
  team0Color: string;
  team1Color: string;
  simMode: boolean;
  simulationState: SimulationState;
  onPlayerDrag: (playerId: string, x: number, y: number) => void;
  onPlayerDragEnd: (playerId: string) => void;
  defenseTeamId?: 0 | 1;
}

export const TacticalMapEnhanced: React.FC<TacticalMapProps> = ({
  frameData,
  shotEvents = [],
  showHeatmap,
  onToggleHeatmap,
  team0Color,
  team1Color,
  simMode,
  simulationState,
  onPlayerDrag,
  onPlayerDragEnd,
  defenseTeamId = 1,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);

  // Get players with simulation overrides
  const getPlayerPosition = useCallback((player: PlayerFrame): { x: number; y: number } => {
    if (simMode && simulationState.modifiedPositions.has(player.player_id)) {
      return simulationState.modifiedPositions.get(player.player_id)!;
    }
    return { x: player.court_x, y: player.court_y };
  }, [simMode, simulationState.modifiedPositions]);

  // Handle drag
  const handleDrag = useCallback((e: React.MouseEvent | React.TouchEvent, playerId: string) => {
    if (!simMode || !svgRef.current) return;

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    // Convert to SVG coordinates (0-100)
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    onPlayerDrag(playerId, Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
  }, [simMode, onPlayerDrag]);

  // Get defenders and attackers
  const defenders = frameData ? getDefenders(frameData, defenseTeamId) : [];
  const attackers = frameData ? getAttackers(frameData, defenseTeamId === 1 ? 0 : 1) : [];

  // Calculate formation polygon for packed paint
  const defensePolygon = useMemo(() => {
    if (!frameData?.tactical?.defense_type || frameData.tactical.defense_type !== 'packed_paint') {
      return null;
    }

    const defenderPositions = defenders.map(d => getPlayerPosition(d));
    if (defenderPositions.length < 3) return null;

    // Sort by angle from centroid for convex hull approximation
    const centroid = calculateCentroid(defenderPositions.map(p => ({ court_x: p.x, court_y: p.y })));
    const sorted = [...defenderPositions].sort((a, b) => {
      const angleA = Math.atan2(a.y - centroid.y, a.x - centroid.x);
      const angleB = Math.atan2(b.y - centroid.y, b.x - centroid.x);
      return angleA - angleB;
    });

    return sorted.map(p => `${p.x},${p.y}`).join(' ');
  }, [frameData, defenders, getPlayerPosition]);

  // Get connection lines between synchronized defenders
  const connectionLines = useMemo(() => {
    if (!frameData?.tactical?.defender_connections) return [];

    return frameData.tactical.defender_connections.map(([id1, id2]) => {
      const p1 = defenders.find(d => d.player_id === id1);
      const p2 = defenders.find(d => d.player_id === id2);
      if (!p1 || !p2) return null;

      const pos1 = getPlayerPosition(p1);
      const pos2 = getPlayerPosition(p2);
      return { id: `${id1}-${id2}`, x1: pos1.x, y1: pos1.y, x2: pos2.x, y2: pos2.y };
    }).filter(Boolean);
  }, [frameData, defenders, getPlayerPosition]);

  return (
    <div className="bg-black/30 border border-white/10 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div>
          <div className="label text-white/40">TACTICAL VIEW</div>
          <div className="font-display text-lg font-bold uppercase flex items-center gap-2">
            {simMode ? (
              <>
                <Move className="w-4 h-4 text-orange-500" />
                <span className="text-orange-500">SIM MODE</span>
              </>
            ) : (
              'Court Map'
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Defense Type Badge */}
          {frameData?.tactical?.defense_type && (
            <div className="px-2 py-1 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-mono uppercase">
              {frameData.tactical.defense_type.replace('_', ' ')}
            </div>
          )}
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
          ref={svgRef}
          viewBox="0 0 100 100" 
          className="w-full h-full"
          style={{ maxHeight: '400px' }}
        >
          {/* Court Background */}
          <rect x="0" y="0" width="100" height="100" fill="#0a0a0a" />
          
          {/* Court Lines */}
          <rect x="5" y="5" width="90" height="90" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" />
          
          {/* Center Circle */}
          <circle cx="50" cy="50" r="10" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" />
          <circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.15)" />
          
          {/* Half Court Line */}
          <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" />
          
          {/* Three Point Lines */}
          <path d="M 5 20 Q 30 15, 30 50 Q 30 85, 5 80" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" />
          <path d="M 95 20 Q 70 15, 70 50 Q 70 85, 95 80" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" />
          
          {/* Paint Areas */}
          <rect x="5" y="35" width="15" height="30" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" />
          <rect x="80" y="35" width="15" height="30" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" />
          
          {/* Free Throw Circles */}
          <circle cx="20" cy="50" r="6" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" strokeDasharray="2 2" />
          <circle cx="80" cy="50" r="6" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" strokeDasharray="2 2" />
          
          {/* Hoops */}
          <circle cx="8" cy="50" r="2" fill="none" stroke="rgba(249,115,22,0.5)" strokeWidth="0.5" />
          <circle cx="92" cy="50" r="2" fill="none" stroke="rgba(249,115,22,0.5)" strokeWidth="0.5" />
          
          {/* Heatmap Overlay */}
          {showHeatmap && (
            <g opacity="0.35">
              <defs>
                <radialGradient id="heatGradientEnhanced">
                  <stop offset="0%" stopColor="rgba(249,115,22,0.9)" />
                  <stop offset="50%" stopColor="rgba(249,115,22,0.4)" />
                  <stop offset="100%" stopColor="rgba(249,115,22,0)" />
                </radialGradient>
              </defs>
              <ellipse cx="12" cy="50" rx="10" ry="15" fill="url(#heatGradientEnhanced)" />
              <ellipse cx="88" cy="50" rx="10" ry="15" fill="url(#heatGradientEnhanced)" />
            </g>
          )}

          {/* ============================================ */}
          {/* FORMATION VISUALIZATION (Packed Paint) */}
          {/* ============================================ */}
          {defensePolygon && (
            <polygon
              points={defensePolygon}
              fill="rgba(239, 68, 68, 0.15)"
              stroke="rgba(239, 68, 68, 0.5)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
            />
          )}

          {/* ============================================ */}
          {/* CONNECTION LINES (Synchronized Defenders) */}
          {/* ============================================ */}
          {connectionLines.map((line: any) => line && (
            <line
              key={line.id}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="rgba(59, 130, 246, 0.5)"
              strokeWidth="0.5"
              strokeDasharray="1.5 1.5"
            />
          ))}

          {/* ============================================ */}
          {/* GHOST PATHS (Simulation Mode) */}
          {/* ============================================ */}
          {simMode && simulationState.ghostPaths.map((reaction) => {
            const defender = defenders.find(d => d.player_id === reaction.defender_id);
            if (!defender) return null;
            const currentPos = getPlayerPosition(defender);
            
            return (
              <g key={`ghost-${reaction.defender_id}`}>
                {/* Path line */}
                <line
                  x1={currentPos.x}
                  y1={currentPos.y}
                  x2={reaction.target_x}
                  y2={reaction.target_y}
                  stroke="rgba(239, 68, 68, 0.6)"
                  strokeWidth="0.8"
                  strokeDasharray="2 1"
                  markerEnd="url(#arrowhead)"
                />
                {/* Ghost position */}
                <circle
                  cx={reaction.target_x}
                  cy={reaction.target_y}
                  r="3"
                  fill="rgba(239, 68, 68, 0.3)"
                  stroke="rgba(239, 68, 68, 0.6)"
                  strokeWidth="0.5"
                  strokeDasharray="1 1"
                />
                {/* Reaction label */}
                <text
                  x={reaction.target_x}
                  y={reaction.target_y - 5}
                  textAnchor="middle"
                  fontSize="2"
                  fill="rgba(239, 68, 68, 0.8)"
                  fontWeight="bold"
                >
                  {reaction.reaction_type.toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* Arrow marker definitions */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="4"
              markerHeight="4"
              refX="3"
              refY="2"
              orient="auto"
            >
              <polygon points="0 0, 4 2, 0 4" fill="rgba(239, 68, 68, 0.6)" />
            </marker>
            <marker
              id="arrowhead-blue"
              markerWidth="3"
              markerHeight="3"
              refX="2"
              refY="1.5"
              orient="auto"
            >
              <polygon points="0 0, 3 1.5, 0 3" fill="rgba(59, 130, 246, 0.8)" />
            </marker>
          </defs>

          {/* Shot Events */}
          {shotEvents.map((shot, idx) => (
            <circle 
              key={`shot-${idx}`}
              cx={shot.court_x} 
              cy={shot.court_y} 
              r="1.2"
              fill={shot.made ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}
              stroke={shot.made ? '#22c55e' : '#ef4444'}
              strokeWidth="0.3"
            />
          ))}
          
          {/* ============================================ */}
          {/* PLAYERS WITH ACTION VISUALIZATION */}
          {/* ============================================ */}
          {frameData?.players.map((player) => {
            const pos = getPlayerPosition(player);
            const isDefender = player.team_id === defenseTeamId;
            const color = player.team_id === 0 ? team0Color : team1Color;
            const isDragging = simulationState.draggedPlayer === player.player_id;
            const canDrag = simMode && !isDefender; // Only attackers can be dragged
            
            // Action-specific styling
            const action = (player as any).action || 'stationary';
            const hasBall = (player as any).has_ball || false;
            const actionTarget = (player as any).action_target;
            
            // Action colors
            const getActionRing = () => {
              if (hasBall) return { color: '#f97316', pulse: true }; // Orange for ball handler
              if (action === 'screening') return { color: '#22c55e', pulse: true }; // Green for screener
              if (action === 'cutting') return { color: '#3b82f6', pulse: true }; // Blue for cutter
              if (action === 'sprinting') return { color: '#eab308', pulse: false }; // Yellow for sprint
              if (action === 'defending') return { color: '#ef4444', pulse: false }; // Red for defense
              return null;
            };
            
            const actionRing = getActionRing();

            return (
              <g 
                key={player.player_id}
                style={{ cursor: canDrag ? 'grab' : 'default' }}
                onMouseDown={(e) => canDrag && handleDrag(e, player.player_id)}
                onMouseMove={(e) => isDragging && handleDrag(e, player.player_id)}
                onMouseUp={() => isDragging && onPlayerDragEnd(player.player_id)}
                onMouseLeave={() => isDragging && onPlayerDragEnd(player.player_id)}
                onMouseEnter={() => setHoveredPlayer(player.player_id)}
              >
                {/* Action ring - shows what player is doing */}
                {actionRing && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="5"
                    fill="none"
                    stroke={actionRing.color}
                    strokeWidth="0.5"
                    opacity={actionRing.pulse ? 0.8 : 0.5}
                    strokeDasharray={action === 'screening' ? '1.5 0.5' : 'none'}
                  >
                    {actionRing.pulse && (
                      <animate
                        attributeName="r"
                        values="5;6;5"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    )}
                  </circle>
                )}
                
                {/* Screen action line to target */}
                {action === 'screening' && actionTarget && (
                  (() => {
                    const target = frameData?.players.find(p => p.player_id === actionTarget);
                    if (!target) return null;
                    const targetPos = getPlayerPosition(target);
                    return (
                      <line
                        x1={pos.x}
                        y1={pos.y}
                        x2={targetPos.x}
                        y2={targetPos.y}
                        stroke="#22c55e"
                        strokeWidth="0.5"
                        strokeDasharray="1 1"
                        opacity="0.7"
                      />
                    );
                  })()
                )}
                
                {/* Cut direction arrow */}
                {action === 'cutting' && (
                  <path
                    d={`M ${pos.x} ${pos.y} L ${pos.x} ${pos.y + 6}`}
                    stroke="#3b82f6"
                    strokeWidth="0.8"
                    fill="none"
                    markerEnd="url(#arrowhead-blue)"
                    opacity="0.8"
                  />
                )}
                
                {/* Hover ring */}
                {(hoveredPlayer === player.player_id || isDragging) && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="5"
                    fill="none"
                    stroke={color}
                    strokeWidth="0.3"
                    opacity="0.5"
                  />
                )}
                
                {/* Ball possession indicator */}
                {hasBall && (
                  <circle
                    cx={pos.x + 3}
                    cy={pos.y - 3}
                    r="1.5"
                    fill="#f97316"
                    stroke="#000"
                    strokeWidth="0.3"
                  />
                )}
                
                {/* Player dot */}
                <circle 
                  cx={pos.x} 
                  cy={pos.y} 
                  r={isDragging ? "4" : hasBall ? "3.5" : "3"}
                  fill={color}
                  stroke={hasBall ? '#f97316' : '#000'}
                  strokeWidth={hasBall ? '1' : '0.5'}
                  opacity={isDragging ? 1 : 0.9}
                  style={{
                    filter: `drop-shadow(0 0 ${isDragging ? '8px' : hasBall ? '6px' : '4px'} ${hasBall ? '#f97316' : color})`,
                    transition: isDragging ? 'none' : 'all 75ms ease-out'
                  }}
                />
                
                {/* Player label */}
                <text 
                  x={pos.x} 
                  y={pos.y + 1}
                  textAnchor="middle"
                  fontSize="2"
                  fill="#000"
                  fontWeight="bold"
                >
                  {player.jersey_number || player.player_id.slice(-2)}
                </text>
                
                {/* Action label - shows what player is doing */}
                {action && action !== 'stationary' && action !== 'walking' && (
                  <text
                    x={pos.x}
                    y={pos.y - 6}
                    textAnchor="middle"
                    fontSize="1.8"
                    fill={
                      hasBall ? '#f97316' :
                      action === 'screening' ? '#22c55e' :
                      action === 'cutting' ? '#3b82f6' :
                      action === 'dribbling' ? '#f97316' :
                      action === 'defending' ? '#ef4444' :
                      action === 'sprinting' ? '#eab308' :
                      'rgba(255,255,255,0.7)'
                    }
                    fontWeight="bold"
                    style={{ textTransform: 'uppercase' }}
                  >
                    {action === 'dribbling' ? 'DRIVE' :
                     action === 'screening' ? 'SCREEN' :
                     action === 'cutting' ? 'CUT' :
                     action === 'defending' ? 'DEF' :
                     action === 'sprinting' ? 'SPRINT' :
                     action === 'running' ? 'RUN' :
                     action}
                  </text>
                )}

                {/* Defense indicator */}
                {isDefender && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="4.5"
                    fill="none"
                    stroke="rgba(239, 68, 68, 0.4)"
                    strokeWidth="0.3"
                  />
                )}
              </g>
            );
          })}

          {/* Ball */}
          {frameData?.ball && (
            <g>
              <circle
                cx={frameData.ball.court_x}
                cy={frameData.ball.court_y}
                r="2"
                fill="#f97316"
                stroke="#fff"
                strokeWidth="0.5"
                style={{ filter: 'drop-shadow(0 0 6px #f97316)' }}
              />
            </g>
          )}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-2 left-2 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: team0Color }} />
            <span className="text-white/40">Offense</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: team1Color }} />
            <span className="text-white/40">Defense</span>
          </div>
          {defensePolygon && (
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 bg-red-500/30 border border-red-500/50" />
              <span className="text-white/40">Paint Wall</span>
            </div>
          )}
        </div>
      </div>

      {/* Current Play & Narration */}
      {((frameData as any)?.current_play || (frameData as any)?.narration) && (
        <div className="px-4 py-2 bg-black/50 border-t border-white/10">
          {(frameData as any)?.current_play && (
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3 h-3 text-orange-500" />
              <span className="text-xs font-bold text-orange-500 uppercase">
                {(frameData as any).current_play.replace(/_/g, ' ')}
              </span>
            </div>
          )}
          {(frameData as any)?.narration && (
            <p className="text-xs text-white/60 leading-relaxed">
              {(frameData as any).narration}
            </p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="p-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/30">
        <span>FRAME: {frameData?.frame_number || '--'}</span>
        <span>
          {(frameData as any)?.ball_possessor ? (
            <span className="text-orange-400">BALL: {(frameData as any).ball_possessor}</span>
          ) : (
            'NO POSSESSION'
          )}
        </span>
        {frameData?.tactical?.offensive_spacing_score !== undefined && (
          <span>SPACING: {frameData.tactical.offensive_spacing_score}%</span>
        )}
      </div>
    </div>
  );
};

// ============================================================
// EVENT TIMELINE SIDEBAR
// ============================================================

interface EventTimelineProps {
  events: TacticalEvent[];
  currentTime: number;
  onSeekToEvent: (timestamp: number) => void;
  filterTypes?: TacticalEventType[];
  onFilterChange: (types: TacticalEventType[]) => void;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({
  events,
  currentTime,
  onSeekToEvent,
  filterTypes = [],
  onFilterChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const allEventTypes: TacticalEventType[] = [
    'screen_set', 'fast_break', 'isolation', 'pick_and_roll', 
    'post_up', 'transition', 'defensive_breakdown'
  ];

  const filteredEvents = useMemo(() => {
    let result = filterTypes.length > 0 
      ? filterTacticalEvents(events, filterTypes)
      : events;

    if (searchQuery) {
      result = result.filter(e => 
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getTacticalEventLabel(e.event_type).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result.sort((a, b) => a.timestamp - b.timestamp);
  }, [events, filterTypes, searchQuery]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFilter = (type: TacticalEventType) => {
    if (filterTypes.includes(type)) {
      onFilterChange(filterTypes.filter(t => t !== type));
    } else {
      onFilterChange([...filterTypes, type]);
    }
  };

  return (
    <div className="bg-black/30 border border-white/10 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="label text-orange-500">DETECTED EVENTS</div>
            <div className="font-display text-lg font-bold uppercase">Timeline</div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 border transition-colors ${
              showFilters || filterTypes.length > 0
                ? 'border-orange-500 text-orange-500 bg-orange-500/10'
                : 'border-white/20 text-white/40 hover:border-white/40'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events..."
            className="w-full bg-white/5 border border-white/10 pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors placeholder:text-white/30"
          />
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/10">
                {allEventTypes.map(type => {
                  const style = getTacticalEventStyle(type);
                  const isActive = filterTypes.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => toggleFilter(type)}
                      className={`px-2 py-1 text-xs font-mono uppercase transition-colors ${
                        isActive
                          ? 'bg-opacity-20 border'
                          : 'bg-white/5 border border-transparent hover:border-white/20'
                      }`}
                      style={{
                        backgroundColor: isActive ? `${style.color}20` : undefined,
                        borderColor: isActive ? `${style.color}50` : undefined,
                        color: isActive ? style.color : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {style.icon} {getTacticalEventLabel(type).split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Event List */}
      <div className="flex-1 overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No events detected</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredEvents.map((event) => {
              const style = getTacticalEventStyle(event.event_type);
              const isNear = Math.abs(event.timestamp - currentTime) < 2;

              return (
                <motion.button
                  key={event.event_id}
                  onClick={() => onSeekToEvent(event.timestamp)}
                  className={`w-full p-4 text-left transition-colors hover:bg-white/5 ${
                    isNear ? 'bg-orange-500/10 border-l-2 border-orange-500' : ''
                  }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className="w-8 h-8 flex items-center justify-center text-lg flex-shrink-0 rounded"
                      style={{ backgroundColor: `${style.color}20` }}
                    >
                      {style.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-xs font-mono uppercase font-bold"
                          style={{ color: style.color }}
                        >
                          {getTacticalEventLabel(event.event_type)}
                        </span>
                        {event.success !== undefined && (
                          <span className={`text-xs ${event.success ? 'text-green-500' : 'text-red-500'}`}>
                            {event.success ? '✓' : '✗'}
                          </span>
                        )}
                      </div>
                      <p className="text-white/70 text-sm line-clamp-2">{event.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                        <span className="font-mono">{formatTime(event.timestamp)}</span>
                        {event.involved_players.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {event.involved_players.length}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="p-3 border-t border-white/10 flex items-center justify-between text-xs">
        <span className="text-white/40">{filteredEvents.length} events</span>
        <div className="flex items-center gap-3">
          {['screen_set', 'fast_break'].map(type => {
            const count = events.filter(e => e.event_type === type).length;
            const style = getTacticalEventStyle(type as TacticalEventType);
            return (
              <span key={type} className="flex items-center gap-1" style={{ color: style.color }}>
                {style.icon} {count}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// PLAY LAB CONTAINER (Main Component)
// ============================================================

interface PlayLabProps {
  analysisData: JobResults | null;
  currentFrameData: FrameData | null;
  currentTime: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  onPause: () => void;
  onPlay: () => void;
  team0Color?: string;
  team1Color?: string;
}

export const PlayLab: React.FC<PlayLabProps> = ({
  analysisData,
  currentFrameData,
  currentTime,
  isPlaying,
  onSeek,
  onPause,
  onPlay,
  team0Color = '#FFFFFF',
  team1Color = '#CCFF00',
}) => {
  // Mode state
  const [mode, setMode] = useState<'view' | 'sim'>('view');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [eventFilterTypes, setEventFilterTypes] = useState<TacticalEventType[]>([]);

  // Simulation state
  const [simulationState, setSimulationState] = useState<SimulationState>({
    isActive: false,
    draggedPlayer: null,
    originalPositions: new Map(),
    modifiedPositions: new Map(),
    ghostPaths: [],
  });

  // Enter sim mode
  const enterSimMode = useCallback(() => {
    if (isPlaying) onPause();
    
    // Store original positions
    const originalPositions = new Map<string, { x: number; y: number }>();
    currentFrameData?.players.forEach(p => {
      originalPositions.set(p.player_id, { x: p.court_x, y: p.court_y });
    });

    setSimulationState({
      isActive: true,
      draggedPlayer: null,
      originalPositions,
      modifiedPositions: new Map(),
      ghostPaths: [],
    });
    setMode('sim');
  }, [isPlaying, onPause, currentFrameData]);

  // Exit sim mode
  const exitSimMode = useCallback(() => {
    setSimulationState({
      isActive: false,
      draggedPlayer: null,
      originalPositions: new Map(),
      modifiedPositions: new Map(),
      ghostPaths: [],
    });
    setMode('view');
  }, []);

  // Reset sim positions
  const resetSimulation = useCallback(() => {
    setSimulationState(prev => ({
      ...prev,
      modifiedPositions: new Map(),
      ghostPaths: [],
    }));
  }, []);

  // Handle player drag
  const handlePlayerDrag = useCallback((playerId: string, x: number, y: number) => {
    setSimulationState(prev => {
      const newModified = new Map(prev.modifiedPositions);
      newModified.set(playerId, { x, y });

      // Generate ghost paths based on defender reactions
      // In real implementation, this would come from backend predictions
      const ghostPaths: DefenderReaction[] = [];
      
      // Simple heuristic: if attacker moves toward paint, defenders collapse
      if (x > 40 && x < 60 && y > 35 && y < 65) {
        currentFrameData?.players
          .filter(p => p.team_id === 1) // Defenders
          .forEach(defender => {
            ghostPaths.push({
              defender_id: defender.player_id,
              reaction_type: 'collapse',
              target_x: 50 + (Math.random() - 0.5) * 10,
              target_y: 50 + (Math.random() - 0.5) * 10,
              confidence: 0.8,
            });
          });
      }

      return {
        ...prev,
        draggedPlayer: playerId,
        modifiedPositions: newModified,
        ghostPaths,
      };
    });
  }, [currentFrameData]);

  // Handle drag end
  const handlePlayerDragEnd = useCallback((playerId: string) => {
    setSimulationState(prev => ({
      ...prev,
      draggedPlayer: null,
    }));
  }, []);

  // Get shot events for current frame context
  const recentShots = useMemo(() => {
    if (!analysisData) return [];
    return analysisData.shot_events
      .filter(s => Math.abs(s.timestamp - currentTime) < 30)
      .map(s => ({ court_x: s.court_x, court_y: s.court_y, made: s.made }));
  }, [analysisData, currentTime]);

  // Get tactical events
  const tacticalEvents = analysisData?.tactical_events || [];

  return (
    <div className="bg-black/30 border border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <div className="label text-orange-500 mb-1">PHASE 03</div>
            <div className="font-display text-xl font-bold uppercase">Play Lab</div>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex bg-white/5 border border-white/10 p-1">
              <button
                onClick={() => mode === 'sim' ? exitSimMode() : setMode('view')}
                className={`px-4 py-2 text-sm font-display uppercase transition-colors ${
                  mode === 'view' 
                    ? 'bg-white text-black' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-2" />
                View
              </button>
              <button
                onClick={enterSimMode}
                className={`px-4 py-2 text-sm font-display uppercase transition-colors ${
                  mode === 'sim' 
                    ? 'bg-orange-500 text-black' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Move className="w-4 h-4 inline mr-2" />
                Sim
              </button>
            </div>

            {mode === 'sim' && (
              <button
                onClick={resetSimulation}
                className="p-2 border border-white/20 text-white/60 hover:border-white/40 transition-colors"
                title="Reset Simulation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Sim Mode Instructions */}
        <AnimatePresence>
          {mode === 'sim' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 text-sm">
                <div className="flex items-center gap-2 text-orange-500 font-bold mb-1">
                  <Activity className="w-4 h-4" />
                  SIMULATION ACTIVE
                </div>
                <p className="text-white/60">
                  Drag offensive players to simulate movement. Defenders will show predicted reactions.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content - Split View */}
      <div className="grid lg:grid-cols-3 gap-0">
        {/* Tactical Map (2/3 width) */}
        <div className="lg:col-span-2 min-h-[400px]">
          <TacticalMapEnhanced
            frameData={currentFrameData}
            shotEvents={recentShots}
            showHeatmap={showHeatmap}
            onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
            team0Color={team0Color}
            team1Color={team1Color}
            simMode={mode === 'sim'}
            simulationState={simulationState}
            onPlayerDrag={handlePlayerDrag}
            onPlayerDragEnd={handlePlayerDragEnd}
          />
        </div>

        {/* Event Timeline (1/3 width) */}
        <div className="lg:col-span-1 min-h-[400px] border-l border-white/10">
          <EventTimeline
            events={tacticalEvents}
            currentTime={currentTime}
            onSeekToEvent={onSeek}
            filterTypes={eventFilterTypes}
            onFilterChange={setEventFilterTypes}
          />
        </div>
      </div>
    </div>
  );
};

export default PlayLab;

