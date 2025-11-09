import { useState, useEffect } from 'react';
import { SpinForm } from './components/SpinForm';
import { SpinWheel } from './components/SpinWheel';
import { ResultModal } from './components/ResultModal';
import { FormData } from './types';
import { recordSpin } from './lib/supabase';
import { hasSpunBefore, markAsSpun } from './utils/storage';

function App() {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [prize, setPrize] = useState<string | null>(null);
  const [alreadySpun, setAlreadySpun] = useState(false);
  const [showWheel, setShowWheel] = useState(false);

  useEffect(() => {
    setAlreadySpun(hasSpunBefore());
  }, []);

  const handleFormSubmit = (data: FormData) => {
    setFormData(data);
    setShowWheel(true);
  };

  const handleSpinComplete = async (winningPrize: string) => {
    setPrize(winningPrize);
    markAsSpun();
    setAlreadySpun(true);

    if (formData) {
      await recordSpin({
        name: formData.name,
        phone: formData.phone,
        prize: winningPrize,
      });
    }
  };

  const handleCloseModal = () => {
    setPrize(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-100 via-pink-50 to-yellow-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500 mb-3 font-['Poppins']">
          Deliciosa Spin & Win
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 font-medium">
          One spin. Sweet rewards.
        </p>
      </div>

      {alreadySpun && !showWheel ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">😉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            You've already spun today!
          </h2>
          <p className="text-gray-600 mb-6">Come back next time for another chance to win amazing prizes!</p>
          <div className="space-y-3">
            <a
              href="https://instagram.com/deliciosa"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Follow @Deliciosa on Instagram
            </a>
            <a
              href="https://wa.me/1234567890?text=Hi%20Deliciosa!%20I%20want%20to%20place%20an%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Order Now on WhatsApp
            </a>
          </div>
        </div>
      ) : !showWheel ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🍰✨</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Ready to Win?</h2>
            <p className="text-gray-600">Enter your details to spin the wheel!</p>
          </div>
          <SpinForm onSubmit={handleFormSubmit} />
        </div>
      ) : (
        <SpinWheel onSpinComplete={handleSpinComplete} disabled={false} />
      )}

      {prize && <ResultModal prize={prize} onClose={handleCloseModal} />}

      <footer className="mt-12 text-center text-gray-600">
        <p className="text-sm">Made with love by Deliciosa</p>
      </footer>
    </div>
  );
}

export default App;
