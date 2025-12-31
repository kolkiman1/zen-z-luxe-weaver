import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordStrength } from '@/components/ui/password-strength';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const emailSchema = z.string().trim().email({ message: "Invalid email address" });
const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters" });

const ForgotPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isRecoveryFromUrl = () => {
    const search = new URLSearchParams(window.location.search);
    const type = search.get('type');
    const accessToken = search.get('access_token');

    const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
    const hashType = hashParams.get('type');
    const hashAccessToken = hashParams.get('access_token');

    return type === 'recovery' || !!accessToken || hashType === 'recovery' || !!hashAccessToken;
  };

  // Determine mode based on URL params (reset token present = update password mode)
  const [mode, setMode] = useState<'request' | 'reset' | 'success'>(() =>
    isRecoveryFromUrl() ? 'reset' : 'request'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  // Ensure we enter reset mode when arriving from an email recovery link
  useEffect(() => {
    if (isRecoveryFromUrl()) {
      setMode('reset');
    }
  }, [searchParams]);

  // Redirect if already logged in (but NEVER during password recovery flow)
  useEffect(() => {
    if (user && !isRecoveryFromUrl()) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate email
    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      setErrors({ email: validation.error.errors[0].message });
      return;
    }

    setIsSubmitting(true);

    try {
      // Use production domain for password reset redirect
      const productionDomain = 'https://gen-zee.store';
      const response = await supabase.functions.invoke('password-reset', {
        body: {
          email: email.trim().toLowerCase(),
          redirectUrl: `${productionDomain}/forgot-password`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setMode('success');
      toast.success('Check your email', {
        description: 'If an account exists, a password reset link has been sent.',
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error('Something went wrong', {
        description: 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate password
    const passwordValidation = passwordSchema.safeParse(password);
    if (!passwordValidation.success) {
      setErrors({ password: passwordValidation.error.errors[0].message });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords don't match" });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      // Send password change alert email
      try {
        const userEmail = user?.email;
        if (userEmail) {
          await supabase.functions.invoke('password-changed-alert', {
            body: {
              email: userEmail,
              changeMethod: 'reset',
            },
          });
        }
      } catch (alertError) {
        console.error('Failed to send password change alert:', alertError);
      }

      toast.success('Password updated!', {
        description: 'You are now signed in with your new password.',
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Password update error:', error);
      toast.error('Failed to update password', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Reset Password"
        description="Reset your Gen-zee Store account password."
        url="/forgot-password"
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
                
                {mode === 'request' && (
                  <>
                    <h2 className="font-display text-2xl mb-2">Forgot Password?</h2>
                    <p className="text-muted-foreground text-sm">
                      Enter your email and we'll send you a reset link
                    </p>
                  </>
                )}
                
                {mode === 'reset' && (
                  <>
                    <h2 className="font-display text-2xl mb-2">Create New Password</h2>
                    <p className="text-muted-foreground text-sm">
                      Enter your new password below
                    </p>
                  </>
                )}
                
                {mode === 'success' && (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center"
                    >
                      <CheckCircle size={32} className="text-primary" />
                    </motion.div>
                    <h2 className="font-display text-2xl mb-2">Check Your Email</h2>
                    <p className="text-muted-foreground text-sm">
                      We've sent a password reset link to <strong>{email}</strong>
                    </p>
                  </>
                )}
              </div>

              {/* Request Reset Form */}
              {mode === 'request' && (
                <form onSubmit={handleRequestReset} className="space-y-5">
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
                        disabled={isSubmitting}
                        autoFocus
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                  </div>

                  <Button type="submit" className="w-full btn-primary py-6 gap-2" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRight size={18} />
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Reset Password Form */}
              {mode === 'reset' && (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <Label htmlFor="password" className="text-sm">New Password</Label>
                    <div className="relative mt-1">
                      <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="pl-10 pr-10"
                        disabled={isSubmitting}
                        autoFocus
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
                    <PasswordStrength password={password} className="mt-3" />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                    <div className="relative mt-1">
                      <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="pl-10"
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>}
                  </div>

                  <Button type="submit" className="w-full btn-primary py-6 gap-2" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        Update Password
                        <ArrowRight size={18} />
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Success State */}
              {mode === 'success' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full py-6"
                    onClick={() => setMode('request')}
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to Sign In
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ForgotPasswordPage;