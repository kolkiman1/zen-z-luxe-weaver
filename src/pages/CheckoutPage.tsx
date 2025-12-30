import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, CreditCard, Truck, Shield, Loader2, Smartphone, Wallet, AlertCircle, Tag, X, CheckCircle } from 'lucide-react';
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

interface DiscountCode {
  id: string;
  code: string;
  type: string;
  value: number;
  min_order: number;
}

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobilePaymentNumber, setMobilePaymentNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  
  // Discount code state
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [discountError, setDiscountError] = useState('');
  
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

  const shippingCost = shippingMethod === 'express' ? 200 : totalPrice >= 5000 ? 0 : 100;
  
  // Calculate discount amount
  const discountAmount = appliedDiscount
    ? appliedDiscount.type === 'percentage'
      ? Math.round((totalPrice * appliedDiscount.value) / 100)
      : appliedDiscount.value
    : 0;
  
  const grandTotal = totalPrice + shippingCost - discountAmount;
  
  // COD requires 20% advance payment
  const codAdvancePayment = Math.ceil(grandTotal * 0.2);
  const codRemainingPayment = grandTotal - codAdvancePayment;

  const applyDiscountCode = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Please enter a discount code');
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
        setDiscountError('Invalid or expired discount code');
        return;
      }

      if (totalPrice < data.min_order) {
        setDiscountError(`Minimum order of ${formatPrice(data.min_order)} required`);
        return;
      }

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

  const validatePaymentStep = () => {
    if (paymentMethod === 'bkash' || paymentMethod === 'nagad') {
      if (!mobilePaymentNumber) {
        toast.error('Please enter your mobile number');
        return false;
      }
      if (!transactionId) {
        toast.error('Please enter the transaction ID');
        return false;
      }
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please sign in to place an order');
      navigate('/auth');
      return;
    }

    if (!validatePaymentStep()) return;

    setIsSubmitting(true);

    try {
      // Build payment notes based on method
      let paymentNotes = '';
      if (paymentMethod === 'cod') {
        paymentNotes = `COD - Advance: ${formatPrice(codAdvancePayment)}, Remaining: ${formatPrice(codRemainingPayment)}`;
      } else if (paymentMethod === 'bkash' || paymentMethod === 'nagad') {
        paymentNotes = `${paymentMethod.toUpperCase()} - TxID: ${transactionId}, From: ${mobilePaymentNumber}`;
      }

      // Create the order
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
          payment_method: paymentMethod,
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

      toast.success('Order placed successfully!', {
        description: 'You will receive a confirmation email shortly.',
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
              Please sign in or create an account to proceed with your order. This helps us keep your order history and shipping information secure.
            </p>
            <div className="space-y-3">
              <Link to="/auth" state={{ from: '/checkout' }}>
                <Button className="btn-primary w-full py-6">Sign In / Create Account</Button>
              </Link>
              <Link to="/category/all">
                <Button variant="outline" className="w-full py-6">Continue Shopping</Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-6">
              Your cart items are saved and will be waiting for you.
            </p>
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

  return (
    <>
      <SEOHead
        title="Checkout"
        description="Complete your purchase. Secure checkout with multiple payment options."
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
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step >= s
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {s}
                    </div>
                    <span className={step >= s ? 'text-foreground' : 'text-muted-foreground'}>
                      {s === 1 ? 'Shipping' : s === 2 ? 'Payment' : 'Review'}
                    </span>
                    {s < 3 && <div className="w-8 h-px bg-border" />}
                  </div>
                ))}
              </div>

              {/* Step 1: Shipping */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h2 className="font-display text-2xl">Shipping Information</h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
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
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+880 1XXX-XXXXXX" 
                      className="mt-1" 
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
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
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g., Dhaka" 
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

                  <div className="pt-4">
                    <h3 className="font-medium mb-4">Shipping Method</h3>
                    <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                      <label className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="standard" id="standard" />
                          <div>
                            <p className="font-medium">Standard Delivery</p>
                            <p className="text-sm text-muted-foreground">3-5 business days</p>
                          </div>
                        </div>
                        <span className="text-primary">{totalPrice >= 5000 ? 'Free' : '৳100'}</span>
                      </label>
                      <label className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors mt-3">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="express" id="express" />
                          <div>
                            <p className="font-medium">Express Delivery</p>
                            <p className="text-sm text-muted-foreground">1-2 business days</p>
                          </div>
                        </div>
                        <span className="text-primary">৳200</span>
                      </label>
                    </RadioGroup>
                  </div>

                  <Button onClick={() => setStep(2)} className="w-full btn-primary py-6">
                    Continue to Payment
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h2 className="font-display text-2xl">Payment Method</h2>

                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    {/* Cash on Delivery */}
                    <label className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'}`}>
                      <RadioGroupItem value="cod" id="cod" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Truck size={20} className="text-primary" />
                          <p className="font-medium">Cash on Delivery</p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Pay when you receive your order</p>
                        <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <p className="font-medium text-amber-500">20% Advance Required</p>
                              <p className="text-muted-foreground">Pay {formatPrice(codAdvancePayment)} via bKash/Nagad to confirm your order.</p>
                              <p className="text-muted-foreground">Remaining {formatPrice(codRemainingPayment)} on delivery.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>

                    {/* bKash */}
                    <label className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors mt-3 ${paymentMethod === 'bkash' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'}`}>
                      <RadioGroupItem value="bkash" id="bkash" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-6 bg-[#E2136E] rounded flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold">bKash</span>
                          </div>
                          <p className="font-medium">bKash</p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Pay full amount via bKash mobile banking</p>
                        {paymentMethod === 'bkash' && (
                          <div className="mt-4 space-y-4">
                            <div className="p-3 bg-[#E2136E]/10 border border-[#E2136E]/20 rounded-lg">
                              <p className="text-sm font-medium mb-2">Send {formatPrice(grandTotal)} to:</p>
                              <p className="text-lg font-mono font-bold text-[#E2136E]">01778763089</p>
                              <p className="text-xs text-muted-foreground mt-1">Personal bKash number</p>
                            </div>
                            <div>
                              <Label htmlFor="bkashNumber">Your bKash Number</Label>
                              <Input 
                                id="bkashNumber"
                                value={mobilePaymentNumber}
                                onChange={(e) => setMobilePaymentNumber(e.target.value)}
                                placeholder="01XXX-XXXXXX"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="bkashTxId">Transaction ID</Label>
                              <Input 
                                id="bkashTxId"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="Enter bKash transaction ID"
                                className="mt-1"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </label>

                    {/* Nagad */}
                    <label className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors mt-3 ${paymentMethod === 'nagad' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'}`}>
                      <RadioGroupItem value="nagad" id="nagad" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-6 bg-[#F6921E] rounded flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold">Nagad</span>
                          </div>
                          <p className="font-medium">Nagad</p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Pay full amount via Nagad mobile banking</p>
                        {paymentMethod === 'nagad' && (
                          <div className="mt-4 space-y-4">
                            <div className="p-3 bg-[#F6921E]/10 border border-[#F6921E]/20 rounded-lg">
                              <p className="text-sm font-medium mb-2">Send {formatPrice(grandTotal)} to:</p>
                              <p className="text-lg font-mono font-bold text-[#F6921E]">01XXX-XXXXXX</p>
                              <p className="text-xs text-muted-foreground mt-1">Personal Nagad number</p>
                            </div>
                            <div>
                              <Label htmlFor="nagadNumber">Your Nagad Number</Label>
                              <Input 
                                id="nagadNumber"
                                value={mobilePaymentNumber}
                                onChange={(e) => setMobilePaymentNumber(e.target.value)}
                                placeholder="01XXX-XXXXXX"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="nagadTxId">Transaction ID</Label>
                              <Input 
                                id="nagadTxId"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="Enter Nagad transaction ID"
                                className="mt-1"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </label>

                    {/* Card Payment */}
                    <label className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors mt-3 ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'}`}>
                      <RadioGroupItem value="card" id="card" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CreditCard size={20} className="text-primary" />
                          <p className="font-medium">Credit/Debit Card</p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Pay securely with Visa, Mastercard, or American Express</p>
                        {paymentMethod === 'card' && (
                          <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Shield size={16} className="text-primary" />
                              Card payment will be processed securely after order confirmation.
                            </p>
                          </div>
                        )}
                      </div>
                    </label>
                  </RadioGroup>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 py-6">
                      Back
                    </Button>
                    <Button onClick={() => {
                      if (validatePaymentStep()) setStep(3);
                    }} className="flex-1 btn-primary py-6">
                      Review Order
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h2 className="font-display text-2xl">Review Your Order</h2>

                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex gap-4 p-4 bg-card rounded-lg">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-20 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product.name}</h4>
                          {item.selectedSize && <p className="text-sm text-muted-foreground">Size: {item.selectedSize}</p>}
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatPrice(item.product.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Info Summary */}
                  <div className="p-4 bg-card rounded-lg space-y-2">
                    <h4 className="font-medium">Shipping to:</h4>
                    <p className="text-sm text-muted-foreground">
                      {formData.firstName} {formData.lastName}<br />
                      {formData.address}<br />
                      {formData.city}, {formData.postalCode}<br />
                      {formData.phone}
                    </p>
                  </div>

                  {/* Payment Summary */}
                  <div className="p-4 bg-card rounded-lg space-y-2">
                    <h4 className="font-medium">Payment Method:</h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {paymentMethod === 'cod' && 'Cash on Delivery'}
                      {paymentMethod === 'bkash' && 'bKash Mobile Banking'}
                      {paymentMethod === 'nagad' && 'Nagad Mobile Banking'}
                      {paymentMethod === 'card' && 'Credit/Debit Card'}
                    </p>
                    {paymentMethod === 'cod' && (
                      <div className="mt-2 text-sm">
                        <p className="text-amber-500">Advance Payment: {formatPrice(codAdvancePayment)}</p>
                        <p className="text-muted-foreground">Pay on Delivery: {formatPrice(codRemainingPayment)}</p>
                      </div>
                    )}
                    {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <p>Transaction ID: {transactionId}</p>
                        <p>From: {mobilePaymentNumber}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
                    <Shield size={24} className="text-primary" />
                    <p className="text-sm">Your payment information is secure and encrypted</p>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1 py-6" disabled={isSubmitting}>
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

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
                <h3 className="font-display text-xl mb-6">Order Summary</h3>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
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
                        size="icon" 
                        onClick={removeDiscount}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            value={discountCode}
                            onChange={(e) => {
                              setDiscountCode(e.target.value.toUpperCase());
                              setDiscountError('');
                            }}
                            placeholder="Discount code"
                            className="pl-9 uppercase"
                          />
                        </div>
                        <Button 
                          onClick={applyDiscountCode}
                          disabled={isValidatingDiscount}
                          variant="outline"
                          className="shrink-0"
                        >
                          {isValidatingDiscount ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            'Apply'
                          )}
                        </Button>
                      </div>
                      {discountError && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle size={12} />
                          {discountError}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between text-sm text-primary">
                      <span>Discount ({appliedDiscount.code})</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-display text-lg pt-3 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(grandTotal)}</span>
                  </div>
                  
                  {/* COD Advance Payment Info */}
                  {paymentMethod === 'cod' && (
                    <div className="pt-3 border-t border-border space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-500">Advance (20%)</span>
                        <span className="text-amber-500">{formatPrice(codAdvancePayment)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">On Delivery</span>
                        <span>{formatPrice(codRemainingPayment)}</span>
                      </div>
                    </div>
                  )}
                </div>
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
