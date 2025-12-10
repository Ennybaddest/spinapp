import { useState } from 'react';
import { FormData } from '../types';

interface SpinFormProps {
  onSubmit: (data: FormData) => Promise<void>;
}

export function SpinForm({ onSubmit }: SpinFormProps) {
  const [formData, setFormData] = useState<FormData>({ name: '', phone: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [nameError, setNameError] = useState('');

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(\+\d{1,3}[- ]?\d{1,12}|0\d{9,10})$/;
    const digitsOnly = phone.replace(/[- ]/g, '');
    const isValidLength = digitsOnly.length >= 10 && digitsOnly.length <= 15;
    return phoneRegex.test(phone) && isValidLength;
  };

  const validateName = (name: string): boolean => {
    const trimmed = name.trim();
    return trimmed.length > 0 && trimmed.length <= 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    setNameError('');

    const trimmedName = formData.name.trim();
    const trimmedPhone = formData.phone.trim();

    if (!trimmedName) {
      setNameError('Name is required');
      return;
    }

    if (!validateName(formData.name)) {
      setNameError('Name must be between 1 and 100 characters');
      return;
    }

    if (!trimmedPhone) {
      setPhoneError('Phone number is required');
      return;
    }

    if (!validatePhone(trimmedPhone)) {
      setPhoneError('Enter a valid phone number (e.g., 05552459307 or +15552459307)');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({ name: trimmedName, phone: trimmedPhone });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            maxLength={100}
            className={`w-full px-6 py-4 rounded-full border-2 focus:outline-none text-lg bg-white/90 backdrop-blur-sm transition ${
              nameError
                ? 'border-red-400 focus:border-red-500'
                : 'border-pink-200 focus:border-pink-400'
            }`}
            required
          />
          {nameError && (
            <p className="text-red-600 text-sm mt-2 font-semibold">{nameError}</p>
          )}
        </div>
        <div>
          <input
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={`w-full px-6 py-4 rounded-full border-2 focus:outline-none text-lg bg-white/90 backdrop-blur-sm transition ${
              phoneError
                ? 'border-red-400 focus:border-red-500'
                : 'border-pink-200 focus:border-pink-400'
            }`}
            required
          />
          {phoneError && (
            <p className="text-red-600 text-sm mt-2 font-semibold">{phoneError}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold text-xl rounded-full shadow-lg transform hover:scale-105 disabled:scale-100 transition-all duration-200"
        >
          {isLoading ? 'Checking...' : 'Ready to Spin!'}
        </button>
      </form>
    </div>
  );
}
