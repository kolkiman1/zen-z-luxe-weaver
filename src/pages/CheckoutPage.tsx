import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ChevronLeft, CreditCard, Truck, Shield, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/cart/CartSidebar';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  const grandTotal = totalPrice + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please sign in to place an order');
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: grandTotal,
          shipping_address: formData.address,
          shipping_city: formData.city,
          shipping_postal_code: formData.postalCode,
          payment_method: paymentMethod,
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
      <Helmet>
        <title>Checkout | zen-z.store</title>
        <meta name="description" content="Complete your purchase at zen-z.store. Secure checkout with multiple payment options." />
      </Helmet>

      <Header />
      <CartSidebar />

      <main className="pt-24 pb-16 min-h-screen">
        <div className="container-luxury">
          {/* Back Link */}
          <Link to="/category/all" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ChevronLeft size={18} />
            Continue Shopping
          </Link>

          {/* Login prompt if not authenticated */}
          {!user && (
            <div className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm">
                <Link to="/auth" className="text-primary hover:underline font-medium">Sign in</Link> to save your order history and get faster checkout.
              </p>
            </div>
          )}

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
                    <label className="flex items-center gap-4 p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <RadioGroupItem value="cod" id="cod" />
                      <div className="flex-1">
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">Pay when you receive</p>
                      </div>
                      <Truck size={24} className="text-primary" />
                    </label>
                    <label className="flex items-center gap-4 p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors mt-3">
                      <RadioGroupItem value="card" id="card" />
                      <div className="flex-1">
                        <p className="font-medium">Credit/Debit Card</p>
                        <p className="text-sm text-muted-foreground">Secure payment via Stripe</p>
                      </div>
                      <CreditCard size={24} className="text-primary" />
                    </label>
                    <label className="flex items-center gap-4 p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors mt-3">
                      <RadioGroupItem value="bkash" id="bkash" />
                      <div className="flex-1">
                        <p className="font-medium">bKash</p>
                        <p className="text-sm text-muted-foreground">Mobile payment</p>
                      </div>
                      <div className="w-12 h-8 bg-pink-500 rounded flex items-center justify-center text-white text-xs font-bold">bKash</div>
                    </label>
                  </RadioGroup>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 py-6">
                      Back
                    </Button>
                    <Button onClick={() => setStep(3)} className="flex-1 btn-primary py-6">
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

                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between font-display text-lg pt-3 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(grandTotal)}</span>
                  </div>
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
