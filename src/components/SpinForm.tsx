import { useState } from 'react';
import { FormData } from '../types';

interface SpinFormProps {
  onSubmit: (data: FormData) => void;
}

export function SpinForm({ onSubmit }: SpinFormProps) {
  const [formData, setFormData] = useState<FormData>({ name: '', phone: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.phone.trim()) {
      onSubmit(formData);
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
            className="w-full px-6 py-4 rounded-full border-2 border-pink-200 focus:border-pink-400 focus:outline-none text-lg bg-white/90 backdrop-blur-sm"
            required
          />
        </div>
        <div>
          <input
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-6 py-4 rounded-full border-2 border-pink-200 focus:border-pink-400 focus:outline-none text-lg bg-white/90 backdrop-blur-sm"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white font-bold text-xl rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          Ready to Spin!
        </button>
      </form>
    </div>
  );
}
