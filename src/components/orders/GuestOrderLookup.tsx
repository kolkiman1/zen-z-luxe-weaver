import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, Loader2, Mail, Phone, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface GuestOrderLookupProps {
  onOrderFound: (order: any) => void;
  prefillOrderNumber?: string;
  prefillEmail?: string;
  prefillPhone?: string;
}

const GuestOrderLookup = ({ 
  onOrderFound, 
  prefillOrderNumber = '',
  prefillEmail = '',
  prefillPhone = ''
}: GuestOrderLookupProps) => {
  const [orderNumber, setOrderNumber] = useState(prefillOrderNumber);
  const [verificationValue, setVerificationValue] = useState('');
  const [verificationType, setVerificationType] = useState<'email' | 'phone'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoLookupDone, setAutoLookupDone] = useState(false);

  // Initialize with prefilled values
  useEffect(() => {
    if (prefillOrderNumber) {
      setOrderNumber(prefillOrderNumber.toUpperCase());
    }
    if (prefillPhone) {
      setVerificationType('phone');
      setVerificationValue(prefillPhone);
    } else if (prefillEmail) {
      setVerificationType('email');
      setVerificationValue(prefillEmail);
    }
  }, [prefillOrderNumber, prefillEmail, prefillPhone]);

  // Auto-lookup if all prefill values are provided
  useEffect(() => {
    if (!autoLookupDone && prefillOrderNumber && (prefillEmail || prefillPhone)) {
      setAutoLookupDone(true);
      // Small delay to show the form before auto-submitting
      const timer = setTimeout(() => {
        handleLookup();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [prefillOrderNumber, prefillEmail, prefillPhone, autoLookupDone]);

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!orderNumber.trim()) {
      setError('Please enter your order number');
      return;
    }

    if (!verificationValue.trim()) {
      setError(`Please enter your ${verificationType === 'email' ? 'email address' : 'phone number'}`);
      return;
    }

    setLoading(true);

    try {
      // Use the secure edge function for guest order lookup
      const payload: { orderNumber: string; email?: string; phone?: string } = {
        orderNumber: orderNumber.trim().toUpperCase(),
      };

      if (verificationType === 'email') {
        payload.email = verificationValue.trim();
      } else {
        payload.phone = verificationValue.trim();
      }

      const { data, error: invokeError } = await supabase.functions.invoke('guest-order-lookup', {
        body: payload,
      });

      if (invokeError) {
        console.error('Edge function error:', invokeError);
        setError('An error occurred while looking up your order');
        setLoading(false);
        return;
      }

      if (data?.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      if (!data?.order) {
        setError('Order not found. Please check your order number and try again.');
        setLoading(false);
        return;
      }

      // Combine order with items for the callback
      const orderWithItems = {
        ...data.order,
        order_items: data.items || [],
      };

      onOrderFound(orderWithItems);
      toast.success('Order found!');
    } catch (err) {
      console.error('Lookup error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display text-2xl mb-2">Track Your Order</h2>
          <p className="text-muted-foreground text-sm">
            Enter your order number and verification details to track your order status
          </p>
        </div>

        <form onSubmit={handleLookup} className="space-y-6">
          {/* Order Number */}
          <div className="space-y-2">
            <Label htmlFor="orderNumber" className="flex items-center gap-2">
              <Hash size={16} className="text-muted-foreground" />
              Order Number
            </Label>
            <Input
              id="orderNumber"
              placeholder="e.g., ORD-20260103-0001"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              className="uppercase"
            />
          </div>

          {/* Verification Type Toggle */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Verify with</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={verificationType === 'phone' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVerificationType('phone')}
                className="flex-1"
              >
                <Phone size={16} className="mr-2" />
                Phone
              </Button>
              <Button
                type="button"
                variant={verificationType === 'email' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVerificationType('email')}
                className="flex-1"
              >
                <Mail size={16} className="mr-2" />
                Email
              </Button>
            </div>
          </div>

          {/* Verification Input */}
          <div className="space-y-2">
            <Label htmlFor="verification" className="flex items-center gap-2">
              {verificationType === 'email' ? (
                <Mail size={16} className="text-muted-foreground" />
              ) : (
                <Phone size={16} className="text-muted-foreground" />
              )}
              {verificationType === 'email' ? 'Email Address' : 'Phone Number'}
            </Label>
            <Input
              id="verification"
              type={verificationType === 'email' ? 'email' : 'tel'}
              placeholder={verificationType === 'email' ? 'your@email.com' : '01XXXXXXXXX'}
              value={verificationValue}
              onChange={(e) => setVerificationValue(e.target.value)}
            />
          </div>

          {/* Error Message */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-destructive text-sm text-center bg-destructive/10 p-3 rounded-lg"
            >
              {error}
            </motion.p>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full py-6"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Looking up order...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Track Order
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          You can find your order number in your order confirmation email or SMS
        </p>
      </div>
    </motion.div>
  );
};

export default GuestOrderLookup;
