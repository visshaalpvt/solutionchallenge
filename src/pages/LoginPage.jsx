import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, ArrowLeft, Shield, Users } from 'lucide-react';
import { signInWithGoogle } from '../services/authService';
import useAuthStore from '../stores/authStore';
import Button from '../components/ui/Button';

const LoginPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/volunteer/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSignIn = async () => {
    try {
      const userData = await signInWithGoogle();
      if (userData) {
        useAuthStore.getState().setUser(userData);
        navigate(userData.role === 'admin' ? '/admin/dashboard' : '/volunteer/dashboard');
      }
    } catch (err) {
      console.error('Login failed:', err);
      alert('Login failed: ' + (err.message || 'Unknown error. Check console.'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-100 rounded-full blur-[120px] opacity-60 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full blur-[120px] opacity-60 translate-x-1/2 translate-y-1/2" />

      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 items-center justify-center shadow-xl shadow-indigo-200 mb-6 mx-auto">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Welcome to SmartAlloc</h1>
          <p className="text-slate-500">Sign in to manage community impact.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="space-y-6">
            <button
              onClick={handleSignIn}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>

            <div className="relative flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Secure Access</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                <Shield className="w-5 h-5 text-indigo-500 mb-2" />
                <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider mb-1">Protected</p>
                <p className="text-[9px] text-slate-500 leading-tight">Firebase Secure Auth</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                <Users className="w-5 h-5 text-purple-500 mb-2" />
                <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider mb-1">Collaborative</p>
                <p className="text-[9px] text-slate-500 leading-tight">Team-based roles</p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400 leading-relaxed max-w-[280px] mx-auto">
          By signing in, you agree to our <a href="#" className="text-indigo-600 font-bold hover:underline">Community Terms</a> and <a href="#" className="text-indigo-600 font-bold hover:underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
