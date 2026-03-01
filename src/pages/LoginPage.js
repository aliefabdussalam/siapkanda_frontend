import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { axiosInstance } from '@/App';
import { toast } from 'sonner';
import { Lock, Landmark } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.post('/auth/login', { password });
      if (response.data.success) {
        toast.success(response.data.message);
        onLogin();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen login-bg flex items-center justify-center p-4">
      <div className="login-overlay absolute inset-0"></div>
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8 border border-slate-200">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-emerald-100 p-4 rounded-full mb-4">
              <Landmark className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 text-center">
              Kementerian Transmigrasi
            </h1>
            <p className="text-slate-600 text-sm mt-2 text-center">
              Sistem Manajemen Arahan
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  data-testid="login-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <Button
              data-testid="login-submit-button"
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            <p>Password default: admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
