import React from 'react';
import { Player } from '../types';

interface ControlsProps {
  players: Player[];
  onSnap: (playerId: number) => void;
  disabled: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ players, onSnap, disabled }) => {
  return (
    <div className="fixed bottom-0 left-0 w-full p-4 pointer-events-none z-40">
      <div className="relative w-full h-32 max-w-4xl mx-auto flex justify-between items-end">
        
        {/* Player 1 - Left */}
        <button
          className={`pointer-events-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-indigo-600 text-white font-bold text-xl shadow-lg border-4 border-white active:scale-95 transition-transform flex flex-col items-center justify-center
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700 hover:scale-105 animate-pulse'}
          `}
          onClick={() => !disabled && onSnap(1)}
        >
          <span>P1</span>
          <span className="text-xs opacity-75">(A)</span>
        </button>

        {/* Player 3 - Center (if exists) */}
        {players.length > 2 && (
          <button
            className={`pointer-events-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-purple-600 text-white font-bold text-xl shadow-lg border-4 border-white active:scale-95 transition-transform flex flex-col items-center justify-center mb-8
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700 hover:scale-105 animate-pulse'}
            `}
            onClick={() => !disabled && onSnap(3)}
          >
            <span>P3</span>
            <span className="text-xs opacity-75">(SPC)</span>
          </button>
        )}

        {/* Player 2 - Right (if exists, or Comp in 1P mode - actually no button for comp) */}
        {/* Wait, if 1 Player mode, Player 2 is computer, so no button needed for P2. */}
        {/* If 2+ players, P2 gets a button */}
        {players.find(p => p.id === 2 && p.name !== 'CPU') && (
           <button
           className={`pointer-events-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-orange-500 text-white font-bold text-xl shadow-lg border-4 border-white active:scale-95 transition-transform flex flex-col items-center justify-center
             ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600 hover:scale-105 animate-pulse'}
           `}
           onClick={() => !disabled && onSnap(2)}
         >
           <span>P2</span>
           <span className="text-xs opacity-75">(L)</span>
         </button>
        )}
      </div>
    </div>
  );
};
