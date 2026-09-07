import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ApiError } from '../api/client';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Sparkles, Server, Zap, UserPlus, Check } from 'lucide-react';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, register, coldStartActive } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Default pre-fill with real verified admin credentials
  const [email, setEmail] = useState('admin@iims.com');
  const [password, setPassword] = useState('Admin@123');
  const [preferredRole, setPreferredRole] = useState<UserRole>('ADMIN');
  const [autoRegisterOnFail, setAutoRegisterOnFail] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [canAutoRegister, setCanAutoRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setCanAutoRegister(false);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMsg('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(cleanEmail, password, preferredRole);
      toast.success('Authentication Successful', `Welcome back, ${cleanEmail}`);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error', err);
      if (err instanceof ApiError) {
        if (err.status === 401) {
          // If auto-register is enabled, try creating the account on the fly
          if (autoRegisterOnFail && password.length >= 6) {
            try {
              setIsRegistering(true);
              await register(cleanEmail, password);
              toast.success('Account Created & Signed In', `Auto-registered ${cleanEmail} and logged in.`);
              navigate('/dashboard');
              return;
            } catch (regErr: any) {
              console.warn('Auto-register failed, prompting manual user action', regErr);
              setErrorMsg('Invalid email or password. This email may not be registered on the backend yet.');
              setCanAutoRegister(true);
            } finally {
              setIsRegistering(false);
            }
          } else {
            setErrorMsg('Invalid email or password. This email may not be registered on the backend yet.');
            setCanAutoRegister(true);
          }
        } else if (err.status === 0) {
          setErrorMsg('Connecting to Render backend. Container may be warming up—please retry in a few seconds.');
        } else if (err.message?.includes('non unique result')) {
          setErrorMsg('Backend database conflict for this email. Please use one of the verified demo accounts below.');
        } else {
          setErrorMsg(err.message || 'Login failed.');
        }
      } else {
        setErrorMsg('Network error connecting to backend.');
      }
      toast.error('Authentication Failed', err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualRegisterAndLogin = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) return;
    setIsRegistering(true);
    setErrorMsg(null);
    try {
      await register(cleanEmail, password);
      toast.success('Account Created & Signed In', `Successfully registered ${cleanEmail} and logged in.`);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create account. Email may already exist.');
      toast.error('Registration Failed', err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleQuickFill = (accEmail: string, accPassword: string, accRole: UserRole) => {
    setEmail(accEmail);
    setPassword(accPassword);
    setPreferredRole(accRole);
    setErrorMsg(null);
    setCanAutoRegister(false);
  };

  const handleDirectSignIn = async (accEmail: string, accPassword: string, accRole: UserRole) => {
    setEmail(accEmail);
    setPassword(accPassword);
    setPreferredRole(accRole);
    setErrorMsg(null);
    setCanAutoRegister(false);
    setIsLoading(true);

    try {
      await login(accEmail, accPassword, accRole);
      toast.success('Authentication Successful', `Signed in as ${accRole} (${accEmail})`);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Direct login error', err);
      setErrorMsg(err.message || 'Sign in failed. Check credentials.');
      toast.error('Authentication Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Subtle background ambient glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

      {coldStartActive && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-indigo-950 border-b border-indigo-500/40 p-2.5 text-center text-xs text-indigo-200 flex items-center justify-center gap-2">
          <Server className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Spring Boot container on Render is warming up. Initial response may take 20–30 seconds...</span>
        </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 p-0.5 shadow-xl shadow-indigo-950/60 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-white tracking-tight font-mono">
            IIMS PLATFORM
          </h2>
          <p className="mt-1 text-xs text-slate-400 max-w-xs">
            Intelligent Incident &amp; Service Management System connected to live Spring Boot backend
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-8 bg-slate-900/90 border border-slate-800/90 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-md">
          {/* Instant 1-Click Demo Login Banner */}
          <div className="mb-5 p-3 rounded-xl bg-gradient-to-r from-indigo-950/70 to-slate-900 border border-indigo-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-indigo-200">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-semibold text-white">Instant Admin Access</span>
                <p className="text-[11px] text-slate-400">One-click login with verified Admin account</p>
              </div>
            </div>
            <button
              id="instant-demo-login-btn"
              type="button"
              disabled={isLoading || isRegistering}
              onClick={() => handleDirectSignIn('admin@iims.com', 'Admin@123', 'ADMIN')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition-all shrink-0 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {isLoading && email === 'admin@iims.com' ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>Quick Login</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 space-y-2">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{errorMsg}</div>
                </div>

                {canAutoRegister && (
                  <div className="pt-2 border-t border-rose-800/40 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-rose-300">
                      Want to create an account for <code className="text-white font-mono">{email}</code>?
                    </span>
                    <button
                      type="button"
                      disabled={isRegistering}
                      onClick={handleManualRegisterAndLogin}
                      className="px-2.5 py-1 bg-rose-700 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      {isRegistering ? (
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <UserPlus className="w-3 h-3" />
                      )}
                      <span>Register &amp; Sign In</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@iims.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Auto-register toggle */}
            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={autoRegisterOnFail}
                  onChange={(e) => setAutoRegisterOnFail(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-950 cursor-pointer"
                />
                <span>Auto-create account if not registered yet</span>
              </label>
            </div>

            {/* Preferred Role Persona Preview */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Role Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['ADMIN', 'ENGINEER', 'USER'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setPreferredRole(r)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      preferredRole === r
                        ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading || isRegistering}
              className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading || isRegistering ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isRegistering ? 'Creating Account & Signing In...' : 'Authenticating with Backend...'}</span>
                </>
              ) : (
                <>
                  <span>Sign In to IIMS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick-fill Demo accounts */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2.5">
              <span className="flex items-center gap-1 font-medium text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Verified Active Accounts:
              </span>
              <span className="text-[10px] text-slate-500">Instant 1-Click Access</span>
            </div>

            <div className="space-y-2">
              {/* Real Admin Account */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="min-w-0 flex-1 mr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-white truncate font-mono">admin@iims.com</span>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                      ADMIN
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">Password: Admin@123</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin@iims.com', 'Admin@123', 'ADMIN')}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-lg transition-colors cursor-pointer"
                  >
                    Fill
                  </button>
                  <button
                    type="button"
                    disabled={isLoading || isRegistering}
                    onClick={() => handleDirectSignIn('admin@iims.com', 'Admin@123', 'ADMIN')}
                    className="px-2.5 py-1 bg-indigo-600/80 hover:bg-indigo-600 text-white text-[11px] font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3 text-amber-300" /> Sign In
                  </button>
                </div>
              </div>

              {/* Real User Account */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="min-w-0 flex-1 mr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-white truncate font-mono">admin@test.com</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      USER
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">Password: password123</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin@test.com', 'password123', 'USER')}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-lg transition-colors cursor-pointer"
                  >
                    Fill
                  </button>
                  <button
                    type="button"
                    disabled={isLoading || isRegistering}
                    onClick={() => handleDirectSignIn('admin@test.com', 'password123', 'USER')}
                    className="px-2.5 py-1 bg-emerald-600/80 hover:bg-emerald-600 text-white text-[11px] font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3 text-emerald-200" /> Sign In
                  </button>
                </div>
              </div>

              {/* Real Engineer Account */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="min-w-0 flex-1 mr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-white truncate font-mono">engineer_demo@iims.com</span>
                    <span className="text-[10px] font-bold text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-500/30">
                      ENGINEER
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">Password: Password123!</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('engineer_demo@iims.com', 'Password123!', 'ENGINEER')}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-lg transition-colors cursor-pointer"
                  >
                    Fill
                  </button>
                  <button
                    type="button"
                    disabled={isLoading || isRegistering}
                    onClick={() => handleDirectSignIn('engineer_demo@iims.com', 'Password123!', 'ENGINEER')}
                    className="px-2.5 py-1 bg-sky-600/80 hover:bg-sky-600 text-white text-[11px] font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3 text-sky-200" /> Sign In
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Registration link */}
          <div className="mt-5 text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Register new user
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-[11px] text-slate-500">
          Connected to <code className="text-slate-400 font-mono">intelligent-incident-management.onrender.com</code>
        </div>
      </div>
    </div>
  );
};
