import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CARDS, MATCH_MAP, checkMatch } from '../constants';
import { CardData, GameState, Player } from '../types';
import { Card } from './Card';
import { ScoreBoard } from './ScoreBoard';
import { Controls } from './Controls';
import { ExplanationModal } from './ExplanationModal';
import { audioService } from '../services/audioService';

interface GameProps {
  playerCount: number;
  onExit: () => void;
}

const TARGET_SCORE = 5;
const BASE_ROUND_TIME = 5.0; // Base seconds for a round (at 1x speed)

// -- CIRCULAR TIMER COMPONENT --
interface CircularTimerProps {
  progress: number; // 1.0 (full) to 0.0 (empty)
}

const CircularTimer: React.FC<CircularTimerProps> = ({ progress }) => {
  const getColor = (p: number) => {
    if (p > 0.75) return '#10B981'; // Green
    if (p > 0.50) return '#FBBF24'; // Yellow
    if (p > 0.25) return '#F97316'; // Orange
    if (p > 0.10) return '#EF4444'; // Red
    return '#991B1B'; // Dark Red
  };

  const circumference = 157.08; // 2 * pi * 25
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const strokeDashoffset = circumference * (1 - clampedProgress);
  const color = getColor(clampedProgress);

  return (
    <div className="relative w-20 h-20 sm:w-24 sm:h-24 drop-shadow-lg flex items-center justify-center select-none">
      <svg 
        className="w-full h-full" 
        viewBox="0 0 100 100"
        style={{ transform: 'rotate(-90deg) scaleX(-1)', transformOrigin: 'center' }} 
      >
        {/* Subtle background track */}
        <circle
          cx="50"
          cy="50"
          r="25"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="50"
        />
        {/* Active progress pie */}
        <circle
          cx="50"
          cy="50"
          r="25"
          fill="none"
          stroke={color}
          strokeWidth="50"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke 0.2s ease, stroke-dashoffset 0.05s linear'
          }}
        />
      </svg>
    </div>
  );
};

export const Game: React.FC<GameProps> = ({ playerCount, onExit }) => {
  // Setup Players
  const [players, setPlayers] = useState<Player[]>([]);
  
  // Game State
  const [state, setState] = useState<GameState>(GameState.PRE_ROUND);
  const [currentCards, setCurrentCards] = useState<[CardData, CardData] | null>(null);
  const [gameTimeLeft, setGameTimeLeft] = useState<number>(BASE_ROUND_TIME);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'fail' | 'timeout' | 'match', text: string, winnerId?: number } | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);

  // Error explanation modal state (only appears on wrong snap or missed match)
  const [errorExplanation, setErrorExplanation] = useState<{
    card1: CardData;
    card2: CardData;
    isMatch: boolean;
  } | null>(null);

  // Tortoise / Slow Mode state - persisted across games in localStorage
  const [isSlowMode, setIsSlowMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('spectra_snap_slow_mode') === 'true';
    } catch {
      return false;
    }
  });

  const isSlowModeRef = useRef(isSlowMode);
  useEffect(() => {
    isSlowModeRef.current = isSlowMode;
    try {
      localStorage.setItem('spectra_snap_slow_mode', String(isSlowMode));
    } catch {
      // ignore local storage restrictions
    }
  }, [isSlowMode]);

  const lastTickRef = useRef<number>(performance.now());

  // Initialize Players on Mount
  useEffect(() => {
    const newPlayers: Player[] = [
      { id: 1, name: 'P1', score: 0, key: 'a', color: 'bg-indigo-600', position: 'left' }
    ];
    
    if (playerCount === 1) {
      // 1 Player vs CPU
      newPlayers.push({ id: 2, name: 'CPU', score: 0, key: '', color: 'bg-gray-600', position: 'right' });
    } else {
      newPlayers.push({ id: 2, name: 'P2', score: 0, key: 'l', color: 'bg-orange-500', position: 'right' });
      if (playerCount === 3) {
        newPlayers.push({ id: 3, name: 'P3', score: 0, key: ' ', color: 'bg-purple-600', position: 'bottom' });
      }
    }
    setPlayers(newPlayers);
    startRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerCount]);

  // --- Core Game Loop Functions ---

  const getRandomPair = (): [CardData, CardData] => {
    // 40% chance of a match to keep it exciting
    const forceMatch = Math.random() < 0.4;
    
    let card1 = CARDS[Math.floor(Math.random() * CARDS.length)];
    let card2: CardData;

    if (forceMatch) {
        // Find matches for card1
        const matches = MATCH_MAP.get(card1.id);
        if (matches && matches.size > 0) {
            const matchId = Array.from(matches)[Math.floor(Math.random() * matches.size)];
            card2 = CARDS.find(c => c.id === matchId)!;
        } else {
            // Fallback if no match defined
            card2 = CARDS[Math.floor(Math.random() * CARDS.length)];
        }
    } else {
        card2 = CARDS[Math.floor(Math.random() * CARDS.length)];
        // Ensure not same card
        while (card2.id === card1.id) {
            card2 = CARDS[Math.floor(Math.random() * CARDS.length)];
        }
    }
    return [card1, card2];
  };

  const startRound = () => {
    setErrorExplanation(null);
    // 1. Flip cards face down immediately
    setState(GameState.PRE_ROUND);
    setFeedback({ type: 'match', text: 'READY?' });
    
    // 2. Wait for the flip animation (approx 600ms) to finish/hide the face
    // before swapping the content. This prevents "peeking".
    setTimeout(() => {
        setCurrentCards(getRandomPair());
        setGameTimeLeft(BASE_ROUND_TIME);
    }, 600);

    // 3. Wait the full duration before revealing (flipping face up)
    setTimeout(() => {
      setFeedback(null);
      lastTickRef.current = performance.now();
      setState(GameState.PLAYING);
    }, 2600); // 2000ms "Ready" time + 600ms buffer for initial flip down
  };

  const resolveRound = (triggerPlayerId: number, success: boolean) => {
    setState(GameState.RESOLUTION);

    setPlayers(prev => prev.map(p => {
        let newScore = p.score;
        if (success) {
            // triggerPlayerId won
            if (p.id === triggerPlayerId) {
                newScore += 1;
            }
        } else {
            // triggerPlayerId failed, others gain
            if (p.id !== triggerPlayerId) {
                newScore += 1;
            }
        }
        return { ...p, score: newScore };
    }));

    if (success) {
        audioService.playSuccess();
        setFeedback({ 
            type: 'success', 
            text: 'SNAP!', 
            winnerId: triggerPlayerId 
        });
    } else {
        audioService.playFail();
        setFeedback({ 
            type: 'fail', 
            text: 'OOPS!', 
            winnerId: triggerPlayerId 
        });

        // Trigger educational feedback popup on wrong snap
        if (currentCards) {
          setErrorExplanation({
            card1: currentCards[0],
            card2: currentCards[1],
            isMatch: false
          });
        }
    }
  };

  const handleSnap = useCallback((playerId: number) => {
    if (state !== GameState.PLAYING || !currentCards) return;

    const [c1, c2] = currentCards;
    const isMatch = checkMatch(c1.id, c2.id);
    
    // Logic for 1 Player (P1 vs CPU)
    if (playerCount === 1) {
        if (playerId === 1) {
            if (isMatch) {
                resolveRound(1, true); // P1 Success
            } else {
                resolveRound(1, false); // P1 Fail
            }
        }
        return;
    }

    // Logic for Multiplayer
    if (isMatch) {
        resolveRound(playerId, true); // Correct snap gets point
    } else {
        // Incorrect snap gives point to OTHER player(s)
        resolveRound(playerId, false);
    }
  }, [state, currentCards, playerCount]);

  const handleTimeout = useCallback(() => {
    if (!currentCards) return;
    const [c1, c2] = currentCards;
    const isMatch = checkMatch(c1.id, c2.id);

    setState(GameState.RESOLUTION);
    
    if (isMatch) {
        // Missed opportunity error!
        if (playerCount === 1) {
            // CPU gets point
            setPlayers(prev => prev.map(p => p.id === 2 ? { ...p, score: p.score + 1 } : p));
            setFeedback({ type: 'fail', text: 'MISSED!', winnerId: 2 });
            audioService.playFail();
        } else {
            setFeedback({ type: 'timeout', text: 'MISSED IT!' });
        }

        // Trigger educational feedback popup on missed snap
        setErrorExplanation({
          card1: c1,
          card2: c2,
          isMatch: true
        });
    } else {
        // Not a match and nobody snapped: this was correct, so no error popup
        setFeedback({ type: 'match', text: 'NEW PAIR' });
    }
  }, [currentCards, playerCount]);

  // Handle dismissal of explanation modal
  const handleDismissExplanation = () => {
    setErrorExplanation(null);
    const winnerPlayer = players.find(p => p.score >= TARGET_SCORE);
    if (winnerPlayer) {
      setWinner(winnerPlayer);
      setState(GameState.GAME_OVER);
    } else {
      startRound();
    }
  };

  // Game Loop Effect (Timer & Resolution Transition)
  useEffect(() => {
    if (state === GameState.PLAYING) {
      lastTickRef.current = performance.now();

      const intervalId = window.setInterval(() => {
        const now = performance.now();
        const deltaSeconds = (now - lastTickRef.current) / 1000;
        lastTickRef.current = now;

        // When slow mode is active, the timer runs at quarter speed (0.25x speed -> takes 4x real time)
        const speed = isSlowModeRef.current ? 0.25 : 1.0;

        setGameTimeLeft(prev => {
          const next = prev - deltaSeconds * speed;
          if (next <= 0) {
            clearInterval(intervalId);
            handleTimeout();
            return 0;
          }
          return next;
        });
      }, 40);

      return () => {
        clearInterval(intervalId);
      };
    } else if (state === GameState.RESOLUTION) {
      // If an explanation modal is active, the round waits for the user to dismiss it!
      if (!errorExplanation) {
        const winnerPlayer = players.find(p => p.score >= TARGET_SCORE);
        
        if (winnerPlayer) {
          const timeoutId = setTimeout(() => {
            setWinner(winnerPlayer);
            setState(GameState.GAME_OVER);
          }, 1500);
          return () => clearTimeout(timeoutId);
        } else {
          const timeoutId = setTimeout(startRound, 2000);
          return () => clearTimeout(timeoutId);
        }
      }
    }
  }, [state, handleTimeout, players, errorExplanation]);

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state !== GameState.PLAYING) return;
      
      const player = players.find(p => p.key === e.key.toLowerCase() || (e.key === ' ' && p.key === ' '));
      if (player) {
          handleSnap(player.id);
      } else if (playerCount === 1 && e.key === ' ') {
          // Special case for single player using spacebar
          handleSnap(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, players, handleSnap, playerCount]);

  // Tortoise toggle handler
  const toggleSlowMode = () => {
    setIsSlowMode(prev => !prev);
    audioService.playTick();
  };

  // --- Render Helpers ---

  // Determine feedback position
  const getFeedbackStyle = () => {
    if (!feedback) return {};
    if (feedback.winnerId) {
        const p = players.find(pl => pl.id === feedback.winnerId);
        if (p?.position === 'left') return { left: '10%', top: '50%' };
        if (p?.position === 'right') return { right: '10%', top: '50%' };
        if (p?.position === 'bottom') return { bottom: '20%', left: '50%', transform: 'translate(-50%, 0)' };
    }
    return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
  };

  // Game over screen: cpu wins / P1 wins etc. needs to be white
  if (state === GameState.GAME_OVER && winner) {
      return (
        <div className="fixed inset-0 bg-indigo-900 flex flex-col items-center justify-center text-white z-50">
            <h1 
              className="text-6xl sm:text-8xl font-black mb-8 animate-[slideInRight_1s_ease-out] font-bangers text-white text-center px-4 drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] tracking-wide"
              style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
            >
                {winner.name} WINS!
            </h1>
            <button 
                onClick={onExit}
                className="mt-8 px-8 py-3 bg-white text-indigo-900 rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-xl cursor-pointer"
            >
                Back to Menu
            </button>
        </div>
      );
  }

  const timerProgress = gameTimeLeft / BASE_ROUND_TIME;

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 relative overflow-hidden select-none">
      {/* Scoreboard */}
      <ScoreBoard players={players} targetScore={TARGET_SCORE} />

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        
        {/* Feedback Overlay */}
        {feedback && (
           <div 
             className={`absolute z-30 pointer-events-none flex flex-col items-center
                ${feedback.winnerId ? 'transition-all duration-500' : ''}
             `}
             style={getFeedbackStyle()}
           >
              {feedback.type === 'success' && <div className="text-6xl animate-[pop_0.3s_ease-in-out]">😊</div>}
              {feedback.type === 'fail' && <div className="text-6xl animate-[pop_0.3s_ease-in-out]">☹️</div>}
              <h2 className="text-4xl sm:text-6xl font-bangers text-indigo-800 drop-shadow-md bg-white/95 px-6 py-4 rounded-xl mt-4 border-4 border-indigo-100 shadow-xl">
                  {feedback.text}
              </h2>
           </div>
        )}

        {/* Cards container: In 1 player mode, clicking the cards also registers as a snap */}
        {currentCards && (
            <div 
              className="flex gap-4 sm:gap-10 lg:gap-20 items-center justify-center relative"
              onClick={() => {
                if (playerCount === 1 && state === GameState.PLAYING) {
                  handleSnap(1);
                }
              }}
            >
                <Card 
                  data={currentCards[0]} 
                  isFlipped={state !== GameState.PRE_ROUND} 
                  highlight={state === GameState.RESOLUTION && checkMatch(currentCards[0].id, currentCards[1].id) ? 'success' : null}
                  onClick={() => {
                    if (playerCount === 1 && state === GameState.PLAYING) {
                      handleSnap(1);
                    }
                  }}
                  isInteractive={playerCount === 1 && state === GameState.PLAYING}
                />
                
                {/* Visual Separator: VS text is black */}
                <div className="hidden sm:flex flex-col items-center justify-center">
                    <div 
                      className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center font-black font-bangers text-2xl shadow-lg z-10 border-4 border-yellow-300 select-none"
                      style={{ color: '#000000', WebkitTextFillColor: '#000000' }}
                    >
                        VS
                    </div>
                </div>

                <Card 
                  data={currentCards[1]} 
                  isFlipped={state !== GameState.PRE_ROUND} 
                  highlight={state === GameState.RESOLUTION && checkMatch(currentCards[0].id, currentCards[1].id) ? 'success' : null}
                  onClick={() => {
                    if (playerCount === 1 && state === GameState.PLAYING) {
                      handleSnap(1);
                    }
                  }}
                  isInteractive={playerCount === 1 && state === GameState.PLAYING}
                />
            </div>
        )}
      </div>

      {/* Countdown and Tortoise Button Area */}
      <div 
        className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30 pointer-events-auto ${
          players.length > 2 ? 'bottom-36 sm:bottom-32' : 'bottom-28 sm:bottom-20'
        }`}
      >
         {/* Circular Countdown - only rendered while playing, no extra dashed circle */}
         <div className="h-20 sm:h-24 flex items-center justify-center">
           {state === GameState.PLAYING && (
               <CircularTimer progress={timerProgress} />
           )}
         </div>

         {/* Tortoise Button: Depressed when active, raised when inactive */}
         <button
           type="button"
           onClick={toggleSlowMode}
           aria-pressed={isSlowMode}
           title={isSlowMode ? "Slow mode active. Click to toggle off." : "Click to slow time."}
           className={`pointer-events-auto flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm select-none transition-all duration-150 active:scale-95 cursor-pointer ${
             isSlowMode
               ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-[inset_0_3px_6px_rgba(0,0,0,0.4)] border-2 border-emerald-800 translate-y-0.5 ring-2 ring-emerald-300 ring-offset-1 focus:ring-emerald-500'
               : 'bg-white hover:bg-gray-100 text-gray-700 shadow-md hover:shadow-lg border-2 border-gray-300'
           }`}
         >
           <span className="text-2xl leading-none">🐢</span>
           <span className="font-bold tracking-tight">Slow Mode</span>
         </button>
      </div>

      {/* Controls for Mobile / Visual Cues */}
      <Controls 
        players={players} 
        onSnap={handleSnap} 
        disabled={state !== GameState.PLAYING} 
      />

      {/* Error Explanation Feedback Popup (Only on wrong snap or missed match) */}
      {errorExplanation && (
        <ExplanationModal
          card1={errorExplanation.card1}
          card2={errorExplanation.card2}
          isMatch={errorExplanation.isMatch}
          onDismiss={handleDismissExplanation}
        />
      )}
    </div>
  );
};
