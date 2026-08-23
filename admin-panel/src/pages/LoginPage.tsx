import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('access_token', res.data.access_token);
      navigate('/tickets');
    } catch {
      setError('Email veya şifre hatalı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex">

      {/* Sol sütun — Koyu panel (mobilde gizli) */}
      <div className="hidden md:flex flex-1 bg-gray-900 items-center justify-center px-12">
        <div>
          <p className="text-xs text-gray-500 tracking-widest mb-3">
            DESTEK SİSTEMİ ADMİN PANELİ
          </p>
          <p className="text-xl text-gray-200 font-normal leading-snug">
            Teknik destek taleplerini buradan yönetin.
          </p>
        </div>
      </div>

      {/* Sağ sütun — Login formu */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-8">
        <div className="w-full max-w-sm">

          {/* Başlık */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-gray-900">Giriş Yap</h1>
            <p className="text-base text-gray-500 mt-1">Hesabınıza erişmek için giriş yapın.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-base text-gray-600 mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="admin@example.com"
              />
            </div>

            {/* Şifre */}
            <div>
              <label className="block text-base text-gray-600 mb-1.5" htmlFor="password">
                Şifre
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {/* Hata mesajı */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-base rounded-lg p-3">
                {error}
              </div>
            )}

            {/* Giriş butonu */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5c642a] text-white text-base font-medium py-2.5 rounded-lg hover:bg-[#4a5022] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
