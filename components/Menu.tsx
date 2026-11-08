import React from 'react';

interface MenuProps {
  onStart: (count: number) => void;
}

export const Menu: React.FC<MenuProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center border border-gray-100">
        
        {/* Title Art */}
        <div className="mb-6 relative inline-block">
             <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-xl opacity-80"></div>
             <h1 className="relative text-6xl md:text-7xl text-black-900 font-bangers">
                Spectra<br/>Snap!
             </h1>
        </div>

        <p className="text-gray-600 mb-8 font-medium leading-relaxed text-sm md:text-base">
          When you see a matching pair hit A, L, or Space (depending which player you are) to SNAP<br /><br />
          In this game the only possibilities for transitions are:<br /> 
          in the visible, or in the ultra-violet (UV).<br /> 
          Therefore (relatively) "HIGH E" pairs with "UV" while "LOW E" pairs with "visible".
        </p>

        <div className="space-y-4">
           <button 
             onClick={() => onStart(1)}
             className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] shadow-md flex items-center justify-center gap-2"
           >
             <span>👩‍🔬</span> 1 Player (vs CPU)
           </button>
           
           <button 
             onClick={() => onStart(2)}
             className="w-full py-4 bg-white border-2 border-indigo-100 hover:border-indigo-600 text-indigo-900 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
           >
             <span>👩‍🔬👨‍🔬</span> 2 Players
           </button>

           <button 
             onClick={() => onStart(3)}
             className="w-full py-4 bg-white border-2 border-purple-100 hover:border-purple-600 text-purple-900 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
           >
             <span>👩‍🔬👨‍🔬👩‍🔬</span> 3 Players
           </button>
        </div>

        <div className="mt-8 text-sm text-gray-700 font-semibold bg-gray-100 py-2 rounded-lg">
           <p>Controls:</p>
           <p>P1: 'A' | P2: 'L' | P3: Space</p>
        </div>
      </div>
    </div>
  );
};