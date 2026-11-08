import React from 'react';

export enum GameState {
  MENU = 'MENU',
  PRE_ROUND = 'PRE_ROUND', // "Ready?"
  PLAYING = 'PLAYING',     // Cards visible, timer running
  RESOLUTION = 'RESOLUTION', // Success/Fail animation
  GAME_OVER = 'GAME_OVER'
}

export interface CardData {
  id: number;
  type: 'text' | 'image';
  content: string | React.ReactNode;
  label?: string; // For accessibility or debug
}

export interface Player {
  id: number;
  name: string;
  score: number;
  key: string; // The keyboard key to press
  color: string; // Tailwind color class for UI
  position: 'left' | 'right' | 'bottom';
}

export interface GameConfig {
  playerCount: number;
}