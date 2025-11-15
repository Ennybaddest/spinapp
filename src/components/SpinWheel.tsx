import { useState, useRef } from "react";
import { prizes } from "../data/prizes";

interface SpinWheelProps {
  onSpinComplete: (prize: string) => void;
  disabled: boolean;
}

const SPIN_RESULT_KEY = "deliciosa_spin_result";
const SPIN_ANIMATION_DURATION = 5000;

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
    const finalRotation =
      extraSpins * 360 + (360 - randomIndex * segmentAngle) + segmentAngle / 2;

    setRotation(rotation + finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const prizeText = `${prizes[randomIndex].emoji} ${prizes[randomIndex].text}`;

      localStorage.setItem(SPIN_RESULT_KEY, prizeText);

      onSpinComplete(prizeText);
    }, SPIN_ANIMATION_DURATION);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full mt-10">
      <div className="relative mx-auto" style={{ width: "400px", height: "400px" }}>
        <div className="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-full">
          <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[30px] border-l-transparent border-r-transparent border-t-pink-500 drop-shadow-lg"></div>
        </div>

        <div
          ref={wheelRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-8 border-white rounded-full shadow-2xl"
          style={{
            width: "400px",
            height: "400px",
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            transition: isSpinning
              ? "transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
              : "none",
            transformOrigin: "center",
          }}
        >
          {prizes.map((prize, index) => {
            const angle = (360 / prizes.length) * index;
            const segmentAngle = 360 / prizes.length;
            const textAngle = angle + segmentAngle / 2;
            return (
              <div
                key={prize.id}
                className="absolute w-full h-full"
                style={{
                  transform: `rotate(${angle}deg)`,
                  clipPath: "polygon(50% 50%, 50% 0%, 100% 0%)",
                }}
              >
                <div
                  className="relative w-full h-full"
                  style={{ backgroundColor: prize.color }}
                />
              </div>
            );
          })}

          {prizes.map((prize, index) => {
            const angle = (360 / prizes.length) * index;
            const segmentAngle = 360 / prizes.length;
            const textAngle = angle + segmentAngle / 2;
            const radius = 130;
            const radians = (textAngle * Math.PI) / 180;
            const x = Math.cos(radians) * radius;
            const y = Math.sin(radians) * radius;

            return (
              <div
                key={`text-${prize.id}`}
                className="absolute font-bold text-center"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${textAngle}deg)`,
                  width: "60px",
                  transformOrigin: "0 0",
                }}
              >
                <div className="text-2xl leading-none mb-1">{prize.emoji}</div>
                <div className="text-xs leading-tight break-words text-amber-900">
                  {prize.text}
                </div>
              </div>
            );
          })}

          <div className="absolute z-10 w-16 h-16 -translate-x-1/2 -translate-y-1/2 border-4 border-white rounded-full shadow-lg top-1/2 left-1/2 bg-gradient-to-br from-pink-400 to-pink-600"></div>
        </div>
      </div>

      <button
        onClick={spinWheel}
        disabled={disabled || isSpinning}
        className="px-12 py-4 mt-10 text-2xl font-bold text-white transition-all duration-200 transform rounded-full shadow-xl bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed hover:scale-110 disabled:scale-100"
      >
        {isSpinning ? "SPINNING..." : "SPIN NOW!"}
      </button>
    </div>
  );
}
