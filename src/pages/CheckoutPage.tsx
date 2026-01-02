import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Truck, Shield, Loader2, AlertCircle, Tag, X, CheckCircle, MapPin, Zap, Banknote } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/cart/CartSidebar';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { SEOHead } from '@/components/SEOHead';
import { formatPrice } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useRateLimiter } from '@/hooks/useRateLimiter';

interface DiscountCode {
  id: string;
  code: string;
  type: string;
  value: number;
  min_order: number;
}

const DHAKA_DELIVERY_STANDARD = 100; // Free above 5000
const DHAKA_DELIVERY_EXPRESS = 200;
const OUTSIDE_DHAKA_DELIVERY = 160;
const BKASH_NUMBER = '01778763089';

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delivery payment for outside Dhaka
  const [deliveryPaymentMethod, setDeliveryPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [deliveryPaymentNumber, setDeliveryPaymentNumber] = useState('');
  const [deliveryTransactionId, setDeliveryTransactionId] = useState('');
  
  // Shipping method (only for Dhaka customers)
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  
  // Discount code state
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [discountError, setDiscountError] = useState('');
  
  // Rate limiting for discount code validation
  const discountRateLimiter = useRateLimiter('discount_code_attempts', {
    maxAttempts: 10,
    windowMs: 5 * 60 * 1000,
    lockoutMs: 10 * 60 * 1000,
  });

  // Form state
  const [formData, setFormData] = useState({
    firstName: profile?.full_name?.split(' ')[0] || '',
    lastName: profile?.full_name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    postalCode: profile?.postal_code || '',
  });

  // Check if customer is from Dhaka
  const isDhakaCustomer = formData.city.toLowerCase().trim() === 'dhaka' || 
                          formData.city.toLowerCase().trim().includes('dhaka');

  // Calculate shipping cost
  const getShippingCost = () => {
    if (isDhakaCustomer) {
      if (shippingMethod === 'express') return DHAKA_DELIVERY_EXPRESS;
      return totalPrice >= 5000 ? 0 : DHAKA_DELIVERY_STANDARD;
    }
    return OUTSIDE_DHAKA_DELIVERY;
  };

  const shippingCost = getShippingCost();
  
  // Calculate discount amount
  const discountAmount = appliedDiscount
    ? appliedDiscount.type === 'percentage'
      ? Math.round((totalPrice * appliedDiscount.value) / 100)
      : appliedDiscount.value
    : 0;
  
  const grandTotal = totalPrice + shippingCost - discountAmount;

  const applyDiscountCode = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Please enter a discount code');
      return;
    }

    const { allowed, lockoutRemaining } = discountRateLimiter.checkRateLimit();
    if (!allowed) {
      setDiscountError(`Too many attempts. Please try again in ${lockoutRemaining} minutes.`);
      return;
    }

    setIsValidatingDiscount(true);
    setDiscountError('');

    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('id, code, type, value, min_order')
        .eq('code', discountCode.toUpperCase().trim())
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const result = discountRateLimiter.recordAttempt(false);
        if (result.message && !result.allowed) {
          setDiscountError(result.message);
        } else {
          setDiscountError('Invalid or expired discount code');
        }
        return;
      }

      if (totalPrice < data.min_order) {
        setDiscountError(`Minimum order of ${formatPrice(data.min_order)} required`);
        return;
      }

      discountRateLimiter.recordAttempt(true);
      setAppliedDiscount(data);
      setDiscountCode('');
      toast.success('Discount code applied!');
    } catch (error: any) {
      setDiscountError('Failed to validate discount code');
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  // Validate Bangladesh phone number (must be 11 digits starting with 01)
  const isValidBDPhone = (phone: string) => {
    const cleaned = phone.replace(/[\s\-\+]/g, '');
    // Accept formats: 01XXXXXXXXX, +8801XXXXXXXXX, 8801XXXXXXXXX
    const bdPhoneRegex = /^(?:\+?880)?0?1[3-9]\d{8}$/;
    return bdPhoneRegex.test(cleaned);
  };

  // Validate address (minimum 10 characters with at least some detail)
  const isValidAddress = (address: string) => {
    const trimmed = address.trim();
    return trimmed.length >= 10;
  };

  const validateShippingStep = () => {
    if (!formData.firstName.trim()) {
      toast.error('Please enter your first name');
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error('Please enter your phone number');
      return false;
    }
    if (!isValidBDPhone(formData.phone)) {
      toast.error('Please enter a valid Bangladesh phone number (e.g., 01XXX-XXXXXX)');
      return false;
    }
    if (!formData.address.trim()) {
      toast.error('Please enter your address');
      return false;
    }
    if (!isValidAddress(formData.address)) {
      toast.error('Please enter a complete address (at least 10 characters with house/road details)');
      return false;
    }
    if (!formData.city.trim()) {
      toast.error('Please enter your city');
      return false;
    }
    return true;
  };

  const validateDeliveryPaymentStep = () => {
    if (!deliveryPaymentNumber.trim()) {
      toast.error('Please enter the phone number you paid from');
      return false;
    }
    if (!deliveryTransactionId.trim()) {
      toast.error('Please enter the transaction ID');
      return false;
    }
    return true;
  };

  const handleContinueFromShipping = () => {
    if (!validateShippingStep()) return;
    
    if (isDhakaCustomer) {
      // Dhaka customers go directly to review
      setStep(3);
    } else {
      // Outside Dhaka customers need to pay delivery charge first
      setStep(2);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please sign in to place an order');
      navigate('/auth');
      return;
    }

    // For outside Dhaka, validate payment info
    if (!isDhakaCustomer && !validateDeliveryPaymentStep()) return;

    setIsSubmitting(true);

    try {
      // Build payment notes
      let paymentNotes = `Cash on Delivery - ${isDhakaCustomer ? 'Dhaka' : 'Outside Dhaka'}`;
      if (isDhakaCustomer) {
        paymentNotes += ` | Shipping: ${shippingMethod === 'express' ? 'Express (৳200)' : 'Standard'}`;
      } else {
        paymentNotes += ` | Delivery Advance: ৳${OUTSIDE_DHAKA_DELIVERY} via ${deliveryPaymentMethod.toUpperCase()}, TxID: ${deliveryTransactionId}, From: ${deliveryPaymentNumber}`;
      }

      // Create the order with pending status
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: grandTotal,
          discount_code_id: appliedDiscount?.id || null,
          discount_amount: discountAmount,
          shipping_address: formData.address,
          shipping_city: formData.city,
          shipping_postal_code: formData.postalCode,
          payment_method: 'cod',
          notes: paymentNotes,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.images[0],
        quantity: item.quantity,
        size: item.selectedSize || null,
        color: item.selectedColor?.name || null,
        price: item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Send confirmation email
      try {
        const emailPayload = {
          email: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`.trim() || profile?.full_name || 'Valued Customer',
          orderNumber: order.order_number || order.id,
          orderId: order.id,
          orderDate: order.created_at,
          items: items.map(item => ({
            product_name: item.product.name,
            quantity: item.quantity,
            size: item.selectedSize || null,
            color: item.selectedColor?.name || null,
            price: item.product.price,
          })),
          subtotal: totalPrice,
          shipping: shippingCost,
          discount: discountAmount,
          total: grandTotal,
          shippingAddress: formData.address,
          shippingCity: formData.city,
          shippingPostalCode: formData.postalCode || '',
          paymentMethod: 'cod',
        };
        
        await supabase.functions.invoke('order-confirmation', {
          body: emailPayload,
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }

      // Send admin notification email
      try {
        const adminNotificationPayload = {
          orderId: order.id,
          orderNumber: order.order_number || order.id,
          customerEmail: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`.trim() || profile?.full_name || 'Customer',
          totalAmount: grandTotal,
          items: items.map(item => ({
            product_name: item.product.name,
            quantity: item.quantity,
            size: item.selectedSize || null,
            color: item.selectedColor?.name || null,
            price: item.product.price,
          })),
          shippingAddress: formData.address,
          shippingCity: formData.city,
          paymentMethod: 'Cash on Delivery',
        };

        await supabase.functions.invoke('new-order-notification', {
          body: adminNotificationPayload,
        });
      } catch (adminNotifyError) {
        console.error('Failed to send admin notification:', adminNotifyError);
      }

      toast.success('Order placed successfully!', {
        description: 'Your order is pending confirmation. You will receive an update once confirmed.',
      });
      
      clearCart();
      navigate('/orders');
    } catch (error: any) {
      toast.error('Failed to place order', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Require login before showing checkout
  if (!user) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-16 min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto p-8"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield size={40} className="text-primary" />
            </div>
            <h1 className="font-display text-3xl mb-4">Sign in to Continue</h1>
            <p className="text-muted-foreground mb-8">
              Please sign in or create an account to proceed with your order.
            </p>
            <div className="space-y-3">
              <Link to="/auth" state={{ from: '/checkout' }}>
                <Button className="btn-primary w-full py-6">Sign In / Create Account</Button>
              </Link>
              <Link to="/category/all">
                <Button variant="outline" className="w-full py-6">Continue Shopping</Button>
              </Link>
            </div>
          </motion.div>
        </main>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-3xl mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">Add some items to proceed to checkout</p>
            <Link to="/category/all">
              <Button className="btn-primary">Continue Shopping</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Determine number of steps based on location
  const totalSteps = isDhakaCustomer ? 2 : 3;
  const stepLabels = isDhakaCustomer 
    ? ['Shipping', 'Review & Order']
    : ['Shipping', 'Delivery Payment', 'Review & Order'];

  return (
    <>
      <SEOHead
        title="Checkout"
        description="Complete your purchase. Cash on Delivery available."
        noIndex={true}
      />

      <Header />
      <CartSidebar />

      <main className="pt-24 pb-16 min-h-screen">
        <div className="container-luxury">
          {/* Back Link */}
          <Link to="/category/all" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ChevronLeft size={18} />
            Continue Shopping
          </Link>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Progress Steps */}
              <div className="flex items-center gap-4 mb-8">
                {stepLabels.map((label, index) => {
                  const stepNumber = index + 1;
                  const isActive = step >= stepNumber;
                  return (
                    <div key={stepNumber} className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {stepNumber}
                      </div>
                      <span className={`text-sm ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {label}
                      </span>
                      {index < stepLabels.length - 1 && <div className="w-8 h-px bg-border" />}
                    </div>
                  );
                })}
              </div>

              {/* Step 1: Shipping Information */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h2 className="font-display text-2xl">Shipping Information</h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input 
                        id="firstName" 
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter first name" 
                        className="mt-1" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter last name" 
                        className="mt-1" 
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email" 
                      className="mt-1" 
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input 
                      id="phone" 
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+880 1XXX-XXXXXX" 
                      className="mt-1" 
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input 
                      id="address" 
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="House no, Road, Area" 
                      className="mt-1" 
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input 
                        id="city" 
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g., Dhaka, Chittagong" 
                        className="mt-1" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input 
                        id="postalCode" 
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="e.g., 1212" 
                        className="mt-1" 
                      />
                    </div>
                  </div>

                  {/* Shipping Method - Only for Dhaka customers */}
                  {isDhakaCustomer && (
                    <div className="pt-4">
                      <h3 className="font-medium mb-4 flex items-center gap-2">
                        <Truck size={18} />
                        Shipping Method
                      </h3>
                      <RadioGroup value={shippingMethod} onValueChange={(v) => setShippingMethod(v as 'standard' | 'express')}>
                        <label className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="standard" id="standard" />
                            <div>
                              <p className="font-medium">Standard Delivery</p>
                              <p className="text-sm text-muted-foreground">3-5 business days</p>
                            </div>
                          </div>
                          <span className="text-primary font-medium">
                            {totalPrice >= 5000 ? 'Free' : `৳${DHAKA_DELIVERY_STANDARD}`}
                          </span>
                        </label>
                        <label className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors mt-3">
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="express" id="express" />
                            <div className="flex items-center gap-2">
                              <Zap size={16} className="text-amber-500" />
                              <div>
                                <p className="font-medium">Express Delivery</p>
                                <p className="text-sm text-muted-foreground">1-2 business days</p>
                              </div>
                            </div>
                          </div>
                          <span className="text-primary font-medium">৳{DHAKA_DELIVERY_EXPRESS}</span>
                        </label>
                      </RadioGroup>
                    </div>
                  )}

                  {/* Info box for outside Dhaka */}
                  {formData.city && !isDhakaCustomer && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle size={20} className="text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-amber-500">Delivery Outside Dhaka</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Delivery charge: <strong>৳{OUTSIDE_DHAKA_DELIVERY}</strong> (advance payment required)
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Note: Express delivery is only available for Dhaka city.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Info box for Dhaka */}
                  {isDhakaCustomer && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <MapPin size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-green-500">Dhaka City Delivery</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Standard: {totalPrice >= 5000 ? 'Free' : `৳${DHAKA_DELIVERY_STANDARD}`} | Express: ৳{DHAKA_DELIVERY_EXPRESS}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button onClick={handleContinueFromShipping} className="w-full btn-primary py-6">
                    {isDhakaCustomer ? 'Continue to Review' : 'Continue to Delivery Payment'}
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Delivery Payment (Only for Outside Dhaka) */}
              {step === 2 && !isDhakaCustomer && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h2 className="font-display text-2xl">Delivery Charge Payment</h2>
                  
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Banknote size={24} className="text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-amber-500">Advance Payment Required</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Since you're ordering from outside Dhaka, please pay the delivery charge of <strong>৳{OUTSIDE_DHAKA_DELIVERY}</strong> in advance via bKash, Nagad, or Rocket.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div>
                    <Label className="mb-3 block">Select Payment Method</Label>
                    <RadioGroup value={deliveryPaymentMethod} onValueChange={(v) => setDeliveryPaymentMethod(v as 'bkash' | 'nagad' | 'rocket')}>
                      <div className="grid grid-cols-3 gap-3">
                        <label className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${deliveryPaymentMethod === 'bkash' ? 'border-[#E2136E] bg-[#E2136E]/10' : 'border-border hover:border-[#E2136E]'}`}>
                          <RadioGroupItem value="bkash" id="bkash" className="sr-only" />
                          <div className="w-12 h-8 bg-[#E2136E] rounded flex items-center justify-center mb-2">
                            <span className="text-white text-xs font-bold">bKash</span>
                          </div>
                          <span className="text-sm font-medium">bKash</span>
                        </label>
                        <label className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${deliveryPaymentMethod === 'nagad' ? 'border-[#F6921E] bg-[#F6921E]/10' : 'border-border hover:border-[#F6921E]'}`}>
                          <RadioGroupItem value="nagad" id="nagad" className="sr-only" />
                          <div className="w-12 h-8 bg-[#F6921E] rounded flex items-center justify-center mb-2">
                            <span className="text-white text-xs font-bold">Nagad</span>
                          </div>
                          <span className="text-sm font-medium">Nagad</span>
                        </label>
                        <label className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${deliveryPaymentMethod === 'rocket' ? 'border-[#8C3494] bg-[#8C3494]/10' : 'border-border hover:border-[#8C3494]'}`}>
                          <RadioGroupItem value="rocket" id="rocket" className="sr-only" />
                          <div className="w-12 h-8 bg-[#8C3494] rounded flex items-center justify-center mb-2">
                            <span className="text-white text-xs font-bold">Rocket</span>
                          </div>
                          <span className="text-sm font-medium">Rocket</span>
                        </label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Payment Instructions */}
                  <div className={`p-4 rounded-lg border ${
                    deliveryPaymentMethod === 'bkash' ? 'bg-[#E2136E]/10 border-[#E2136E]/20' :
                    deliveryPaymentMethod === 'nagad' ? 'bg-[#F6921E]/10 border-[#F6921E]/20' :
                    'bg-[#8C3494]/10 border-[#8C3494]/20'
                  }`}>
                    <p className="text-sm font-medium mb-2">Send ৳{OUTSIDE_DHAKA_DELIVERY} to:</p>
                    <p className={`text-2xl font-mono font-bold ${
                      deliveryPaymentMethod === 'bkash' ? 'text-[#E2136E]' :
                      deliveryPaymentMethod === 'nagad' ? 'text-[#F6921E]' :
                      'text-[#8C3494]'
                    }`}>{BKASH_NUMBER}</p>
                    <p className="text-xs text-muted-foreground mt-1">Personal {deliveryPaymentMethod} number</p>
                  </div>

                  {/* Payment Details Form */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="deliveryPaymentNumber">Your {deliveryPaymentMethod.charAt(0).toUpperCase() + deliveryPaymentMethod.slice(1)} Number *</Label>
                      <Input 
                        id="deliveryPaymentNumber"
                        value={deliveryPaymentNumber}
                        onChange={(e) => setDeliveryPaymentNumber(e.target.value)}
                        placeholder="01XXX-XXXXXX"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deliveryTransactionId">Transaction ID *</Label>
                      <Input 
                        id="deliveryTransactionId"
                        value={deliveryTransactionId}
                        onChange={(e) => setDeliveryTransactionId(e.target.value)}
                        placeholder="Enter transaction ID"
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        You'll receive this ID after completing the payment
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 py-6">
                      Back
                    </Button>
                    <Button onClick={() => {
                      if (validateDeliveryPaymentStep()) setStep(3);
                    }} className="flex-1 btn-primary py-6">
                      Continue to Review
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3 (or 2 for Dhaka): Review Order */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h2 className="font-display text-2xl">Review Your Order</h2>

                  {/* Order Items */}
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor?.name}`} className="flex gap-4 p-4 bg-card rounded-lg">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-20 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product.name}</h4>
                          {item.selectedSize && <p className="text-sm text-muted-foreground">Size: {item.selectedSize}</p>}
                          {item.selectedColor && <p className="text-sm text-muted-foreground">Color: {item.selectedColor.name}</p>}
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatPrice(item.product.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Info Summary */}
                  <div className="p-4 bg-card rounded-lg space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <MapPin size={16} />
                      Shipping to:
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {formData.firstName} {formData.lastName}<br />
                      {formData.address}<br />
                      {formData.city}{formData.postalCode && `, ${formData.postalCode}`}<br />
                      {formData.phone}
                    </p>
                  </div>

                  {/* Delivery Info */}
                  <div className="p-4 bg-card rounded-lg space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Truck size={16} />
                      Delivery:
                    </h4>
                    {isDhakaCustomer ? (
                      <div className="text-sm text-muted-foreground">
                        <p className="capitalize">
                          {shippingMethod} Delivery 
                          {shippingMethod === 'express' && <span className="text-amber-500 ml-2">(1-2 days)</span>}
                          {shippingMethod === 'standard' && <span className="text-muted-foreground ml-2">(3-5 days)</span>}
                        </p>
                        <p className="font-medium text-foreground">
                          Delivery Charge: {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                        </p>
                      </div>
                    ) : (
                      <div className="text-sm">
                        <p className="text-muted-foreground">Outside Dhaka - Standard Delivery (3-5 days)</p>
                        <p className="font-medium text-foreground">Delivery Charge: {formatPrice(OUTSIDE_DHAKA_DELIVERY)}</p>
                        <div className="mt-2 p-2 bg-green-500/10 rounded">
                          <p className="text-green-600 text-xs font-medium">
                            ✓ Delivery charge paid via {deliveryPaymentMethod.toUpperCase()}
                          </p>
                          <p className="text-xs text-muted-foreground">TxID: {deliveryTransactionId}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Summary */}
                  <div className="p-4 bg-card rounded-lg space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Banknote size={16} />
                      Payment Method:
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Cash on Delivery
                    </p>
                    <p className="text-sm text-primary font-medium">
                      Amount to pay on delivery: {formatPrice(isDhakaCustomer ? grandTotal : grandTotal - OUTSIDE_DHAKA_DELIVERY)}
                    </p>
                  </div>

                  {/* Order Status Info */}
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-blue-500">Order Confirmation</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your order will be marked as "Pending" until our team confirms it.
                          {!isDhakaCustomer && ' We will verify your delivery payment and then confirm your order.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
                    <Shield size={24} className="text-primary" />
                    <p className="text-sm">Your order information is secure</p>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setStep(isDhakaCustomer ? 1 : 2)} 
                      className="flex-1 py-6" 
                      disabled={isSubmitting}
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handlePlaceOrder} 
                      className="flex-1 btn-primary py-6"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        'Place Order'
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
                <h3 className="font-display text-xl mb-6">Order Summary</h3>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.selectedSize}`} className="flex gap-3">
                      <div className="relative">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-16 h-20 object-cover rounded-lg"
                        />
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        {item.selectedSize && <p className="text-xs text-muted-foreground">Size: {item.selectedSize}</p>}
                      </div>
                      <p className="text-sm">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                {/* Discount Code Input */}
                <div className="pt-4 border-t border-border">
                  {appliedDiscount ? (
                    <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-primary" />
                        <div>
                          <p className="text-sm font-medium text-primary">{appliedDiscount.code}</p>
                          <p className="text-xs text-muted-foreground">
                            {appliedDiscount.type === 'percentage' 
                              ? `${appliedDiscount.value}% off` 
                              : `${formatPrice(appliedDiscount.value)} off`}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={removeDiscount}
                        className="h-8 w-8 p-0"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Discount code"
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                            className="pl-9"
                            onKeyDown={(e) => e.key === 'Enter' && applyDiscountCode()}
                          />
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={applyDiscountCode}
                          disabled={isValidatingDiscount}
                        >
                          {isValidatingDiscount ? <Loader2 className="animate-spin" size={16} /> : 'Apply'}
                        </Button>
                      </div>
                      {discountError && (
                        <p className="text-xs text-destructive">{discountError}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 pt-4 border-t border-border mt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="text-green-500">Free</span>
                      ) : (
                        formatPrice(shippingCost)
                      )}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-primary">
                      <span>Discount</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-4 mt-4 border-t border-border font-medium text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(grandTotal)}</span>
                </div>

                {/* Location Info */}
                {formData.city && (
                  <div className={`mt-4 p-3 rounded-lg text-sm ${isDhakaCustomer ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      <span className="font-medium">
                        {isDhakaCustomer ? 'Dhaka City' : 'Outside Dhaka'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default CheckoutPage;
