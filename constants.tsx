
import React from 'react';
import { CardData } from './types';

// -- SVG COMPONENTS --

const SpectrumBackground = ({ children }: { children?: React.ReactNode }) => (
  <svg viewBox="0 0 100 120" className="w-full h-full p-2">
    {/* Energy Lines */}
    <line x1="10" y1="20" x2="90" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Middle line moved up to 35 from 50 */}
    <line x1="10" y1="35" x2="90" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="10" y1="90" x2="90" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    
    {/* Labels */}
    <text x="92" y="20" fontSize="8" fill="#6B7280" alignmentBaseline="middle">n=3</text>
    {/* Middle label moved up to 35 */}
    <text x="92" y="35" fontSize="8" fill="#6B7280" alignmentBaseline="middle">n=2</text>
    <text x="12" y="100" fontSize="8" fill="#1F2937" fontWeight="bold">Ground state (n=1)</text>
    
    {children}
  </svg>
);

const Arrow = ({ startY, endY, color = "#1E40AF" }: { startY: number, endY: number, color?: string }) => {
  const isUp = endY < startY;
  // Offset arrow slightly to avoid overlapping text if needed, but centering is usually fine here
  const x = 50; 
  return (
    <g>
      <line x1={x} y1={startY} x2={x} y2={endY} stroke={color} strokeWidth="3" />
      <polygon 
        points={isUp 
          ? `${x},${endY - 2} ${x - 4},${endY + 6} ${x + 4},${endY + 6}`
          : `${x},${endY + 2} ${x - 4},${endY - 6} ${x + 4},${endY - 6}`
        } 
        fill={color} 
      />
    </g>
  );
};

const EmissionSpectrumSVG = () => (
  <svg viewBox="0 0 100 60" className="w-full h-full bg-black rounded-lg">
    <line x1="20" y1="5" x2="20" y2="55" stroke="#8B5CF6" strokeWidth="3" /> {/* Violet */}
    <line x1="30" y1="5" x2="30" y2="55" stroke="#3B82F6" strokeWidth="3" /> {/* Blue */}
    <line x1="50" y1="5" x2="50" y2="55" stroke="#06B6D4" strokeWidth="3" /> {/* Cyan */}
    <line x1="85" y1="5" x2="85" y2="55" stroke="#EF4444" strokeWidth="3" /> {/* Red */}
  </svg>
);

const AbsorptionSpectrumSVG = () => (
  <svg viewBox="0 0 100 60" className="w-full h-full rounded-lg overflow-hidden">
    <defs>
      <linearGradient id="rainbow" x1="0" x2="1">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="25%" stopColor="#3B82F6" />
        <stop offset="50%" stopColor="#06B6D4" />
        <stop offset="75%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#EF4444" />
      </linearGradient>
    </defs>
    <rect width="100" height="60" fill="url(#rainbow)" />
    <line x1="20" y1="5" x2="20" y2="55" stroke="black" strokeWidth="3" />
    <line x1="30" y1="5" x2="30" y2="55" stroke="black" strokeWidth="3" />
    <line x1="50" y1="5" x2="50" y2="55" stroke="black" strokeWidth="3" />
    <line x1="85" y1="5" x2="85" y2="55" stroke="black" strokeWidth="3" />
  </svg>
);

// -- CARD DEFINITIONS --

const Y_TOP = 20;
// Y_MID changed from 50 to 35 to match SVG change
const Y_MID = 35;
const Y_BOT = 90;

export const CARDS: CardData[] = [
  // 1-6: Properties
  { id: 1, type: 'text', content: 'High f', label: 'High Frequency' },
  { id: 2, type: 'text', content: 'High E', label: 'High Energy' },
  { id: 3, type: 'text', content: 'Low λ', label: 'Short Wavelength' },
  { id: 4, type: 'text', content: 'Low f', label: 'Low Frequency' },
  { id: 5, type: 'text', content: 'Low E', label: 'Low Energy' },
  { id: 6, type: 'text', content: 'High λ', label: 'Long Wavelength' },
  
  // 7-8: Process
  { id: 7, type: 'text', content: 'Emission', label: 'Emission' },
  { id: 8, type: 'text', content: 'Absorption', label: 'Absorption' },
  
  // 9-10: Type
  { id: 9, type: 'text', content: 'UV', label: 'Ultraviolet' },
  { id: 10, type: 'text', content: 'Visible', label: 'Visible Light' },
  
  // 11-16: Text Transitions
  { id: 11, type: 'text', content: 'n = 3 → n = 2', label: '3 to 2' },
  { id: 12, type: 'text', content: 'n = 2 → n = 3', label: '2 to 3' },
  { id: 13, type: 'text', content: 'n = 3 → n = 1', label: '3 to 1' },
  { id: 14, type: 'text', content: 'n = 2 → n = 1', label: '2 to 1' },
  { id: 15, type: 'text', content: 'n = 1 → n = 3', label: '1 to 3' },
  { id: 16, type: 'text', content: 'n = 1 → n = 2', label: '1 to 2' },
  
  // 17-22: Visual Transitions
  { 
    id: 17, 
    type: 'image', 
    content: <SpectrumBackground><Arrow startY={Y_TOP} endY={Y_MID} /></SpectrumBackground>,
    label: 'Diag: 3 to 2'
  },
  { 
    id: 18, 
    type: 'image', 
    content: <SpectrumBackground><Arrow startY={Y_MID} endY={Y_TOP} /></SpectrumBackground>,
    label: 'Diag: 2 to 3'
  },
  { 
    id: 19, 
    type: 'image', 
    content: <SpectrumBackground><Arrow startY={Y_TOP} endY={Y_BOT} /></SpectrumBackground>,
    label: 'Diag: 3 to 1'
  },
  { 
    id: 20, 
    type: 'image', 
    content: <SpectrumBackground><Arrow startY={Y_MID} endY={Y_BOT} /></SpectrumBackground>,
    label: 'Diag: 2 to 1'
  },
  { 
    id: 21, 
    type: 'image', 
    content: <SpectrumBackground><Arrow startY={Y_BOT} endY={Y_TOP} /></SpectrumBackground>,
    label: 'Diag: 1 to 3'
  },
  { 
    id: 22, 
    type: 'image', 
    content: <SpectrumBackground><Arrow startY={Y_BOT} endY={Y_MID} /></SpectrumBackground>,
    label: 'Diag: 1 to 2'
  },
  // 23-24: New Spectrum Images
  {
    id: 23,
    type: 'image',
    content: <div className="p-4 w-full h-full flex items-center justify-center"><EmissionSpectrumSVG /></div>,
    label: 'Emission Spectrum'
  },
  {
    id: 24,
    type: 'image',
    content: <div className="p-4 w-full h-full flex items-center justify-center"><AbsorptionSpectrumSVG /></div>,
    label: 'Absorption Spectrum'
  }
];

// -- MATCH LOGIC --

const HIGH_E_PROPERTIES = [1, 2, 3, 9]; // High f, High E, Low λ, UV
const LOW_E_PROPERTIES = [4, 5, 6, 10]; // Low f, Low E, High λ, Visible

const UV_TRANSITIONS_EMISSION = [13, 14, 19, 20]; // Down to n=1
const UV_TRANSITIONS_ABSORPTION = [15, 16, 21, 22]; // Up from n=1
const VIS_TRANSITIONS_EMISSION = [11, 17]; // Down to n=2
const VIS_TRANSITIONS_ABSORPTION = [12, 18]; // Up from n=2

const UV_GROUP = [9, ...UV_TRANSITIONS_EMISSION, ...UV_TRANSITIONS_ABSORPTION];
const VIS_GROUP = [10, ...VIS_TRANSITIONS_EMISSION, ...VIS_TRANSITIONS_ABSORPTION];

// Specific Diagram <-> Text matches
const DIAGRAM_MATCHES = [
  [11, 17],
  [12, 18],
  [13, 19],
  [14, 20],
  [15, 21],
  [16, 22]
];

// Helper to add mutual matches
const addMatch = (map: Map<number, Set<number>>, a: number, b: number) => {
  if (!map.has(a)) map.set(a, new Set());
  if (!map.has(b)) map.set(b, new Set());
  map.get(a)!.add(b);
  map.get(b)!.add(a);
};

// Generate Logic Map
export const getMatchMap = () => {
  const map = new Map<number, Set<number>>();

  // Group 1 Matches (High E) <-> UV Stuff
  HIGH_E_PROPERTIES.forEach(h => {
    UV_GROUP.forEach(u => addMatch(map, h, u));
  });

  // Mutual matches within High E properties (High f <-> High E <-> Low λ <-> UV)
  HIGH_E_PROPERTIES.forEach(a => {
    HIGH_E_PROPERTIES.forEach(b => {
      if (a !== b) addMatch(map, a, b);
    });
  });

  // Group 2 Matches (Low E) <-> Visible Stuff
  LOW_E_PROPERTIES.forEach(l => {
    VIS_GROUP.forEach(v => addMatch(map, l, v));
  });

  // Mutual matches within Low E properties (Low f <-> Low E <-> High λ <-> Visible)
  LOW_E_PROPERTIES.forEach(a => {
    LOW_E_PROPERTIES.forEach(b => {
      if (a !== b) addMatch(map, a, b);
    });
  });

  // 7 (Emission) matches specific transitions
  // Note: 23 is also Emission image, but handled explicitly
  [...UV_TRANSITIONS_EMISSION, ...VIS_TRANSITIONS_EMISSION].forEach(t => addMatch(map, 7, t));

  // 8 (Absorption) matches specific transitions
  // Note: 24 is also Absorption image, but handled explicitly
  [...UV_TRANSITIONS_ABSORPTION, ...VIS_TRANSITIONS_ABSORPTION].forEach(t => addMatch(map, 8, t));
  
  // Diagram to Text exact matches
  DIAGRAM_MATCHES.forEach(([text, img]) => addMatch(map, text, img));

  // Explicit fix for Card 21 (Diag 1->3)
  // It is in UV_TRANSITIONS_ABSORPTION, so logic above matches it to 7/8? No, matches to 8 (Absorption).
  // Logic above matches it to HIGH_E_PROPERTIES (High f, High E, Low λ, UV).
  // Ensure it does NOT match Low f (4), Low E (5), High λ (6), Visible (10).
  // The generic logic handles this, but let's confirm explicit requested matches.
  // "It should match with High f (Card 1) as well as cards 2, 3, 8, 9, and 21"
  const CARD_21_MATCHES = [1, 2, 3, 8, 9];
  CARD_21_MATCHES.forEach(m => addMatch(map, 21, m));


  // -- NEW CARDS LOGIC (23 & 24) --
  
  // Card 23 (Emission Image)
  // Matches "Emission" (7)
  addMatch(map, 23, 7);
  // Matches Properties: Low f(4), Low E(5), High λ(6), Visible(10)
  // (CORRECTION: High λ is card 6. Previous prompt used 3 as 'low lambda' correctly, but description was mixed)
  // The prompt says: "should match with High λ, but not with Low λ"
  const SPECTRUM_PROPS = [4, 5, 6, 10]; 
  SPECTRUM_PROPS.forEach(p => addMatch(map, 23, p));
  SPECTRUM_PROPS.forEach(p => addMatch(map, 24, p));

  // Card 24 (Absorption Image)
  // Matches "Absorption" (8)
  addMatch(map, 24, 8);

  // Specific Image <-> Text
  addMatch(map, 23, 11); // Emission Image <-> n=3 to n=2
  addMatch(map, 24, 12); // Absorption Image <-> n=2 to n=3

  return map;
};

export const MATCH_MAP = getMatchMap();

export const checkMatch = (id1: number, id2: number): boolean => {
  if (id1 === id2) return false; // Can't match self
  return MATCH_MAP.get(id1)?.has(id2) || false;
};
