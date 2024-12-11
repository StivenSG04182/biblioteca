import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Key, Lock } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import BackgroundCarousel from '../components/BackgroundCarousel';

function RecoverAccount() {
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { recoverAccount, verifyCode, resetPassword } = useAuthStore();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await recoverAccount(email);
      setStep('code');
      toast.success('Código de recuperación enviado a tu correo');
    } catch (error) {
      toast.error('Correo no encontrado');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const isValid = await verifyCode(email, code);
      if (isValid) {
        setStep('password');
      } else {
        toast.error('Código inválido');
      }
    } catch (error) {
      toast.error('Error al verificar el código');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await resetPassword(email, code, newPassword);
      toast.success('Contraseña actualizada exitosamente');
      window.location.href = '/login';
    } catch (error) {
      toast.error('Error al restablecer la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BackgroundCarousel>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-lg shadow-xl p-8">
            <div className="flex items-center gap-2 mb-8">
              <Link to="/login" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold">Recuperar Cuenta</h1>
            </div>

            {step === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="tu@ejemplo.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Enviando...' : 'Enviar Código de Recuperación'}
                </button>
              </form>
            )}

            {step === 'code' && (
              <form onSubmit={handleCodeSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Código de Recuperación
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Ingresa el código de 6 dígitos"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Verificando...' : 'Verificar Código'}
                </button>
              </form>
            )}

            {step === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Ingresa tu nueva contraseña"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </BackgroundCarousel>
  );
}

export default RecoverAccount;