import React from 'react';
import { Player } from '../types';

interface ScoreBoardProps {
  players: Player[];
  targetScore: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ players, targetScore }) => {
  return (
    <div className="w-full flex justify-between items-start gap-4 px-4 py-2 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm z-50">
      {players.map((player, index) => {
        const percentage = Math.min((player.score / targetScore) * 100, 100);
        const isLeft = index === 0; // Player 1
        const isCenter = players.length === 3 && index === 2; // Player 3
        
        // Alignment classes
        let containerClass = "flex-1 flex flex-col";
        if (isLeft) containerClass += " items-start";
        else if (isCenter) containerClass += " items-center mt-8 sm:mt-0"; // Push P3 down slightly on small screens or keep inline
        else containerClass += " items-end";

        // Bar color
        const barColor = player.id === 1 ? 'bg-indigo-600' : player.id === 2 ? 'bg-orange-500' : 'bg-purple-600';

        return (
          <div key={player.id} className={containerClass}>
            <div className="flex items-baseline gap-2 mb-1">
               <span className={`text-lg font-bold text-gray-800`}>{player.name}</span>
               <span className="text-2xl font-black text-gray-900">{player.score}</span>
            </div>
            
            {/* Energy Bar Container */}
            <div className={`w-full max-w-[200px] h-4 bg-gray-200 rounded-full overflow-hidden border border-gray-300 relative`}>
              {/* Fill */}
              <div 
                className={`h-full ${barColor} transition-all duration-500 ease-out relative`}
                style={{ width: `${percentage}%` }}
              >
                {/* Shine effect */}
                <div className="absolute top-0 left-0 w-full h-[50%] bg-white opacity-20"></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
