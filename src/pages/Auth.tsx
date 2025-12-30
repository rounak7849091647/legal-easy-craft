import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scale, Mail, Lock, User, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';

// Validation schemas
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
    // Check for reset mode from URL
    const urlMode = searchParams.get('mode');
    if (urlMode === 'reset') {
      setMode('reset');
    }
  }, [searchParams]);

  useEffect(() => {
    // Redirect if already logged in
    if (user && !authLoading) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }

    if (mode !== 'forgot') {
      try {
        passwordSchema.parse(password);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.password = e.errors[0].message;
        }
      }
    }

    if (mode === 'signup') {
      try {
        nameSchema.parse(fullName);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.fullName = e.errors[0].message;
        }
      }
    }

    if (mode === 'reset') {
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

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
        if (error) {
          setErrors({ form: getErrorMessage(error.message) });
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setErrors({ form: getErrorMessage(error.message) });
        } else {
          setEmailSent(true);
          setMode('verify');
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          setErrors({ form: getErrorMessage(error.message) });
        } else {
          setEmailSent(true);
        }
      } else if (mode === 'reset') {
        const { error } = await updatePassword(password);
        if (error) {
          setErrors({ form: getErrorMessage(error.message) });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (message: string): string => {
    if (message.includes('already registered')) {
      return 'This email is already registered. Please sign in instead.';
    }
    if (message.includes('Invalid login')) {
      return 'Invalid email or password. Please try again.';
    }
    if (message.includes('Email not confirmed')) {
      return 'Please verify your email before signing in.';
    }
    return message;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMDA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and back button */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </button>
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-primary" />
            <span className="font-serif text-xl font-semibold">LawCare</span>
          </div>
        </div>

        {/* Verification Success Screen */}
        {mode === 'verify' && emailSent && (
          <Card className="border-border/50 shadow-xl">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl mb-2">Check your email</CardTitle>
              <CardDescription className="mb-6">
                We've sent a verification link to <strong>{email}</strong>. 
                Please check your inbox and click the link to verify your account.
              </CardDescription>
              <Button 
                variant="outline" 
                onClick={() => { setMode('login'); setEmailSent(false); }}
                className="w-full"
              >
                Back to Sign In
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Forgot Password Email Sent */}
        {mode === 'forgot' && emailSent && (
          <Card className="border-border/50 shadow-xl">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl mb-2">Check your email</CardTitle>
              <CardDescription className="mb-6">
                We've sent password reset instructions to <strong>{email}</strong>.
              </CardDescription>
              <Button 
                variant="outline" 
                onClick={() => { setMode('login'); setEmailSent(false); }}
                className="w-full"
              >
                Back to Sign In
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Reset Password Form */}
        {mode === 'reset' && (
          <Card className="border-border/50 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Reset Password</CardTitle>
              <CardDescription>Enter your new password below</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="pl-10"
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-destructive text-sm">{errors.confirmPassword}</p>}
                </div>

                {errors.form && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                    {errors.form}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Forgot Password Form */}
        {mode === 'forgot' && !emailSent && (
          <Card className="border-border/50 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Forgot Password?</CardTitle>
              <CardDescription>Enter your email and we'll send you reset instructions</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="pl-10"
                    />
                  </div>
                  {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
                </div>

                {errors.form && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                    {errors.form}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>

                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setMode('login')}
                >
                  Back to Sign In
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Login/Signup Forms */}
        {(mode === 'login' || mode === 'signup') && !emailSent && (
          <Card className="border-border/50 shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Welcome to LawCare</CardTitle>
              <CardDescription>Your AI-powered legal assistant</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={mode} onValueChange={(v) => { setMode(v as AuthMode); setErrors({}); }}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="pl-10"
                        />
                      </div>
                      {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Password</Label>
                        <button
                          type="button"
                          onClick={() => setMode('forgot')}
                          className="text-sm text-primary hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
                    </div>

                    {errors.form && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                        {errors.form}
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                          className="pl-10"
                        />
                      </div>
                      {errors.fullName && <p className="text-destructive text-sm">{errors.fullName}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="pl-10"
                        />
                      </div>
                      {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create a password (min 8 characters)"
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
                    </div>

                    {errors.form && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                        {errors.form}
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      By signing up, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Auth;
