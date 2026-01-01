import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, Package, AlertCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const { clearCart } = useCart();

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setVerifying(false);
        return;
      }

      try {
        const { data, error: invokeError } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId, orderId },
        });

        if (invokeError) {
          throw new Error(invokeError.message);
        }

        if (data.success && data.paid) {
          setVerified(true);
          clearCart();
          
          // Fetch order number
          if (data.orderId) {
            const { data: order } = await supabase
              .from('orders')
              .select('order_number')
              .eq('id', data.orderId)
              .single();
            
            if (order?.order_number) {
              setOrderNumber(order.order_number);
            }
          }
        } else {
          setError('Payment was not completed');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to verify payment');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, orderId, clearCart]);

  return (
    <>
      <SEOHead
        title="Payment Successful"
        description="Your payment has been processed successfully."
        noIndex={true}
      />

      <Header />

      <main className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="container-luxury">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center"
          >
            {verifying ? (
              <div className="space-y-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 size={40} className="text-primary animate-spin" />
                </div>
                <h1 className="font-display text-2xl">Verifying Payment...</h1>
                <p className="text-muted-foreground">
                  Please wait while we confirm your payment.
                </p>
              </div>
            ) : verified ? (
              <div className="space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
                >
                  <CheckCircle size={40} className="text-green-600 dark:text-green-400" />
                </motion.div>
                
                <div>
                  <h1 className="font-display text-3xl mb-2">Payment Successful!</h1>
                  <p className="text-muted-foreground">
                    Thank you for your order. Your payment has been processed successfully.
                  </p>
                </div>

                {orderNumber && (
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Order Number</p>
                    <p className="font-mono text-lg font-semibold">{orderNumber}</p>
                  </div>
                )}

                <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
                  <p>A confirmation email has been sent to your registered email address.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Link to="/orders" className="flex-1">
                    <Button className="w-full gap-2">
                      <Package size={18} />
                      View Orders
                    </Button>
                  </Link>
                  <Link to="/category/all" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertCircle size={40} className="text-red-600 dark:text-red-400" />
                </div>
                
                <div>
                  <h1 className="font-display text-2xl mb-2">Payment Verification Failed</h1>
                  <p className="text-muted-foreground">
                    {error || 'We could not verify your payment. Please contact support if you were charged.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Link to="/checkout" className="flex-1">
                    <Button className="w-full">
                      Try Again
                    </Button>
                  </Link>
                  <Link to="/contact" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Contact Support
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default PaymentSuccessPage;
