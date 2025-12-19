import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends ButtonProps {
  glowColor?: 'primary' | 'gold';
  showArrow?: boolean;
  children: React.ReactNode;
}

const AnimatedButton = ({
  glowColor = 'primary',
  showArrow = false,
  children,
  className,
  variant = 'default',
  ...props
}: AnimatedButtonProps) => {
  const glowClass = glowColor === 'gold' 
    ? 'bg-gold/40 group-hover:opacity-50' 
    : 'bg-primary/50 group-hover:opacity-60';
  
  const shimmerClass = glowColor === 'gold'
    ? 'via-gold/20'
    : 'via-white/20';

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="relative group"
    >
      {/* Glow effect behind button */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-lg blur-xl opacity-0 transition-opacity duration-300",
          glowClass
        )}
      />
      <Button
        variant={variant}
        className={cn(
          "relative overflow-hidden group",
          className
        )}
        {...props}
      >
        {/* Shimmer effect on hover */}
        <span 
          className={cn(
            "absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent to-transparent",
            shimmerClass
          )} 
        />
        {/* Inner glow for outline variant */}
        {variant === 'outline' && (
          <span 
            className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
            style={{ boxShadow: `inset 0 0 20px hsl(var(--${glowColor}) / 0.3)` }} 
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          {children}
          {showArrow && (
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          )}
        </span>
      </Button>
    </motion.div>
  );
};

export { AnimatedButton };
