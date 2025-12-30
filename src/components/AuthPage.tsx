import { useState } from 'react';
import { User, Lock, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import '@/styles/auth-form.css';

interface AuthPageProps {
  onSuccess?: () => void;
}

const AuthPage = ({ onSuccess }: AuthPageProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: { full_name: registerName },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      toast({
        title: "Account created!",
        description: "Welcome to LegalCareAI.",
      });
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className={`auth-container ${isActive ? 'active' : ''}`}>
        {/* Curved shapes */}
        <div className="curved-shape"></div>
        <div className="curved-shape2"></div>

        {/* Login Form */}
        <div className="form-box login">
          <h2 className="animation" style={{ '--D': 0, '--S': 21 } as React.CSSProperties}>Login</h2>
          <form onSubmit={handleLogin}>
            <div className="input-box animation" style={{ '--D': 1, '--S': 22 } as React.CSSProperties}>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              <label>Email</label>
              <Mail className="input-icon" size={18} />
            </div>

            <div className="input-box animation" style={{ '--D': 2, '--S': 23 } as React.CSSProperties}>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <label>Password</label>
              <Lock className="input-icon" size={18} />
            </div>

            <div className="input-box animation" style={{ '--D': 3, '--S': 24 } as React.CSSProperties}>
              <button className="auth-btn" type="submit" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </div>

            <div className="regi-link animation" style={{ '--D': 4, '--S': 25 } as React.CSSProperties}>
              <p>Don't have an account? <br />
                <button type="button" className="link-btn" onClick={() => setIsActive(true)}>Sign Up</button>
              </p>
            </div>
          </form>
        </div>

        {/* Login Info */}
        <div className="info-content login">
          <h2 className="animation" style={{ '--D': 0, '--S': 20 } as React.CSSProperties}>WELCOME BACK!</h2>
          <p className="animation" style={{ '--D': 1, '--S': 21 } as React.CSSProperties}>
            We are happy to have you with us again. Get instant legal guidance powered by AI.
          </p>
        </div>

        {/* Register Form */}
        <div className="form-box register">
          <h2 className="animation" style={{ '--li': 17, '--S': 0 } as React.CSSProperties}>Register</h2>
          <form onSubmit={handleRegister}>
            <div className="input-box animation" style={{ '--li': 18, '--S': 1 } as React.CSSProperties}>
              <input
                type="text"
                required
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
              />
              <label>Full Name</label>
              <User className="input-icon" size={18} />
            </div>

            <div className="input-box animation" style={{ '--li': 19, '--S': 2 } as React.CSSProperties}>
              <input
                type="email"
                required
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
              />
              <label>Email</label>
              <Mail className="input-icon" size={18} />
            </div>

            <div className="input-box animation" style={{ '--li': 20, '--S': 3 } as React.CSSProperties}>
              <input
                type="password"
                required
                minLength={6}
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
              />
              <label>Password</label>
              <Lock className="input-icon" size={18} />
            </div>

            <div className="input-box animation" style={{ '--li': 21, '--S': 4 } as React.CSSProperties}>
              <button className="auth-btn" type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Register'}
              </button>
            </div>

            <div className="regi-link animation" style={{ '--li': 22, '--S': 5 } as React.CSSProperties}>
              <p>Already have an account? <br />
                <button type="button" className="link-btn" onClick={() => setIsActive(false)}>Sign In</button>
              </p>
            </div>
          </form>
        </div>

        {/* Register Info */}
        <div className="info-content register">
          <h2 className="animation" style={{ '--li': 17, '--S': 0 } as React.CSSProperties}>WELCOME!</h2>
          <p className="animation" style={{ '--li': 18, '--S': 1 } as React.CSSProperties}>
            Join LegalCareAI and get instant access to AI-powered legal guidance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
