import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNewsletter } from '@/contexts/NewsletterContext';
import { toast } from 'sonner';

const FooterBrutalist = () => {
  const { isSubscribed, subscribe } = useNewsletter();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error('Please enter a valid email');
    subscribe(email);
    toast.success('Subscribed', { description: 'Welcome to the drop list.' });
    setEmail('');
  };

  return (
    <footer className="bg-background border-t-2 border-border">
      <div className="container-luxury py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5">
            <h2 className="font-body font-black uppercase tracking-tight text-2xl">
              Zen <span className="text-primary">Zee</span>
            </h2>
            <p className="mt-3 text-muted-foreground text-sm max-w-md">
              Brutalist mode: sharp edges, loud type, no fluff.
            </p>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-widest">Shop</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link to="/category/new-arrivals" className="hover:text-primary">New Arrivals</Link></li>
                <li><Link to="/category/women" className="hover:text-primary">Women</Link></li>
                <li><Link to="/category/men" className="hover:text-primary">Men</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest">Support</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
                <li><Link to="/shipping" className="hover:text-primary">Shipping</Link></li>
                <li><Link to="/returns" className="hover:text-primary">Returns</Link></li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs font-black uppercase tracking-widest">Drop List</p>
              <div className="mt-4">
                {!isSubscribed ? (
                  <form onSubmit={handleSubscribe} className="flex gap-2">
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email"
                      className="rounded-none border-2"
                    />
                    <Button type="submit" className="btn-primary rounded-none px-5">
                      Join
                    </Button>
                  </form>
                ) : (
                  <div className="inline-flex items-center gap-2 text-primary">
                    <span className="w-8 h-8 bg-primary/10 flex items-center justify-center border-2 border-border">
                      <Check size={16} />
                    </span>
                    <span className="text-sm font-black uppercase tracking-widest">In</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 pt-6 border-t-2 border-border flex flex-col md:flex-row items-center justify-between gap-3 text-sm"
        >
          <p className="text-muted-foreground">© {new Date().getFullYear()} Zen Zee Store</p>
          <div className="flex items-center gap-5">
            <Link to="/terms" className="hover:text-primary">Terms</Link>
            <Link to="/privacy" className="hover:text-primary">Privacy</Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default FooterBrutalist;
