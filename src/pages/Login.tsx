import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import BackgroundCarousel from '../components/BackgroundCarousel';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
      toast.success('¡Bienvenido de nuevo!');
    } catch (error) {
      toast.error('Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BackgroundCarousel>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-lg shadow-xl p-8">
            <div className="flex flex-col items-center gap-2 mb-8">
              <Link to="/" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold text-center">Iniciar Sesión en Libria</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to="/recover"
                  className="text-sm text-cyan-500 hover:text-cyan-400"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </BackgroundCarousel>
  );
}

export default Login;