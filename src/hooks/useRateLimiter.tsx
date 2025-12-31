import { useState, useCallback } from 'react';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  lockoutMs: number;
}

interface RateLimitState {
  attempts: number;
  firstAttemptTime: number;
  lockoutUntil: number | null;
}

const defaultConfig: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  lockoutMs: 30 * 60 * 1000, // 30 minutes lockout
};

const getStorageKey = (key: string) => `rateLimit_${key}`;

const getState = (key: string): RateLimitState => {
  try {
    const stored = localStorage.getItem(getStorageKey(key));
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parsing errors
  }
  return { attempts: 0, firstAttemptTime: 0, lockoutUntil: null };
};

const setState = (key: string, state: RateLimitState) => {
  try {
    localStorage.setItem(getStorageKey(key), JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
};

export const useRateLimiter = (key: string, config: Partial<RateLimitConfig> = {}) => {
  const { maxAttempts, windowMs, lockoutMs } = { ...defaultConfig, ...config };
  const [, forceUpdate] = useState({});

  const checkRateLimit = useCallback((): { allowed: boolean; remainingAttempts: number; lockoutRemaining: number | null } => {
    const now = Date.now();
    const state = getState(key);

    // Check if currently locked out
    if (state.lockoutUntil && now < state.lockoutUntil) {
      const lockoutRemaining = Math.ceil((state.lockoutUntil - now) / 1000 / 60);
      return { allowed: false, remainingAttempts: 0, lockoutRemaining };
    }

    // Reset lockout if expired
    if (state.lockoutUntil && now >= state.lockoutUntil) {
      setState(key, { attempts: 0, firstAttemptTime: 0, lockoutUntil: null });
      return { allowed: true, remainingAttempts: maxAttempts, lockoutRemaining: null };
    }

    // Check if window has expired, reset if so
    if (state.firstAttemptTime && now - state.firstAttemptTime > windowMs) {
      setState(key, { attempts: 0, firstAttemptTime: 0, lockoutUntil: null });
      return { allowed: true, remainingAttempts: maxAttempts, lockoutRemaining: null };
    }

    const remainingAttempts = maxAttempts - state.attempts;
    return { allowed: remainingAttempts > 0, remainingAttempts, lockoutRemaining: null };
  }, [key, maxAttempts, windowMs]);

  const recordAttempt = useCallback((success: boolean = false): { allowed: boolean; message: string } => {
    const now = Date.now();
    let state = getState(key);

    // Reset if window expired
    if (state.firstAttemptTime && now - state.firstAttemptTime > windowMs) {
      state = { attempts: 0, firstAttemptTime: 0, lockoutUntil: null };
    }

    // Check lockout
    if (state.lockoutUntil && now < state.lockoutUntil) {
      const minutes = Math.ceil((state.lockoutUntil - now) / 1000 / 60);
      return { allowed: false, message: `Too many attempts. Please try again in ${minutes} minutes.` };
    }

    // Reset lockout if expired
    if (state.lockoutUntil && now >= state.lockoutUntil) {
      state = { attempts: 0, firstAttemptTime: 0, lockoutUntil: null };
    }

    // If successful, reset attempts
    if (success) {
      setState(key, { attempts: 0, firstAttemptTime: 0, lockoutUntil: null });
      forceUpdate({});
      return { allowed: true, message: '' };
    }

    // Record failed attempt
    const newAttempts = state.attempts + 1;
    const firstAttemptTime = state.firstAttemptTime || now;

    if (newAttempts >= maxAttempts) {
      // Lockout
      const lockoutUntil = now + lockoutMs;
      setState(key, { attempts: newAttempts, firstAttemptTime, lockoutUntil });
      forceUpdate({});
      const minutes = Math.ceil(lockoutMs / 1000 / 60);
      return { allowed: false, message: `Too many failed attempts. Account locked for ${minutes} minutes.` };
    }

    setState(key, { attempts: newAttempts, firstAttemptTime, lockoutUntil: null });
    forceUpdate({});
    const remaining = maxAttempts - newAttempts;
    return { allowed: true, message: `${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` };
  }, [key, maxAttempts, windowMs, lockoutMs]);

  const resetLimit = useCallback(() => {
    setState(key, { attempts: 0, firstAttemptTime: 0, lockoutUntil: null });
    forceUpdate({});
  }, [key]);

  const getLockoutStatus = useCallback(() => {
    const state = getState(key);
    const now = Date.now();
    
    if (state.lockoutUntil && now < state.lockoutUntil) {
      return {
        isLocked: true,
        remainingMinutes: Math.ceil((state.lockoutUntil - now) / 1000 / 60),
      };
    }
    return { isLocked: false, remainingMinutes: 0 };
  }, [key]);

  return {
    checkRateLimit,
    recordAttempt,
    resetLimit,
    getLockoutStatus,
  };
};