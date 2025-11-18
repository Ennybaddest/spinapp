import { useState, useEffect } from "react";
import { SpinForm } from "./components/SpinForm";
import { SpinWheel } from "./components/SpinWheel";
import { ResultModal } from "./components/ResultModal";
import { FormData } from "./types";
import { useSpinLogic } from "./hooks/useSpinLogic";

const RESULT_DISPLAY_DURATION = 5000;

function App() {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [showWheel, setShowWheel] = useState(false);
  const [resultPrize, setResultPrize] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const spinLogic = useSpinLogic(phoneNumber);

  const handleFormSubmit = async (data: FormData) => {
    setFormError(null);
    setPhoneNumber(data.phone);
    setUserName(data.name);
    await spinLogic.checkSpinHistory();
  };

  useEffect(() => {
    if (spinLogic.isLoading) return;

    if (spinLogic.error) {
      setFormError(spinLogic.error);
      return;
    }

    if (spinLogic.hasSpun && spinLogic.lastPrize) {
      setResultPrize(spinLogic.lastPrize);
      return;
    }

    if (phoneNumber && !spinLogic.hasSpun) {
      setShowWheel(true);
    }
  }, [spinLogic.hasSpun, spinLogic.isLoading, spinLogic.lastPrize, spinLogic.error, phoneNumber]);

  const handleSpinComplete = async (winningPrize: string) => {
    setResultPrize(winningPrize);
    if (userName) {
      await spinLogic.recordNewSpin(userName, winningPrize);
    }

    setTimeout(() => {
      window.location.href = "/";
    }, RESULT_DISPLAY_DURATION);
  };

  const handleTryDifferentNumber = () => {
    spinLogic.reset();
    setPhoneNumber(null);
    setUserName(null);
    setShowWheel(false);
    setResultPrize(null);
    setFormError(null);
  };

  const handleResultModalClose = () => {
    setResultPrize(null);
    handleTryDifferentNumber();
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

      {spinLogic.hasSpun && spinLogic.lastPrize ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🍰✨</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Already Spun!
            </h2>
          </div>
          <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            <p className="text-yellow-800 font-semibold mb-2">
              This phone number has already spun!
            </p>
            <div className="bg-white p-3 rounded mb-3 text-center">
              <p className="text-sm text-gray-600 mb-1">Your previous prize:</p>
              <p className="text-xl font-bold text-yellow-700">{spinLogic.lastPrize}</p>
            </div>
            <p className="text-yellow-700 text-sm mb-3">
              Each phone number gets only one spin. Try with a different phone number.
            </p>
            <button
              onClick={handleTryDifferentNumber}
              className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-semibold transition"
            >
              Use Different Number
            </button>
          </div>
        </div>
      ) : showWheel ? (
        <SpinWheel onSpinComplete={handleSpinComplete} disabled={false} />
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🍰✨</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Ready to Win?
            </h2>
            <p className="text-gray-600">
              Enter your details to spin the wheel!
            </p>
          </div>
          {formError && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <p className="text-red-800 font-semibold text-sm">{formError}</p>
            </div>
          )}
          <SpinForm onSubmit={handleFormSubmit} />
        </div>
      )}

      {resultPrize && <ResultModal prize={resultPrize} onClose={handleResultModalClose} />}

      <footer className="mt-12 text-center text-gray-600">
        <p className="text-sm">Made with love by Deliciosa</p>
      </footer>
    </div>
  );
}

export default App;
