import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    setIsSubmitting(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setIsSubmitting(true);
    const result = await loginWithGoogle(credentialResponse.credential);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-6 font-['DM_Sans']">
      <div className="w-full max-w-md mus-panel p-10 bg-[var(--bg-surface)]">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-[var(--accent)] border-2 border-[var(--border-dark)] rounded-2xl flex items-center justify-center shadow-[var(--shadow-md)] mb-4">
            <span className="font-bold text-3xl">C</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight">Welcome Back</h2>
          <p className="text-[var(--text-muted)] font-bold text-sm mt-2">Enter your details to continue</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          {error && (
            <div className="p-3 bg-red-100 border border-red-200 text-[var(--danger)] text-xs font-bold rounded-lg leading-relaxed">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label className="mus-tool-label">Email Address</label>
            <input 
              type="email" 
              placeholder="alex@example.com"
              className="mus-tool-input !pl-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="mus-tool-label">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="mus-tool-input !pl-4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="mus-button-amber py-4 font-black text-lg mt-4 shadow-[var(--shadow-sm)] disabled:opacity-50"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="relative my-4">
             <div className="absolute inset-0 flex items-center">
               <div className="w-full border-t border-[var(--border-light)]"></div>
             </div>
             <div className="relative flex justify-center text-xs font-bold uppercase">
               <span className="bg-[var(--bg-surface)] px-2 text-[var(--text-muted)]">Or continue with</span>
             </div>
           </div>

           <div className="flex justify-center">
             <GoogleLogin
               onSuccess={handleGoogleSuccess}
               onError={() => setError('Google Sign-In failed')}
               useOneTap
               theme="filled_black"
               shape="pill"
             />
           </div>
        </form>

        <p className="text-center mt-8 text-[var(--text-muted)] font-bold text-sm">
          Don't have an account? <Link to="/register" className="text-[var(--text-primary)] hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
