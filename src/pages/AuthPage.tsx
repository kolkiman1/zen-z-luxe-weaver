import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { SEOHead } from '@/components/SEOHead';
import { useRateLimiter } from '@/hooks/useRateLimiter';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signupSchema = loginSchema.extend({
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters" }).max(100),
});

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  const [rateLimitWarning, setRateLimitWarning] = useState('');
  
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  
  // Rate limiting for login attempts (5 attempts per 15 minutes, 30 min lockout)
  const loginRateLimiter = useRateLimiter('login_attempts', {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000,
    lockoutMs: 30 * 60 * 1000,
  });

  // Check lockout status on mount
  useEffect(() => {
    const status = loginRateLimiter.getLockoutStatus();
    if (status.isLocked) {
      setRateLimitWarning(`Too many failed attempts. Please try again in ${status.remainingMinutes} minutes.`);
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setRateLimitWarning('');

    // Check rate limit before attempting login
    if (isLogin) {
      const { allowed, lockoutRemaining } = loginRateLimiter.checkRateLimit();
      if (!allowed) {
        setRateLimitWarning(`Too many failed attempts. Please try again in ${lockoutRemaining} minutes.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Validate input
      const schema = isLogin ? loginSchema : signupSchema;
      const data = isLogin ? { email, password } : { email, password, name };
      const validation = schema.safeParse(data);

      if (!validation.success) {
        const fieldErrors: typeof errors = {};
        validation.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof typeof errors] = err.message;
          }
        });
        setErrors(fieldErrors);
        setIsSubmitting(false);
        return;
      }

      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          // Record failed attempt
          const result = loginRateLimiter.recordAttempt(false);
          
          if (!result.allowed) {
            setRateLimitWarning(result.message);
          } else if (result.message) {
            setRateLimitWarning(result.message);
          }

          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid credentials', {
              description: 'Please check your email and password.',
            });
          } else {
            toast.error('Login failed', {
              description: error.message,
            });
          }
        } else {
          // Reset rate limiter on successful login
          loginRateLimiter.recordAttempt(true);
          toast.success('Welcome back!', {
            description: 'You have successfully logged in.',
          });
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password, name);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('Account exists', {
              description: 'This email is already registered. Please sign in.',
            });
          } else {
            toast.error('Sign up failed', {
              description: error.message,
            });
          }
        } else {
          toast.success('Account created!', {
            description: 'Welcome to Gen-zee.store!',
          });
          navigate('/');
        }
      }
    } catch (error) {
      toast.error('Something went wrong', {
        description: 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const lockoutStatus = loginRateLimiter.getLockoutStatus();

  return (
    <>
      <SEOHead
        title={isLogin ? 'Login' : 'Sign Up'}
        description="Sign in to your account or create a new one to enjoy premium fashion shopping."
        url="/auth"
      />

      <Header />

      <main className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="container-luxury">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-8 md:p-10 shadow-xl"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <Link to="/" className="inline-block mb-6">
                  <h1 className="font-display text-2xl">
                    <span className="text-primary">Gen</span>-zee
                  </h1>
                </Link>
                <h2 className="font-display text-2xl mb-2">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {isLogin
                    ? 'Sign in to access your account'
                    : 'Join us for exclusive access to premium fashion'}
                </p>
              </div>

              {/* Rate Limit Warning */}
              {(rateLimitWarning || lockoutStatus.isLocked) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3"
                >
                  <AlertTriangle size={20} className="text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Account Protected</p>
                    <p className="text-xs text-destructive/80 mt-1">
                      {rateLimitWarning || `Too many failed attempts. Please try again in ${lockoutStatus.remainingMinutes} minutes.`}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div>
                    <Label htmlFor="name" className="text-sm">Full Name</Label>
                    <div className="relative mt-1">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="pl-10"
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                  </div>
                )}

                <div>
                  <Label htmlFor="email" className="text-sm">Email Address</Label>
                  <div className="relative mt-1">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="pl-10"
                      disabled={isSubmitting || lockoutStatus.isLocked}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="password" className="text-sm">Password</Label>
                    {isLogin && (
                      <Link to="#" className="text-xs text-primary hover:underline">
                        Forgot Password?
                      </Link>
                    )}
                  </div>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      disabled={isSubmitting || lockoutStatus.isLocked}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
                </div>

                <Button 
                  type="submit" 
                  className="w-full btn-primary py-6 gap-2" 
                  disabled={isSubmitting || lockoutStatus.isLocked}
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : lockoutStatus.isLocked ? (
                    <>
                      <AlertTriangle size={18} />
                      Account Locked
                    </>
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight size={18} />
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              {/* Toggle */}
              <p className="text-center text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setErrors({});
                    setRateLimitWarning('');
                  }}
                  className="text-primary hover:underline ml-1 font-medium"
                  disabled={isSubmitting}
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default AuthPage;