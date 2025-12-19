import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const BrandBanner = () => {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1920&q=80"
          alt="Indian Luxury Fashion"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="container-luxury relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary tracking-[0.3em] uppercase text-sm mb-4"
          >
            The Zen-Z Promise
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl mb-6"
          >
            Crafted with Passion,
            <br />
            <span className="text-gradient-gold">Designed for You</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-foreground/70 text-base md:text-lg mb-10 leading-relaxed"
          >
            We believe luxury should be accessible. Every piece in our collection is
            carefully curated to bring you premium quality, timeless design, and
            exceptional value. Experience the difference of true craftsmanship.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/about">
              <Button className="btn-primary px-8 py-6">
                Our Story
              </Button>
            </Link>
            <Link to="/category/all">
              <Button variant="outline" className="btn-outline-gold px-8 py-6">
                Explore Collection
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.3 }}
        viewport={{ once: true }}
        className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-primary/20 via-transparent to-transparent pointer-events-none"
      />
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.3 }}
        viewport={{ once: true }}
        className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-primary/20 via-transparent to-transparent pointer-events-none"
      />
    </section>
  );
};

export default BrandBanner;
