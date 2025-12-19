import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      {/* Newsletter Section */}
      <div className="border-b border-border">
        <div className="container-luxury py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-2xl md:text-3xl mb-3"
            >
              Join the <span className="text-gradient-gold">Zen-Z</span> Community
            </motion.h3>
            <p className="text-muted-foreground mb-6">
              Subscribe for exclusive offers, new arrivals, and style inspiration.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-secondary border-border focus:border-primary"
              />
              <Button className="btn-primary whitespace-nowrap px-8">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-luxury py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <h2 className="font-display text-2xl font-semibold">
                zen-z<span className="text-primary">.</span>store
              </h2>
            </Link>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Premium Fashion for the Next Generation. Curated luxury pieces for the modern
              Bangladeshi.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {['New Arrivals', 'Best Sellers', 'Men', 'Women', 'Jewelry', 'Accessories'].map(
                (link) => (
                  <li key={link}>
                    <Link
                      to={`/category/${link.toLowerCase().replace(' ', '-')}`}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-display text-lg mb-4">Customer Service</h4>
            <ul className="space-y-3">
              {[
                'Contact Us',
                'Shipping & Returns',
                'Size Guide',
                'Track Order',
                'FAQs',
                'Privacy Policy',
              ].map((link) => (
                <li key={link}>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin size={18} className="flex-shrink-0 mt-0.5 text-primary" />
                <span>Gulshan-2, Dhaka 1212, Bangladesh</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone size={18} className="flex-shrink-0 text-primary" />
                <span>+880 1XXX-XXXXXX</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail size={18} className="flex-shrink-0 text-primary" />
                <span>hello@zen-z.store</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container-luxury py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} zen-z.store. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link to="#" className="hover:text-primary transition-colors">
                Terms & Conditions
              </Link>
              <Link to="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
