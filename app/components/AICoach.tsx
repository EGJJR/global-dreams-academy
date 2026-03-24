'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  Target,
  Users,
  Zap,
  TrendingUp,
  Play,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  data?: any;
  confidence?: number;
}

interface AICoachProps {
  jobId: string | null;
  currentFrame?: number;
  onSimulate?: (playType: string) => void;
  className?: string;
}

// ============================================================
// QUICK ACTIONS
// ============================================================

const quickActions = [
  { label: 'What plays?', question: 'What plays were run?', icon: Target },
  { label: 'MVP', question: 'Who is the most active player?', icon: TrendingUp },
  { label: 'Now?', question: "What's happening now?", icon: Zap },
  { label: 'Simulate', question: 'Simulate a pick and roll', icon: Play },
];

// ============================================================
// AI COACH COMPONENT
// ============================================================

export const AICoach: React.FC<AICoachProps> = ({
  jobId,
  currentFrame,
  onSimulate,
  className = '',
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Welcome message
  useEffect(() => {
    if (jobId && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          type: 'ai',
          content: `🏀 AI Coach ready! Ask me anything about this game. Try "What plays were run?" or "Who's the MVP?"`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [jobId, messages.length]);

  const sendMessage = useCallback(async (question: string) => {
    if (!jobId || !question.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: question,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Check if it's a simulation request
      const isSimulation = question.toLowerCase().includes('simulate');
      
      let response;
      if (isSimulation) {
        // Extract play type
        const playTypes = ['pick_and_roll', 'isolation', 'fast_break', 'post_up'];
        let playType = 'pick_and_roll';
        for (const pt of playTypes) {
          if (question.toLowerCase().includes(pt.replace('_', ' '))) {
            playType = pt;
            break;
          }
        }
        
        response = await fetch(`http://localhost:8000/api/v1/ai/simulate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            job_id: jobId,
            play_type: playType,
            frame_number: currentFrame || 0,
          }),
        });
      } else {
        response = await fetch(`http://localhost:8000/api/v1/ai/ask`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            job_id: jobId,
            question: question,
            frame_number: currentFrame,
          }),
        });
      }

      const data = await response.json();
      
      // Format the response
      let aiContent: string;
      if (isSimulation) {
        const successPct = Math.round((data.success_probability || 0) * 100);
        const movements = data.suggested_movements?.join('\n• ') || 'No suggestions';
        const defense = data.defensive_adjustments?.join('\n• ') || 'No adjustments';
        aiContent = `📊 **${data.play_type?.replace('_', ' ').toUpperCase()}** Simulation\n\n` +
          `Success Probability: **${successPct}%**\n\n` +
          `**Suggested Movements:**\n• ${movements}\n\n` +
          `**Defensive Adjustments:**\n• ${defense}`;
      } else {
        aiContent = data.answer || 'I couldn\'t analyze that. Try a different question.';
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: aiContent,
        timestamp: new Date(),
        data: data.data || data,
        confidence: data.confidence,
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'ai',
        content: '❌ Failed to get response. Make sure the backend is running.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [jobId, currentFrame]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickAction = (question: string) => {
    sendMessage(question);
  };

  const clearChat = () => {
    setMessages([]);
  };

  if (!jobId) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-black/40 backdrop-blur-sm border border-white/10 flex flex-col ${className}`}
      style={{ maxHeight: isExpanded ? '500px' : '48px' }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 border-b border-white/10 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-orange-500" />
          <span className="font-display font-bold text-sm uppercase tracking-wider">AI Coach</span>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-orange-500" />}
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); clearChat(); }}
              className="p-1 text-white/40 hover:text-white/60 transition-colors"
              title="Clear chat"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-white/40" />
          ) : (
            <ChevronUp className="w-4 h-4 text-white/40" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col flex-1 overflow-hidden"
          >
            {/* Quick Actions */}
            <div className="p-2 border-b border-white/5 flex gap-1 flex-wrap">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.question)}
                  disabled={isLoading}
                  className="px-2 py-1 bg-white/5 hover:bg-orange-500/20 border border-white/10 
                           hover:border-orange-500/30 text-xs font-mono text-white/60 
                           hover:text-orange-400 transition-all flex items-center gap-1
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <action.icon className="w-3 h-3" />
                  {action.label}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px] max-h-[300px]">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'ai' && (
                    <div className="w-6 h-6 rounded bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3 h-3 text-orange-500" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-2 rounded text-sm ${
                      message.type === 'user'
                        ? 'bg-orange-500/20 text-white'
                        : 'bg-white/5 text-white/80'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    {message.confidence !== undefined && (
                      <div className="mt-1 text-xs text-white/40">
                        Confidence: {Math.round(message.confidence * 100)}%
                      </div>
                    )}
                  </div>
                  {message.type === 'user' && (
                    <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3 text-white/60" />
                    </div>
                  )}
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2 items-center"
                >
                  <div className="w-6 h-6 rounded bg-orange-500/20 flex items-center justify-center">
                    <Loader2 className="w-3 h-3 text-orange-500 animate-spin" />
                  </div>
                  <div className="text-sm text-white/40">Analyzing...</div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-2 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about plays, players, tactics..."
                  disabled={isLoading}
                  className="flex-1 bg-black/30 border border-white/10 px-3 py-2 text-sm
                           text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50
                           disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-3 py-2 bg-orange-500/20 border border-orange-500/30 
                           text-orange-400 hover:bg-orange-500/30 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AICoach;

