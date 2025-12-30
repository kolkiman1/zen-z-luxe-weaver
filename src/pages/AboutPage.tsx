import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Award, Users, Globe, Sparkles, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/cart/CartSidebar';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';

const AboutPage = () => {
  const stats = [
    { value: '10K+', label: 'Happy Customers' },
    { value: '500+', label: 'Premium Products' },
    { value: '50+', label: 'Cities Served' },
    { value: '99%', label: 'Satisfaction Rate' },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Passion for Fashion',
      description: 'We curate collections with love, ensuring each piece reflects quality and contemporary style.',
    },
    {
      icon: Award,
      title: 'Quality First',
      description: 'Every product undergoes rigorous quality checks before reaching your doorstep.',
    },
    {
      icon: Users,
      title: 'Customer Focus',
      description: "Your satisfaction is our priority. We're here to help you look and feel your best.",
    },
    {
      icon: Globe,
      title: 'Local & Global',
      description: 'Bringing the best of Bangladeshi craftsmanship and international trends together.',
    },
  ];

  return (
    <>
      <SEOHead
        title="About Us"
        description="Discover zen-z.store - Bangladesh's premier online fashion destination. Learn about our mission to bring premium fashion to the next generation."
        keywords="about zen-z, fashion store bangladesh, online shopping, premium fashion"
        url="/about"
      />

      <Header />
      <CartSidebar />

      <main className="pt-24 pb-16 min-h-screen">
        <div className="container-luxury">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto mb-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <Sparkles size={40} className="text-primary" />
            </motion.div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6">
              Redefining Fashion for the <span className="text-gradient-gold">Next Generation</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
              zen-z.store is Bangladesh's premier destination for premium fashion, jewelry, and accessories. 
              We believe that everyone deserves to express their unique style with quality pieces that don't break the bank.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="glass rounded-2xl p-6 text-center"
              >
                <div className="text-3xl md:text-4xl font-display text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Story Section */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="font-display text-3xl md:text-4xl mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded in 2024, zen-z.store emerged from a simple observation: young Bangladeshis 
                  were craving access to premium fashion that matched their aspirations and lifestyle.
                </p>
                <p>
                  We started with a vision to bridge the gap between international fashion trends 
                  and local accessibility. Today, we've grown into a trusted platform serving 
                  thousands of fashion-forward customers across Bangladesh.
                </p>
                <p>
                  Our name "zen-z" represents the harmony between traditional craftsmanship and 
                  modern aesthetics – a zen approach to fashion for Generation Z and beyond.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="glass rounded-2xl p-2 aspect-square"
            >
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
                alt="Fashion collection"
                className="w-full h-full object-cover rounded-xl"
              />
            </motion.div>
          </div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl mb-4">Our Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                These principles guide everything we do, from selecting products to serving our customers.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="glass rounded-2xl p-6 text-center hover:border-primary/50 transition-colors"
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                    <value.icon size={28} className="text-primary" />
                  </div>
                  <h3 className="font-display text-lg mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-center glass rounded-2xl p-12"
          >
            <h2 className="font-display text-3xl md:text-4xl mb-4">
              Ready to Elevate Your Style?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Explore our curated collections and discover the perfect pieces to express your unique personality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/category/women">
                <Button className="btn-primary px-8 py-6 gap-2">
                  Shop Women
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/category/men">
                <Button variant="outline" className="btn-outline-gold px-8 py-6 gap-2">
                  Shop Men
                  <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default AboutPage;
