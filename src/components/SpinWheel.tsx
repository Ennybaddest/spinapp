import { useState, useRef } from 'react';
import { prizes } from '../data/prizes';

interface SpinWheelProps {
  onSpinComplete: (prize: string) => void;
  disabled: boolean;
}

export function SpinWheel({ onSpinComplete, disabled }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  const spinWheel = () => {
    if (isSpinning || disabled) return;

    setIsSpinning(true);

    const segmentAngle = 360 / prizes.length;
    const randomIndex = Math.floor(Math.random() * prizes.length);
    const extraSpins = 5;
    const finalRotation = extraSpins * 360 + (360 - randomIndex * segmentAngle) + segmentAngle / 2;

    setRotation(rotation + finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const prizeText = `${prizes[randomIndex].emoji} ${prizes[randomIndex].text}`;
      onSpinComplete(prizeText);
    }, 5000);
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative w-80 h-80 md:w-96 md:h-96">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[30px] border-l-transparent border-r-transparent border-t-pink-500 drop-shadow-lg"></div>
        </div>

        <div
          ref={wheelRef}
          className="w-full h-full rounded-full shadow-2xl relative overflow-visible border-8 border-white"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
          }}
        >
          {prizes.map((prize, index) => {
            const angle = (360 / prizes.length) * index;
            const segmentAngle = 360 / prizes.length;
            return (
              <div
                key={prize.id}
                className="absolute w-full h-full"
                style={{
                  transform: `rotate(${angle}deg)`,
                  clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%)',
                }}
              >
                <div
                  className="w-full h-full relative"
                  style={{ backgroundColor: prize.color }}
                >
                  <div
                    className="absolute text-center font-bold"
                    style={{
                      top: '20px',
                      left: '50%',
                      transform: `translateX(-50%) rotate(${angle + segmentAngle / 2}deg)`,
                      width: '70px',
                      transformOrigin: 'center',
                    }}
                  >
                    <div className="text-2xl leading-none mb-1">{prize.emoji}</div>
                    <div className="text-xs leading-tight text-amber-900 break-words">{prize.text}</div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full shadow-lg border-4 border-white z-10"></div>
        </div>
      </div>

      <button
        onClick={spinWheel}
        disabled={disabled || isSpinning}
        className="mt-8 px-12 py-4 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold text-2xl rounded-full shadow-xl transform hover:scale-110 disabled:scale-100 transition-all duration-200"
      >
        {isSpinning ? 'SPINNING...' : 'SPIN NOW!'}
      </button>
    </div>
  );
}
