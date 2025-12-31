import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RefreshCw, CheckCircle, XCircle, Clock, Mail, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/cart/CartSidebar';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';

const ReturnsPage = () => {
  const eligibleItems = [
    'Unworn items with original tags attached',
    'Items in original packaging',
    'Items returned within 7 days of delivery',
    'Items without any signs of use or damage',
  ];

  const nonEligibleItems = [
    'Worn, washed, or altered items',
    'Items without original tags',
    'Intimate apparel and swimwear',
    'Items marked as "Final Sale"',
    'Items returned after 7 days',
  ];

  const returnSteps = [
    {
      step: 1,
      title: 'Contact Support',
      description: 'Email us at returns@gen-zee.store or call our support line with your order number and reason for return.',
    },
    {
      step: 2,
      title: 'Get Approval',
      description: 'Our team will review your request and provide return authorization within 24 hours.',
    },
    {
      step: 3,
      title: 'Pack & Ship',
      description: 'Pack the item securely in its original packaging. We will arrange pickup from your address.',
    },
    {
      step: 4,
      title: 'Receive Refund',
      description: 'Once we receive and inspect the item, your refund will be processed within 5-7 business days.',
    },
  ];

  return (
    <>
      <SEOHead
        title="Returns & Refund Policy"
        description="Easy returns within 7 days. Learn about Gen-zee.store return policy, refund process, and exchange options. Hassle-free returns for unworn items."
        keywords="returns policy, refund, exchange, return process, hassle-free returns"
        url="/returns"
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
              Returns & Refunds
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6">
              Easy Returns, <span className="text-gradient-gold">No Hassle</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Not satisfied? We offer a 7-day return policy for unworn items in original condition.
            </p>
          </motion.div>

          {/* Return Policy Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-8 mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <RefreshCw size={28} className="text-primary" />
              </div>
              <div>
                <h2 className="font-display text-2xl">Return Policy</h2>
                <p className="text-muted-foreground">7-day hassle-free returns</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-secondary/30 rounded-lg text-center">
                <Clock size={32} className="mx-auto mb-3 text-primary" />
                <div className="text-2xl font-display text-primary mb-1">7 Days</div>
                <p className="text-sm text-muted-foreground">Return Window</p>
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg text-center">
                <RefreshCw size={32} className="mx-auto mb-3 text-primary" />
                <div className="text-2xl font-display text-primary mb-1">Free</div>
                <p className="text-sm text-muted-foreground">Return Pickup</p>
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg text-center">
                <Clock size={32} className="mx-auto mb-3 text-primary" />
                <div className="text-2xl font-display text-primary mb-1">5-7 Days</div>
                <p className="text-sm text-muted-foreground">Refund Processing</p>
              </div>
            </div>
          </motion.div>

          {/* Eligibility */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle size={20} className="text-green-500" />
                </div>
                <h3 className="font-display text-xl">Eligible for Return</h3>
              </div>
              <ul className="space-y-3">
                {eligibleItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <XCircle size={20} className="text-destructive" />
                </div>
                <h3 className="font-display text-xl">Not Eligible for Return</h3>
              </div>
              <ul className="space-y-3">
                {nonEligibleItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <XCircle size={16} className="text-destructive flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Return Process Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-8 mb-16"
          >
            <h2 className="font-display text-2xl mb-8 text-center">How to Return</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {returnSteps.map((step, index) => (
                <div key={step.step} className="relative">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-display text-primary">{step.step}</span>
                    </div>
                    <h3 className="font-medium mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {index < returnSteps.length - 1 && (
                    <div className="hidden md:block absolute top-6 left-[60%] w-[80%]">
                      <ArrowRight className="text-border" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Exchange Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-2xl p-8 mb-16"
          >
            <h2 className="font-display text-2xl mb-6">Exchange Policy</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-muted-foreground">
                We're happy to exchange items for a different size or color, subject to availability. 
                The exchange process follows the same eligibility criteria as returns.
              </p>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                <li>• Exchanges are processed within 5-7 business days after receiving the original item</li>
                <li>• If the desired size/color is not available, we will issue a full refund</li>
                <li>• You can only exchange once per item</li>
                <li>• Price differences will be charged or refunded accordingly</li>
              </ul>
            </div>
          </motion.div>

          {/* Refund Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass rounded-2xl p-8 mb-16"
          >
            <h2 className="font-display text-2xl mb-6">Refund Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Refund Methods</h3>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• <strong>bKash/Nagad payments:</strong> Refunded to the same mobile number</li>
                  <li>• <strong>COD orders:</strong> Refunded via bKash or Nagad (your choice)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-3">Refund Timeline</h3>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• Inspection: 1-2 business days after receiving item</li>
                  <li>• Processing: 3-5 business days after approval</li>
                  <li>• Total: 5-7 business days from return receipt</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center glass rounded-2xl p-8"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail size={32} className="text-primary" />
            </div>
            <h2 className="font-display text-2xl mb-4">Need to Start a Return?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Contact our support team with your order number and we'll guide you through the process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button className="btn-primary px-8 py-6">Contact Support</Button>
              </Link>
              <Link to="/faq">
                <Button variant="outline" className="px-8 py-6">View FAQ</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ReturnsPage;
