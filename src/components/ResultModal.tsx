import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ResultModalProps {
  prize: string;
  onClose: () => void;
}

export function ResultModal({ prize, onClose }: ResultModalProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
    }));
    setConfetti(pieces);
  }, []);

  const isWinner = !prize.includes('Better Luck');

  const instagramUrl = 'https://instagram.com/deliciosa';
  const whatsappUrl = 'https://wa.me/2349020819224?text=Hi%20Deliciosa!%20I%20want%20to%20place%20an%20order';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {isWinner && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {confetti.map((piece) => (
            <div
              key={piece.id}
              className="absolute w-3 h-3 animate-fall"
              style={{
                left: `${piece.left}%`,
                top: '-20px',
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
                backgroundColor: ['#FFD700', '#FF69B4', '#87CEEB', '#FFB6C1'][Math.floor(Math.random() * 4)],
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
              }}
            />
          ))}
        </div>
      )}

      <div className="bg-gradient-to-br from-cream-50 to-pink-50 rounded-3xl shadow-2xl p-8 max-w-md w-full relative animate-scale-in">
        <div className="text-center">
          {isWinner ? (
            <>
              <div className="mb-4 flex justify-center">
                <Sparkles className="w-16 h-16 text-yellow-500 animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold text-pink-600 mb-4">Congratulations!</h2>
              <div className="text-5xl mb-4">{prize.split(' ')[0]}</div>
              <p className="text-xl font-semibold text-gray-800 mb-6">
                You won: <span className="text-pink-600">{prize.substring(prize.indexOf(' ') + 1)}</span>
              </p>
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4 mb-6">
                <p className="text-sm text-gray-700 leading-relaxed">
                  Screenshot this and send it to <span className="font-bold">@Deliciosa</span> on Instagram or WhatsApp
                  to claim your gift!
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">😔</div>
              <h2 className="text-2xl font-bold text-gray-700 mb-4">Better Luck Next Time!</h2>
              <p className="text-gray-600 mb-6">
                Don't worry! Check out our delicious treats and place an order today.
              </p>
            </>
          )}

          <div className="space-y-3">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Follow @Deliciosa on Instagram
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Order Now on WhatsApp
            </a>
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-full transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
