
import React from 'react';
import { CardData } from '../types';

interface CardProps {
  data: CardData;
  isFlipped: boolean;
  highlight?: 'success' | 'error' | null;
  onClick?: () => void;
  isInteractive?: boolean;
  size?: 'normal' | 'small';
}

export const Card: React.FC<CardProps> = ({ 
  data, 
  isFlipped, 
  highlight, 
  onClick, 
  isInteractive = false,
  size = 'normal'
}) => {
  // Check content types to adjust sizing
  const isSmall = size === 'small';
  const isEquation = typeof data.content === 'string' && data.content.includes('→');
  const isLongLabel = typeof data.content === 'string' && (data.content === 'Emission' || data.content === 'Absorption');

  return (
    <div 
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={e => {
        if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`relative card-flip-container select-none ${
        isSmall 
          ? 'w-28 h-36 sm:w-32 sm:h-44' 
          : 'w-40 h-56 sm:w-56 sm:h-72 lg:w-64 lg:h-80'
      } ${
        isInteractive 
          ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform hover:shadow-2xl' 
          : ''
      }`}
    >
      <div className={`card-inner duration-500 ${isFlipped ? 'flipped' : ''} shadow-xl rounded-2xl`}>
        
        {/* Front (Face Down / Logo Side) */}
        <div className="card-front absolute w-full h-full bg-white border border-gray-200 rounded-2xl overflow-hidden flex items-center justify-center">
          {/* Card Pattern */}
          <div className="w-full h-full bg-indigo-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
             
             {/* Diagonal Neon Stripes (Bottom-Right to Top-Left) */}
             <div className="absolute inset-0 opacity-40 pointer-events-none">
                {/* Cyan Stripe */}
                <div className="absolute h-8 w-[200%] bg-cyan-400 -rotate-45 top-[10%] -left-[50%] shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                {/* Dark Blue Stripe */}
                <div className="absolute h-10 w-[200%] bg-blue-800 -rotate-45 top-[40%] -left-[40%]"></div>
                {/* Neon Red Stripe */}
                <div className="absolute h-6 w-[200%] bg-red-500 -rotate-45 top-[70%] -left-[30%] shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                {/* Purple Stripe */}
                <div className="absolute h-12 w-[200%] bg-purple-600 -rotate-45 top-[90%] -left-[20%]"></div>
             </div>
             
             <h1 className="text-white text-5xl sm:text-6xl -rotate-12 opacity-100 text-center font-bangers relative z-10 drop-shadow-xl leading-none">
               Spectra<br/>Snap!
             </h1>
          </div>
        </div>

        {/* Back (Face Up / Content Side) */}
        <div 
          className={`card-back absolute w-full h-full rounded-2xl flex flex-col items-center justify-center ${
            isSmall ? 'p-2' : 'p-4'
          } border-4 transition-colors duration-300 bg-white
            ${highlight === 'success' ? 'border-green-500 bg-green-50' : ''}
            ${highlight === 'error' ? 'border-red-500 bg-red-50' : ''}
            ${!highlight ? 'border-white' : ''}
          `}
        >
          {data.type === 'text' ? (
             <div className="text-center w-full px-1 break-words">
                <p 
                  className={`font-bold text-gray-800 whitespace-nowrap ${
                    isSmall
                      ? isEquation ? 'text-xs sm:text-sm' : isLongLabel ? 'text-sm sm:text-base' : 'text-lg sm:text-xl'
                      : isEquation ? 'text-base sm:text-xl md:text-2xl' : isLongLabel ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'
                  }`}
                >
                  {data.content}
                </p>
             </div>
          ) : (
             <div className="w-full h-full text-indigo-800 flex items-center justify-center">
               {data.content}
             </div>
          )}
          
          {/* Visually hidden label for accessibility */}
          {data.label && (
            <div className="sr-only">
              {data.label}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
