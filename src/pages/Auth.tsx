import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Scale, Mail, Lock, User, ArrowLeft, CheckCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset' | 'verify';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signUp, signIn, resetPassword, updatePassword, isLoading: authLoading } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'reset') setMode('reset');
  }, [searchParams]);

  useEffect(() => {
    if (user && !authLoading) navigate('/dashboard');
  }, [user, authLoading, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    try { emailSchema.parse(email); } catch (e) { if (e instanceof z.ZodError) newErrors.email = e.errors[0].message; }
    if (mode !== 'forgot') {
      try { passwordSchema.parse(password); } catch (e) { if (e instanceof z.ZodError) newErrors.password = e.errors[0].message; }
    }
    if (mode === 'signup') {
      try { nameSchema.parse(fullName); } catch (e) { if (e instanceof z.ZodError) newErrors.fullName = e.errors[0].message; }
    }
    if (mode === 'reset' && password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) setErrors({ form: getErrorMessage(error.message) });
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password, fullName);
        if (error) setErrors({ form: getErrorMessage(error.message) });
        else { setEmailSent(true); setMode('verify'); }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) setErrors({ form: getErrorMessage(error.message) });
        else setEmailSent(true);
      } else if (mode === 'reset') {
        const { error } = await updatePassword(password);
        if (error) setErrors({ form: getErrorMessage(error.message) });
      }
    } finally { setIsLoading(false); }
  };

  const getErrorMessage = (message: string): string => {
    if (message.includes('already registered')) return 'This email is already registered. Please sign in instead.';
    if (message.includes('Invalid login')) return 'Invalid email or password. Please try again.';
    if (message.includes('Email not confirmed')) return 'Please verify your email before signing in.';
    return message;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-400/3 rounded-full blur-[150px]" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(251,191,36,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-6 lg:p-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Scale className="w-5 h-5 text-black" />
            </div>
            <span className="font-serif text-xl font-bold text-white">LawCare</span>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[420px]">
            
            {/* Success states */}
            {(mode === 'verify' || (mode === 'forgot' && emailSent)) && (
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-8 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-full blur-xl" />
                  <div className="relative w-full h-full bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-full border border-amber-500/20 flex items-center justify-center">
                    {mode === 'verify' ? <CheckCircle className="w-10 h-10 text-amber-500" /> : <Mail className="w-10 h-10 text-amber-500" />}
                  </div>
                </div>
                <h1 className="text-3xl font-serif font-bold text-white mb-4">Check your inbox</h1>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  {mode === 'verify' 
                    ? <>We've sent a verification link to <span className="text-amber-500">{email}</span></>
                    : <>Password reset instructions sent to <span className="text-amber-500">{email}</span></>
                  }
                </p>
                <Button 
                  onClick={() => { setMode('login'); setEmailSent(false); }}
                  variant="outline"
                  className="w-full h-12 bg-transparent border-gray-700 text-white hover:bg-gray-800 hover:border-gray-600"
                >
                  Back to Sign In
                </Button>
              </div>
            )}

            {/* Reset Password Form */}
            {mode === 'reset' && (
              <div>
                <div className="text-center mb-10">
                  <h1 className="text-4xl font-serif font-bold text-white mb-3">New Password</h1>
                  <p className="text-gray-400">Create a strong password for your account</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Password</label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="h-14 pl-12 pr-12 bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-600 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="h-14 pl-12 bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-600 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl"
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-red-400 text-sm">{errors.confirmPassword}</p>}
                  </div>

                  {errors.form && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{errors.form}</div>}

                  <Button type="submit" disabled={isLoading} className="w-full h-14 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/30">
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </form>
              </div>
            )}

            {/* Forgot Password Form */}
            {mode === 'forgot' && !emailSent && (
              <div>
                <div className="text-center mb-10">
                  <h1 className="text-4xl font-serif font-bold text-white mb-3">Reset Password</h1>
                  <p className="text-gray-400">Enter your email to receive reset instructions</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Email Address</label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="h-14 pl-12 bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-600 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl"
                        />
                      </div>
                    </div>
                    {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                  </div>

                  {errors.form && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{errors.form}</div>}

                  <Button type="submit" disabled={isLoading} className="w-full h-14 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-xl shadow-lg shadow-amber-500/20">
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>

                  <button type="button" onClick={() => setMode('login')} className="w-full text-center text-gray-400 hover:text-white text-sm transition-colors">
                    ← Back to Sign In
                  </button>
                </form>
              </div>
            )}

            {/* Login Form */}
            {mode === 'login' && !emailSent && (
              <div>
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-6">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-amber-500">AI-Powered Legal Assistant</span>
                  </div>
                  <h1 className="text-4xl font-serif font-bold text-white mb-3">Welcome Back</h1>
                  <p className="text-gray-400">Sign in to continue to your dashboard</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Email Address</label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="h-14 pl-12 bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-600 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl"
                        />
                      </div>
                    </div>
                    {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Password</label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="h-14 pl-12 pr-12 bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-600 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
                    <div className="flex justify-end pt-1">
                      <button type="button" onClick={() => setMode('forgot')} className="text-sm text-amber-500 hover:text-amber-400 transition-colors">
                        Forgot password?
                      </button>
                    </div>
                  </div>

                  {errors.form && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{errors.form}</div>}

                  <Button type="submit" disabled={isLoading} className="w-full h-14 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/30 hover:scale-[1.02]">
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>

                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-800" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-4 text-sm text-gray-500 bg-[#0a0a0f]">or</span>
                    </div>
                  </div>

                  <p className="text-center text-gray-400">
                    Don't have an account?{' '}
                    <button type="button" onClick={() => { setMode('signup'); setErrors({}); }} className="text-amber-500 hover:text-amber-400 font-medium transition-colors">
                      Create one
                    </button>
                  </p>
                </form>
              </div>
            )}

            {/* Signup Form */}
            {mode === 'signup' && !emailSent && (
              <div>
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-6">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-amber-500">Start Free Today</span>
                  </div>
                  <h1 className="text-4xl font-serif font-bold text-white mb-3">Create Account</h1>
                  <p className="text-gray-400">Get started with your AI legal assistant</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Full Name</label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <Input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="John Doe"
                          className="h-14 pl-12 bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-600 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl"
                        />
                      </div>
                    </div>
                    {errors.fullName && <p className="text-red-400 text-sm">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Email Address</label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="h-14 pl-12 bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-600 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl"
                        />
                      </div>
                    </div>
                    {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Password</label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min. 8 characters"
                          className="h-14 pl-12 pr-12 bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-600 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
                  </div>

                  {errors.form && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{errors.form}</div>}

                  <Button type="submit" disabled={isLoading} className="w-full h-14 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/30 hover:scale-[1.02]">
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By signing up, you agree to our Terms of Service and Privacy Policy
                  </p>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-800" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-4 text-sm text-gray-500 bg-[#0a0a0f]">or</span>
                    </div>
                  </div>

                  <p className="text-center text-gray-400">
                    Already have an account?{' '}
                    <button type="button" onClick={() => { setMode('login'); setErrors({}); }} className="text-amber-500 hover:text-amber-400 font-medium transition-colors">
                      Sign in
                    </button>
                  </p>
                </form>
              </div>
            )}

          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center">
          <p className="text-xs text-gray-600">© 2024 LawCare. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Auth;
