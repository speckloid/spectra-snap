import React, { useEffect } from 'react';
import { CardData } from '../types';
import { Card } from './Card';

interface ExplanationModalProps {
  card1: CardData;
  card2: CardData;
  isMatch: boolean;
  onDismiss: () => void;
}

// Generate concise, pedagogically rich physics explanations for each pair
export const getExplanation = (c1: CardData, c2: CardData, isMatch: boolean): string => {
  const ids = [c1.id, c2.id];

  // Helper flags
  const has = (id: number) => ids.includes(id);
  const otherCard = (id: number) => (c1.id === id ? c2 : c1);

  // Card IDs reference:
  // 1: High f, 2: High E, 3: Low λ
  // 4: Low f, 5: Low E, 6: High λ
  // 7: Emission, 8: Absorption
  // 9: UV, 10: Visible
  // 11-16: Text transitions (11: 3→2, 12: 2→3, 13: 3→1, 14: 2→1, 15: 1→3, 16: 1→2)
  // 17-22: Diagram transitions (17: 3→2, 18: 2→3, 19: 3→1, 20: 2→1, 21: 1→3, 22: 1→2)
  // 23: Emission Spectrum (Visible lines)
  // 24: Absorption Spectrum (Visible dark bands on rainbow)

  // Property helpers
  const isHighEProp = (id: number) => [1, 2, 3].includes(id);
  const isLowEProp = (id: number) => [4, 5, 6].includes(id);
  const isUV = (id: number) => id === 9;
  const isVisible = (id: number) => id === 10;
  const isSpectrum = (id: number) => id === 23 || id === 24;

  const isUVTransition = (id: number) => [13, 14, 15, 16, 19, 20, 21, 22].includes(id); // to/from n=1
  const isVisibleTransition = (id: number) => [11, 12, 17, 18].includes(id); // to/from n=2

  const isDownward = (id: number) => [7, 11, 13, 14, 17, 19, 20, 23].includes(id);
  const isUpward = (id: number) => [8, 12, 15, 16, 18, 21, 22, 24].includes(id);

  // Diagram matching text transitions (exact matching pair)
  const diagPairs: [number, number, string][] = [
    [11, 17, 'n = 3 → n = 2'],
    [12, 18, 'n = 2 → n = 3'],
    [13, 19, 'n = 3 → n = 1'],
    [14, 20, 'n = 2 → n = 1'],
    [15, 21, 'n = 1 → n = 3'],
    [16, 22, 'n = 1 → n = 2'],
  ];

  for (const [textId, diagId, label] of diagPairs) {
    if (has(textId) && has(diagId)) {
      return `The energy diagram shows an electron jump for ${label}, which directly matches the transition formula!`;
    }
  }

  // ==========================================
  // CASE 1: MISSED MATCH (isMatch === true)
  // Explains why the pair IS a valid snap!
  // ==========================================
  if (isMatch) {
    // 1. Inverse proportionality: Energy / Frequency vs Wavelength
    if (has(2) && has(3)) {
      return `Energy and wavelength are inversely proportional (when one goes up, the other goes down). High energy corresponds to short wavelength (Low λ), so High E IS a snap with Low λ!`;
    }
    if (has(1) && has(3)) {
      return `Frequency and wavelength are inversely proportional (when one goes up, the other goes down). High frequency corresponds to short wavelength (Low λ), so High f IS a snap with Low λ!`;
    }
    if (has(5) && has(6)) {
      return `Energy and wavelength are inversely proportional (when one goes down, the other goes up). Low energy corresponds to long wavelength (High λ), so Low E IS a snap with High λ!`;
    }
    if (has(4) && has(6)) {
      return `Frequency and wavelength are inversely proportional (when one goes down, the other goes up). Low frequency corresponds to long wavelength (High λ), so Low f IS a snap with High λ!`;
    }

    // 2. Direct proportionality: Energy vs Frequency (E = hf)
    if (has(1) && has(2)) {
      return `Energy and frequency are directly proportional (E = hf): as frequency increases, energy increases. Therefore, High E and High f are a snap!`;
    }
    if (has(4) && has(5)) {
      return `Energy and frequency are directly proportional (E = hf): lower frequency light carries lower energy. Therefore, Low E and Low f are a snap!`;
    }

    // 3. UV / Visible matched with their properties
    if (has(9) && ids.some(isHighEProp)) {
      const prop = otherCard(9);
      if (prop.id === 3) {
        return `UV photons have high energy, which means short wavelength (Low λ) because energy and wavelength are inversely proportional. Therefore, UV pairs with Low λ!`;
      }
      return `Ultraviolet (UV) photons have high frequency and high energy compared to visible light, making UV a snap with ${prop.content}!`;
    }
    if (has(10) && ids.some(isLowEProp)) {
      const prop = otherCard(10);
      if (prop.id === 6) {
        return `Visible light has lower energy than UV, which means longer wavelength (High λ) because energy and wavelength are inversely proportional. Therefore, Visible pairs with High λ!`;
      }
      return `Visible light photons have lower frequency and lower energy than UV, making Visible a snap with ${prop.content}!`;
    }

    // 4. Pictorial Spectra (23 & 24) with Low E / Visible properties
    if (has(24) && (ids.some(isLowEProp) || has(10))) {
      const propCard = otherCard(24);
      return `This is a visible absorption spectrum. Visible light has less energy than UV (the only other alternative in this game), therefore a visible spectrum IS a snap with ${propCard.content}!`;
    }
    if (has(23) && (ids.some(isLowEProp) || has(10))) {
      const propCard = otherCard(23);
      return `This is a visible emission spectrum. Visible light has less energy than UV (the only other alternative in this game), therefore a visible spectrum IS a snap with ${propCard.content}!`;
    }

    // 5. Pictorial Spectra with Process (Emission / Absorption)
    if (has(23) && has(7)) {
      return `This spectrum shows bright colored emission lines against dark background, representing Emission. Therefore, it is a snap with 'Emission'!`;
    }
    if (has(24) && has(8)) {
      return `This spectrum shows dark absorption lines across a continuous rainbow, representing Absorption. Therefore, it is a snap with 'Absorption'!`;
    }

    // 6. Pictorial Spectra with specific Balmer transitions
    if (has(23) && has(11)) {
      return `The transition n=3 → n=2 falls in the Balmer series, emitting the visible red line seen on this emission spectrum!`;
    }
    if (has(24) && has(12)) {
      return `The transition n=2 → n=3 absorbs visible red light, creating the dark line in this absorption spectrum!`;
    }

    // 7. Process (Emission / Absorption) with transitions
    if (has(7)) {
      return `Electrons dropping from a higher level down to a lower level release energy as emitted light (Emission). Therefore, this downward jump IS a snap with Emission!`;
    }
    if (has(8)) {
      return `Electrons jumping from a lower level up to a higher level must absorb energy (Absorption). Therefore, this upward jump IS a snap with Absorption!`;
    }

    // 8. UV transitions (to/from n=1: Lyman series) with UV / High E properties
    if (ids.some(id => isHighEProp(id) || isUV(id)) && ids.some(isUVTransition)) {
      const propCard = ids.find(id => isHighEProp(id) || isUV(id));
      if (propCard === 3) {
        return `Transitions to or from the ground state (n=1) have large energy gaps that emit or absorb UV photons. High energy means short wavelength (Low λ), so this IS a snap!`;
      }
      return `Transitions to or from the ground state (n=1) have large energy gaps that fall in the ultraviolet (UV). UV light has high energy and high frequency, so this IS a snap!`;
    }

    // 9. Visible transitions (to/from n=2: Balmer series) with Visible / Low E properties
    if (ids.some(id => isLowEProp(id) || isVisible(id)) && ids.some(isVisibleTransition)) {
      const propCard = ids.find(id => isLowEProp(id) || isVisible(id));
      if (propCard === 6) {
        return `Transitions to or from n=2 fall in the visible spectrum. Visible light has lower energy than UV, meaning longer wavelength (High λ), so this IS a snap!`;
      }
      return `Transitions to or from n=2 fall in the visible spectrum. Visible light has less energy and lower frequency than UV, so this IS a snap!`;
    }

    // 10. Card 21 (Diag 1→3) with High E / UV properties
    if (has(21) && (ids.some(isHighEProp) || has(9))) {
      return `Diagram 1→3 represents an upward absorption jump from the ground state (n=1), which requires high-energy UV light!`;
    }

    return `These two cards match because their electromagnetic properties and energy levels align!`;
  }

  // ==========================================
  // CASE 2: WRONG SNAP (isMatch === false)
  // Explains why the pair is NOT a snap!
  // ==========================================

  // 1. Inversely proportional property errors:
  // High E + High λ
  if (has(2) && has(6)) {
    return `Energy and wavelength are inversely proportional (when one goes up, the other goes down). High energy means short wavelength (Low λ), so High E does NOT pair with High λ!`;
  }
  // High f + High λ
  if (has(1) && has(6)) {
    return `Frequency and wavelength are inversely proportional (when one goes up, the other goes down). High frequency means short wavelength (Low λ), so High f does NOT pair with High λ!`;
  }
  // Low E + Low λ
  if (has(5) && has(3)) {
    return `Energy and wavelength are inversely proportional (when one goes down, the other goes up). Low energy means long wavelength (High λ), so Low E does NOT pair with Low λ!`;
  }
  // Low f + Low λ
  if (has(4) && has(3)) {
    return `Frequency and wavelength are inversely proportional (when one goes down, the other goes up). Low frequency means long wavelength (High λ), so Low f does NOT pair with Low λ!`;
  }

  // 2. Directly proportional property errors:
  if (has(1) && has(5)) {
    return `Energy and frequency are directly proportional (E = hf). High frequency means High Energy, not Low Energy!`;
  }
  if (has(2) && has(4)) {
    return `Energy and frequency are directly proportional (E = hf). High energy means High Frequency, not Low Frequency!`;
  }

  // 3. Direct opposites of the same property:
  if (has(1) && has(4)) {
    return `High Frequency and Low Frequency are opposites. They do not match!`;
  }
  if (has(2) && has(5)) {
    return `High Energy and Low Energy are opposites. They do not match!`;
  }
  if (has(3) && has(6)) {
    return `Low Wavelength (short) and High Wavelength (long) are opposites. They do not match!`;
  }
  if (has(9) && has(10)) {
    return `Ultraviolet (UV) and Visible light are different parts of the spectrum. UV has much higher energy and frequency than visible light!`;
  }
  if (has(7) && has(8)) {
    return `Emission (giving out light as electrons fall) and Absorption (taking in light as electrons jump up) are opposite processes. They do not match!`;
  }

  // 4. UV vs Visible mismatch:
  if (has(9) && ids.some(isLowEProp)) {
    const prop = otherCard(9);
    return `Ultraviolet (UV) light is high energy and high frequency. ${prop.content} belongs to visible light, so it does not pair with UV!`;
  }
  if (has(10) && ids.some(isHighEProp)) {
    const prop = otherCard(10);
    return `Visible light is lower in energy than UV. ${prop.content} belongs to UV light, so it does not pair with Visible!`;
  }

  // 5. Pictorial Spectra mismatches:
  if (has(23) && (ids.some(isHighEProp) || has(9))) {
    return `This is a visible emission spectrum. Visible light has less energy than UV, so it does NOT match High Energy or UV!`;
  }
  if (has(24) && (ids.some(isHighEProp) || has(9))) {
    return `This is a visible absorption spectrum. Visible light has less energy than UV, so it does NOT match High Energy or UV!`;
  }
  if (has(23) && has(8)) {
    return `Card 23 shows colored lines on a dark background (Emission), not dark absorption bands. They are opposite processes!`;
  }
  if (has(24) && has(7)) {
    return `Card 24 shows dark absorption bands across a rainbow (Absorption), not bright emission lines. They are opposite processes!`;
  }
  if (isSpectrum(c1.id) && isUVTransition(c2.id) || isSpectrum(c2.id) && isUVTransition(c1.id)) {
    return `This spectrum shows visible light (Balmer series), whereas transitions to or from n=1 produce UV light (Lyman series). They do not match!`;
  }

  // 6. Emission vs Absorption process mismatch:
  if (ids.some(isDownward) && ids.some(isUpward)) {
    return `One card represents Emission (electrons falling down) while the other represents Absorption (electrons jumping up). They are opposite processes!`;
  }

  // 7. Transition vs non-matching energy property:
  if (ids.some(isUVTransition) && ids.some(id => isLowEProp(id) || isVisible(id))) {
    return `Transitions to or from the ground state (n=1) have large energy gaps that produce UV light, so they do not pair with visible light or Low Energy!`;
  }
  if (ids.some(isVisibleTransition) && ids.some(id => isHighEProp(id) || isUV(id))) {
    return `Transitions to or from n=2 fall in the visible spectrum. Visible light has less energy than UV, so they do not pair with UV or High Energy!`;
  }

  // 8. Process vs Non-matching Transition:
  if (has(7) && ids.some(isUpward)) {
    return `This transition jumps upwards, which requires absorbing energy (Absorption), not releasing it (Emission)!`;
  }
  if (has(8) && ids.some(isDownward)) {
    return `This transition falls downwards, which releases energy (Emission), not absorbing it (Absorption)!`;
  }

  // 9. Two different transitions:
  if ((ids.every(id => id >= 11 && id <= 16)) || (ids.every(id => id >= 17 && id <= 22))) {
    return `Both cards show different electron transitions. Two different transitions do not form a snap pair!`;
  }
  if (ids.some(id => id >= 11 && id <= 16) && ids.some(id => id >= 17 && id <= 22)) {
    return `The diagram and the text formula show two different electron transitions between different energy levels!`;
  }

  // 10. Process with irrelevant property:
  if ((has(7) || has(8)) && (ids.some(isHighEProp) || ids.some(isLowEProp) || has(9) || has(10))) {
    const proc = has(7) ? 'Emission' : 'Absorption';
    return `${proc} describes whether an electron falls or jumps, not an energy level. It only snaps with matching transition arrows, formulas, or spectra!`;
  }

  // Default clean fallback:
  return `These two cards describe different physical concepts that do not form a matching pair in this game.`;
};

export const ExplanationModal: React.FC<ExplanationModalProps> = ({
  card1,
  card2,
  isMatch,
  onDismiss
}) => {
  const explanation = getExplanation(card1, card2, isMatch);

  // Close on Escape / Space / Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease-out]"
      onClick={onDismiss}
    >
      <div 
        className="bg-white rounded-3xl border-4 border-indigo-200 shadow-2xl max-w-md w-full p-6 relative flex flex-col items-center text-center cursor-default animate-[pop_0.2s_ease-out]"
        onClick={e => {
          onDismiss();
        }}
      >
        {/* Close Button X in top right */}
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onDismiss();
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 flex items-center justify-center text-gray-500 hover:text-gray-800 font-bold text-lg transition-colors cursor-pointer"
          title="Dismiss"
          aria-label="Close explanation"
        >
          ✕
        </button>

        {/* Badge / Header */}
        <div className="mb-4">
          <span 
            className={`inline-block px-4 py-1 rounded-full text-xs font-black tracking-wider uppercase ${
              isMatch 
                ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}
          >
            {isMatch ? 'MISSED SNAP!' : 'NOT A SNAP!'}
          </span>
        </div>

        {/* Mini Cards Preview */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 my-2 pointer-events-none">
          <div className="transform scale-90 sm:scale-100">
            <Card 
              data={card1} 
              isFlipped={true} 
              highlight={isMatch ? 'success' : 'error'}
              size="small"
            />
          </div>

          <div 
            className={`w-9 h-9 rounded-full flex items-center justify-center font-black font-bangers text-lg shadow-md ${
              isMatch 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}
          >
            {isMatch ? '=' : '≠'}
          </div>

          <div className="transform scale-90 sm:scale-100">
            <Card 
              data={card2} 
              isFlipped={true} 
              highlight={isMatch ? 'success' : 'error'}
              size="small"
            />
          </div>
        </div>

        {/* Short, Snappy Explanation */}
        <div className="mt-4 px-2">
          <p className="text-gray-800 font-medium text-sm sm:text-base leading-relaxed">
            {explanation}
          </p>
        </div>

        {/* Click to dismiss hint / action */}
        <div className="mt-5 pt-3 border-t border-gray-100 w-full flex items-center justify-center">
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors">
            Tap anywhere or click ✕ to continue
          </span>
        </div>
      </div>
    </div>
  );
};
