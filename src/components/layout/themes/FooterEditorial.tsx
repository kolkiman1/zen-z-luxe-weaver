import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowUpRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNewsletter } from '@/contexts/NewsletterContext';
import { toast } from 'sonner';

const FooterEditorial = () => {
  const { isSubscribed, subscribe } = useNewsletter();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error('Please enter a valid email');
    subscribe(email);
    toast.success('Subscribed', { description: 'You’ll receive editorials + new drops.' });
    setEmail('');
  };

  return (
    <footer className="border-t border-border bg-background">
      <div className="container-luxury py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <h2 className="font-display text-2xl">Zen Zee Store</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed max-w-md">
              A quieter kind of luxury—curated pieces, clean lines, and considered details.
            </p>
            <div className="mt-8">
              {!isSubscribed ? (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                  <Input
                    type="email"
                    placeholder="Email for the editorial"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-none"
                  />
                  <Button type="submit" className="btn-primary rounded-none px-6">
                    Subscribe
                  </Button>
                </form>
              ) : (
                <div className="inline-flex items-center gap-2 text-primary">
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check size={16} />
                  </span>
                  <span className="font-medium">You’re subscribed.</span>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Shop</p>
                <ul className="mt-4 space-y-3">
                  {[
                    { label: 'New Arrivals', href: '/category/new-arrivals' },
                    { label: 'Women', href: '/category/women' },
                    { label: 'Men', href: '/category/men' },
                    { label: 'Accessories', href: '/category/accessories' },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link to={l.href} className="text-sm hover:text-primary transition-colors inline-flex items-center gap-2">
                        {l.label} <ArrowUpRight size={14} className="opacity-60" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Support</p>
                <ul className="mt-4 space-y-3">
                  {[
                    { label: 'Contact', href: '/contact' },
                    { label: 'Shipping', href: '/shipping' },
                    { label: 'Returns', href: '/returns' },
                    { label: 'FAQ', href: '/faq' },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link to={l.href} className="text-sm hover:text-primary transition-colors">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="md:col-span-1 col-span-2">
                <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Contact</p>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2"><Mail size={16} className="text-primary" /> support@zen-zee.store</p>
                  <p>Dhaka, Bangladesh</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Zen Zee Store</p>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterEditorial;
