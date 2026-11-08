
import React, { useState } from 'react';
import { Menu } from './components/Menu';
import { Game } from './components/Game';
import { audioService } from './services/audioService';

const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerCount, setPlayerCount] = useState(1);

  const startGame = async (count: number) => {
    // Initialize/Resume audio context on user interaction
    await audioService.resume();
    
    setPlayerCount(count);
    setIsPlaying(true);
  };

  const stopGame = () => {
    setIsPlaying(false);
  };

  return (
    <div className="antialiased text-gray-900">
      {isPlaying ? (
        <Game playerCount={playerCount} onExit={stopGame} />
      ) : (
        <Menu onStart={startGame} />
      )}
    </div>
  );
};

export default App;
