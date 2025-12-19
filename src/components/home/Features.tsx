import { motion } from 'framer-motion';
import { Truck, Shield, RefreshCw, Headphones } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'Free shipping on orders above ৳5,000 across Bangladesh',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: 'Your payment information is safe with us',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '7-day hassle-free return and exchange policy',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Dedicated customer support anytime, anywhere',
  },
];

const Features = () => {
  return (
    <section className="py-12 md:py-16 border-y border-border bg-card">
      <div className="container-luxury">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center text-center p-4"
            >
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-4">
                <feature.icon size={24} className="text-primary" />
              </div>
              <h3 className="font-display text-base md:text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
