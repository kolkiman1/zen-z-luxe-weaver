import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Truck, Clock, MapPin, Package, CheckCircle, AlertTriangle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/cart/CartSidebar';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';

const ShippingPage = () => {
  const shippingOptions = [
    {
      title: 'Standard Delivery',
      time: '3-5 Business Days',
      price: '৳100',
      freeAbove: '৳5,000',
      icon: Truck,
      features: [
        'Available throughout Bangladesh',
        'Free for orders above ৳5,000',
        'Real-time tracking',
        'SMS notifications',
      ],
    },
    {
      title: 'Express Delivery',
      time: '1-2 Business Days',
      price: '৳200',
      freeAbove: null,
      icon: Clock,
      features: [
        'Priority handling',
        'Faster delivery in Dhaka',
        'Same-day dispatch',
        'Premium packaging',
      ],
    },
  ];

  const deliveryZones = [
    { zone: 'Dhaka City', standard: '2-3 days', express: '1 day' },
    { zone: 'Dhaka Suburbs', standard: '3-4 days', express: '1-2 days' },
    { zone: 'Chittagong', standard: '4-5 days', express: '2-3 days' },
    { zone: 'Other Districts', standard: '5-7 days', express: '3-4 days' },
  ];

  return (
    <>
      <SEOHead
        title="Shipping & Delivery"
        description="Learn about zen-z.store shipping options, delivery times, and costs. Free shipping on orders over ৳5,000. Fast and reliable delivery across Bangladesh."
        keywords="shipping, delivery, bangladesh shipping, free delivery, express delivery"
        url="/shipping"
      />

      <Header />
      <CartSidebar />

      <main className="pt-24 pb-16 min-h-screen">
        <div className="container-luxury">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-block px-4 py-1.5 mb-4 text-xs tracking-[0.2em] uppercase bg-primary/10 border border-primary/20 rounded-full text-primary">
              Shipping Info
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6">
              Shipping & <span className="text-gradient-gold">Delivery</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Fast, reliable delivery across Bangladesh. Free shipping on orders over ৳5,000.
            </p>
          </motion.div>

          {/* Shipping Options */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {shippingOptions.map((option, index) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <option.icon size={28} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl">{option.title}</h2>
                    <p className="text-muted-foreground">{option.time}</p>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-display text-primary">{option.price}</span>
                  {option.freeAbove && (
                    <span className="text-sm text-muted-foreground">
                      (Free on orders above {option.freeAbove})
                    </span>
                  )}
                </div>

                <ul className="space-y-3">
                  {option.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <CheckCircle size={16} className="text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Delivery Zones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-8 mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin size={24} className="text-primary" />
              </div>
              <h2 className="font-display text-2xl">Delivery Zones</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-medium">Zone</th>
                    <th className="text-left py-4 px-4 font-medium">Standard Delivery</th>
                    <th className="text-left py-4 px-4 font-medium">Express Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryZones.map((zone, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="py-4 px-4 font-medium">{zone.zone}</td>
                      <td className="py-4 px-4 text-muted-foreground">{zone.standard}</td>
                      <td className="py-4 px-4 text-muted-foreground">{zone.express}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Order Tracking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-8 mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package size={24} className="text-primary" />
              </div>
              <h2 className="font-display text-2xl">Order Tracking</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-secondary/30 rounded-lg">
                <div className="text-3xl font-display text-primary mb-2">1</div>
                <h3 className="font-medium mb-1">Order Confirmed</h3>
                <p className="text-sm text-muted-foreground">You'll receive an email confirmation with your order details.</p>
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg">
                <div className="text-3xl font-display text-primary mb-2">2</div>
                <h3 className="font-medium mb-1">Shipped</h3>
                <p className="text-sm text-muted-foreground">Tracking number sent via email and SMS.</p>
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg">
                <div className="text-3xl font-display text-primary mb-2">3</div>
                <h3 className="font-medium mb-1">Delivered</h3>
                <p className="text-sm text-muted-foreground">Package arrives at your doorstep.</p>
              </div>
            </div>
          </motion.div>

          {/* Important Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-2xl p-8 border-amber-500/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle size={24} className="text-amber-500" />
              </div>
              <h2 className="font-display text-2xl">Important Notes</h2>
            </div>

            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle size={16} className="text-amber-500 flex-shrink-0 mt-1" />
                <span>Delivery times are estimates and may vary during holidays or peak seasons.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={16} className="text-amber-500 flex-shrink-0 mt-1" />
                <span>Please ensure someone is available to receive the package at the delivery address.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={16} className="text-amber-500 flex-shrink-0 mt-1" />
                <span>For COD orders, please have the exact amount ready for the delivery person.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={16} className="text-amber-500 flex-shrink-0 mt-1" />
                <span>Contact us immediately if your package shows as delivered but you haven't received it.</span>
              </li>
            </ul>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-12"
          >
            <p className="text-muted-foreground mb-4">Have questions about shipping?</p>
            <Link to="/contact">
              <Button className="btn-primary px-8 py-6">Contact Us</Button>
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ShippingPage;
