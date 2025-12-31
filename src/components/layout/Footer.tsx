import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone, ArrowUpRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNewsletter } from '@/contexts/NewsletterContext';
import { toast } from 'sonner';

const Footer = () => {
  const { isSubscribed, subscribe } = useNewsletter();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }
    subscribe(email);
    toast.success('Welcome to the Gen-Zee community!', {
      description: 'You\'ll receive exclusive offers and style inspiration.',
    });
    setEmail('');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <footer className="relative bg-gradient-to-b from-background via-card to-card/95 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
      </div>

      {/* Newsletter Section - Only show if not subscribed */}
      {!isSubscribed && (
        <div className="relative border-b border-border/50">
          <div className="container-luxury py-16 md:py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto text-center"
            >
              <span className="inline-block px-4 py-1.5 mb-4 text-xs tracking-[0.2em] uppercase bg-primary/10 border border-primary/20 rounded-full text-primary">
                Newsletter
              </span>
              <h3 className="font-display text-3xl md:text-4xl mb-4">
                Join the <span className="text-gradient-gold">Gen-Zee</span> Community
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Subscribe for exclusive offers, new arrivals, and style inspiration.
              </p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-secondary/50 border-border/50 focus:border-primary backdrop-blur-sm h-12"
                />
                <Button type="submit" className="btn-primary whitespace-nowrap px-8 h-12">
                  Subscribe
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      )}

      {/* Subscribed confirmation banner */}
      {isSubscribed && (
        <div className="relative border-b border-border/50">
          <div className="container-luxury py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-3 text-primary"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Check size={16} />
              </div>
              <span className="font-medium">You're part of the Gen-Zee community!</span>
            </motion.div>
          </div>
        </div>
      )}

      {/* Main Footer */}
      <div className="relative container-luxury py-16 md:py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16"
        >
          {/* Brand */}
          <motion.div variants={itemVariants}>
            <Link to="/" className="inline-block mb-6">
              <h2 className="font-display text-2xl font-semibold">
                Gen-zee<span className="text-primary">.</span>store
              </h2>
            </Link>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
              Premium Fashion for the Next Generation. Curated luxury pieces for the modern
              Bangladeshi.
            </p>
            <div className="flex gap-2">
              {[
                { icon: Instagram, label: 'Instagram' },
                { icon: Facebook, label: 'Facebook' },
                { icon: Twitter, label: 'Twitter' },
              ].map(({ icon: Icon, label }) => (
                <motion.a
                  key={label}
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-11 h-11 rounded-full bg-secondary/50 backdrop-blur-sm border border-border/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-px bg-gradient-to-r from-primary to-transparent" />
              <h4 className="font-display text-sm tracking-[0.15em] uppercase text-foreground">
                Quick Links
              </h4>
            </div>
            <ul className="space-y-4">
              {[
                { label: 'New Arrivals', href: '/category/new-arrivals' },
                { label: 'Men', href: '/category/men' },
                { label: 'Women', href: '/category/women' },
                { label: 'Jewelry', href: '/category/jewelry' },
                { label: 'Accessories', href: '/category/accessories' },
                { label: 'About Us', href: '/about' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-primary transition-all duration-300" />
                    <span>{link.label}</span>
                    <ArrowUpRight size={12} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Customer Service */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-px bg-gradient-to-r from-gold to-transparent" />
              <h4 className="font-display text-sm tracking-[0.15em] uppercase text-foreground">
                Customer Service
              </h4>
            </div>
            <ul className="space-y-4">
              {[
                { label: 'Contact Us', href: '/contact' },
                { label: 'Shipping & Delivery', href: '/shipping' },
                { label: 'Returns & Refunds', href: '/returns' },
                { label: 'Size Guide', href: '/size-guide' },
                { label: 'FAQs', href: '/faq' },
                { label: 'Track Order', href: '/orders' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-gold transition-all duration-300" />
                    <span>{link.label}</span>
                    <ArrowUpRight size={12} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-px bg-gradient-to-r from-primary via-gold to-transparent" />
              <h4 className="font-display text-sm tracking-[0.15em] uppercase text-foreground">
                Contact Us
              </h4>
            </div>
            <ul className="space-y-5">
              <li>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-4 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <MapPin size={18} className="text-primary" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground/70 uppercase tracking-wider">Address</span>
                    <p className="text-sm text-foreground mt-0.5">Gulshan-2, Dhaka 1212, Bangladesh</p>
                  </div>
                </motion.div>
              </li>
              <li>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-4 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors">
                    <Phone size={18} className="text-gold" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground/70 uppercase tracking-wider">Phone</span>
                    <p className="text-sm text-foreground mt-0.5">+880 1XXX-XXXXXX</p>
                  </div>
                </motion.div>
              </li>
              <li>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-4 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Mail size={18} className="text-primary" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground/70 uppercase tracking-wider">Email</span>
                    <p className="text-sm text-foreground mt-0.5">hello@gen-zee.store</p>
                  </div>
                </motion.div>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-border/30">
        <div className="container-luxury py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p className="flex items-center gap-1">
              &copy; {new Date().getFullYear()} 
              <span className="text-foreground font-medium">Gen-zee.store</span>
              <span className="mx-1">·</span>
              All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/terms" className="hover:text-foreground transition-colors relative group">
                Terms & Conditions
                <span className="absolute -bottom-0.5 left-0 w-0 group-hover:w-full h-px bg-primary transition-all duration-300" />
              </Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors relative group">
                Privacy Policy
                <span className="absolute -bottom-0.5 left-0 w-0 group-hover:w-full h-px bg-primary transition-all duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
