import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HelpCircle, Package, Truck, RefreshCw, CreditCard, Shield, MessageSquare } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/cart/CartSidebar';
import { SEOHead } from '@/components/SEOHead';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

const faqCategories = [
  {
    id: 'ordering',
    title: 'Ordering & Payment',
    icon: CreditCard,
    questions: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept Cash on Delivery (COD), bKash, and Nagad. For COD orders, a 20% advance payment is required via bKash or Nagad to confirm your order.',
      },
      {
        question: 'How do I use a discount code?',
        answer: 'During checkout, enter your discount code in the "Discount Code" field and click "Apply". The discount will be automatically applied to your order total if the code is valid and meets the minimum order requirements.',
      },
      {
        question: 'Can I modify or cancel my order after placing it?',
        answer: 'You can modify or cancel your order within 2 hours of placing it by contacting our customer support. After this window, we cannot guarantee changes as the order may already be processed.',
      },
      {
        question: 'Why was my order cancelled?',
        answer: 'Orders may be cancelled due to payment verification issues, item unavailability, or if the delivery address cannot be verified. We will notify you via email if this happens.',
      },
    ],
  },
  {
    id: 'shipping',
    title: 'Shipping & Delivery',
    icon: Truck,
    questions: [
      {
        question: 'What are your shipping options?',
        answer: 'We offer Standard Delivery (3-5 business days, ৳100 or free on orders over ৳5,000) and Express Delivery (1-2 business days, ৳200).',
      },
      {
        question: 'Do you ship outside Dhaka?',
        answer: 'Yes, we deliver throughout Bangladesh. Delivery times may vary for locations outside Dhaka, typically taking 5-7 business days for standard delivery.',
      },
      {
        question: 'How can I track my order?',
        answer: 'Once your order is shipped, you will receive an email with tracking information. You can also track your order by logging into your account and visiting the "My Orders" section.',
      },
      {
        question: 'What if I am not home during delivery?',
        answer: 'Our delivery partner will attempt to contact you before delivery. If you are unavailable, they will try again the next business day or arrange an alternative delivery time.',
      },
    ],
  },
  {
    id: 'returns',
    title: 'Returns & Exchanges',
    icon: RefreshCw,
    questions: [
      {
        question: 'What is your return policy?',
        answer: 'We accept returns within 7 days of delivery for unworn items with original tags attached. Items must be in their original condition and packaging.',
      },
      {
        question: 'How do I initiate a return?',
        answer: 'Contact our customer support team via email or phone with your order number and reason for return. We will provide you with return instructions and arrange for pickup.',
      },
      {
        question: 'Can I exchange an item for a different size?',
        answer: 'Yes, exchanges are available for different sizes subject to availability. Contact our support team within 7 days of delivery to arrange an exchange.',
      },
      {
        question: 'When will I receive my refund?',
        answer: 'Refunds are processed within 5-7 business days after we receive and inspect the returned item. The refund will be credited to your original payment method.',
      },
    ],
  },
  {
    id: 'products',
    title: 'Products & Sizing',
    icon: Package,
    questions: [
      {
        question: 'How do I find my correct size?',
        answer: 'Each product page includes a size guide with detailed measurements. We recommend measuring yourself and comparing with our size chart for the best fit.',
      },
      {
        question: 'Are the product colors accurate in photos?',
        answer: 'We strive to display accurate colors, but slight variations may occur due to monitor settings and lighting. Our product descriptions include detailed color information.',
      },
      {
        question: 'Do you have a physical store?',
        answer: 'Yes, we have a showroom in Gulshan-2, Dhaka. You are welcome to visit and try on products in person. Please check our contact page for hours and location.',
      },
      {
        question: 'When will out-of-stock items be available?',
        answer: 'Restock times vary by product. Sign up for notifications on the product page to be alerted when an item becomes available again.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Account & Security',
    icon: Shield,
    questions: [
      {
        question: 'How do I create an account?',
        answer: 'Click on the user icon in the header and select "Sign In / Create Account". You can register using your email address and create a password.',
      },
      {
        question: 'Is my personal information secure?',
        answer: 'Yes, we use industry-standard encryption to protect your personal information. We never share your data with third parties without your consent.',
      },
      {
        question: 'How do I reset my password?',
        answer: 'Click "Forgot Password" on the login page and enter your email address. You will receive a link to reset your password.',
      },
      {
        question: 'Can I save multiple addresses?',
        answer: 'Yes, you can save multiple shipping addresses in your account dashboard and select the appropriate one during checkout.',
      },
    ],
  },
];

const FAQPage = () => {
  return (
    <>
      <SEOHead
        title="Frequently Asked Questions"
        description="Find answers to common questions about shopping at Gen-zee.store. Learn about ordering, shipping, returns, sizing, and more."
        keywords="FAQ, help, support, shipping, returns, sizing guide, Gen-zee store"
        url="/faq"
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
              Help Center
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6">
              Frequently Asked <span className="text-gradient-gold">Questions</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Can't find what you're looking for? Contact our support team for personalized assistance.
            </p>
          </motion.div>

          {/* FAQ Categories */}
          <div className="max-w-4xl mx-auto space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
                className="glass rounded-2xl p-6 md:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <category.icon size={24} className="text-primary" />
                  </div>
                  <h2 className="font-display text-xl md:text-2xl">{category.title}</h2>
                </div>

                <Accordion type="single" collapsible className="space-y-2">
                  {category.questions.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`${category.id}-${index}`}
                      className="border border-border/50 rounded-lg px-4 bg-secondary/30"
                    >
                      <AccordionTrigger className="text-left hover:no-underline hover:text-primary py-4">
                        <span className="flex items-start gap-3">
                          <HelpCircle size={18} className="flex-shrink-0 mt-0.5 text-primary" />
                          {faq.question}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4 pl-7">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            ))}
          </div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-2xl mx-auto mt-16 text-center glass rounded-2xl p-8 md:p-12"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare size={32} className="text-primary" />
            </div>
            <h2 className="font-display text-2xl mb-4">Still Have Questions?</h2>
            <p className="text-muted-foreground mb-6">
              Our support team is here to help you with any questions or concerns.
            </p>
            <Link to="/contact">
              <Button className="btn-primary px-8 py-6">Contact Support</Button>
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default FAQPage;
