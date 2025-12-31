import { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface Requirement {
  label: string;
  met: boolean;
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const requirements: Requirement[] = useMemo(() => [
    { label: 'At least 6 characters', met: password.length >= 6 },
    { label: 'Contains a number', met: /\d/.test(password) },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains special character (!@#$%^&*)', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ], [password]);

  const strength = useMemo(() => {
    const metCount = requirements.filter(r => r.met).length;
    if (password.length === 0) return { level: 0, label: '', color: '' };
    if (metCount <= 1) return { level: 1, label: 'Weak', color: 'bg-destructive' };
    if (metCount <= 2) return { level: 2, label: 'Fair', color: 'bg-orange-500' };
    if (metCount <= 3) return { level: 3, label: 'Good', color: 'bg-yellow-500' };
    if (metCount <= 4) return { level: 4, label: 'Strong', color: 'bg-green-500' };
    return { level: 5, label: 'Very Strong', color: 'bg-emerald-500' };
  }, [password, requirements]);

  if (password.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Strength meter */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Password strength</span>
          <span className={cn('text-xs font-medium', {
            'text-destructive': strength.level === 1,
            'text-orange-500': strength.level === 2,
            'text-yellow-600': strength.level === 3,
            'text-green-600': strength.level === 4,
            'text-emerald-600': strength.level === 5,
          })}>
            {strength.label}
          </span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                level <= strength.level ? strength.color : 'bg-muted'
              )}
            />
          ))}
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-1.5">
        <span className="text-xs text-muted-foreground">Requirements</span>
        <ul className="space-y-1">
          {requirements.map((req, index) => (
            <li
              key={index}
              className={cn(
                'flex items-center gap-2 text-xs transition-colors',
                req.met ? 'text-green-600' : 'text-muted-foreground'
              )}
            >
              {req.met ? (
                <Check className="w-3.5 h-3.5 flex-shrink-0" />
              ) : (
                <X className="w-3.5 h-3.5 flex-shrink-0" />
              )}
              {req.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
