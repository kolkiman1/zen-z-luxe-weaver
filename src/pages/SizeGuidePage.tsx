import { motion } from 'framer-motion';
import { Ruler, Info } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/cart/CartSidebar';
import { SEOHead } from '@/components/SEOHead';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SizeGuidePage = () => {
  const mensSizes = {
    tops: [
      { size: 'S', chest: '36-38', waist: '28-30', length: '27' },
      { size: 'M', chest: '38-40', waist: '30-32', length: '28' },
      { size: 'L', chest: '40-42', waist: '32-34', length: '29' },
      { size: 'XL', chest: '42-44', waist: '34-36', length: '30' },
      { size: 'XXL', chest: '44-46', waist: '36-38', length: '31' },
    ],
    bottoms: [
      { size: '28', waist: '28', hip: '36', length: '40' },
      { size: '30', waist: '30', hip: '38', length: '40' },
      { size: '32', waist: '32', hip: '40', length: '41' },
      { size: '34', waist: '34', hip: '42', length: '41' },
      { size: '36', waist: '36', hip: '44', length: '42' },
    ],
  };

  const womensSizes = {
    tops: [
      { size: 'XS', bust: '32-33', waist: '24-25', hip: '34-35' },
      { size: 'S', bust: '34-35', waist: '26-27', hip: '36-37' },
      { size: 'M', bust: '36-37', waist: '28-29', hip: '38-39' },
      { size: 'L', bust: '38-40', waist: '30-32', hip: '40-42' },
      { size: 'XL', bust: '41-43', waist: '33-35', hip: '43-45' },
    ],
    sarees: [
      { type: 'Standard Saree', length: '5.5 meters', blouse: '0.8 meters' },
      { type: 'With Border', length: '5.5 meters', blouse: '0.8 meters' },
      { type: 'Heavy Work', length: '5.5 meters', blouse: '1 meter' },
    ],
  };

  const measurementTips = [
    { title: 'Chest/Bust', tip: 'Measure around the fullest part of your chest, keeping the tape horizontal.' },
    { title: 'Waist', tip: 'Measure around your natural waistline, typically the narrowest part of your torso.' },
    { title: 'Hip', tip: 'Measure around the fullest part of your hips, about 8 inches below your waist.' },
    { title: 'Length', tip: 'For tops, measure from shoulder to hem. For bottoms, measure from waist to ankle.' },
  ];

  return (
    <>
      <SEOHead
        title="Size Guide"
        description="Find your perfect fit with our comprehensive size guide. Detailed measurements for men's and women's clothing at zen-z.store."
        keywords="size guide, size chart, measurements, how to measure, clothing sizes"
        url="/size-guide"
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
              Fit Guide
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6">
              Find Your <span className="text-gradient-gold">Perfect Fit</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Use our size guide to find the perfect fit. All measurements are in inches unless specified.
            </p>
          </motion.div>

          {/* Size Tabs */}
          <Tabs defaultValue="mens" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="mens" className="text-lg py-3">Men's Sizing</TabsTrigger>
              <TabsTrigger value="womens" className="text-lg py-3">Women's Sizing</TabsTrigger>
            </TabsList>

            {/* Men's Sizes */}
            <TabsContent value="mens" className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-8"
              >
                <h2 className="font-display text-2xl mb-6">Shirts, T-Shirts & Jackets</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium">Size</th>
                        <th className="text-left py-3 px-4 font-medium">Chest (in)</th>
                        <th className="text-left py-3 px-4 font-medium">Waist (in)</th>
                        <th className="text-left py-3 px-4 font-medium">Length (in)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mensSizes.tops.map((row, index) => (
                        <tr key={index} className="border-b border-border/50 hover:bg-secondary/30">
                          <td className="py-3 px-4 font-medium">{row.size}</td>
                          <td className="py-3 px-4 text-muted-foreground">{row.chest}</td>
                          <td className="py-3 px-4 text-muted-foreground">{row.waist}</td>
                          <td className="py-3 px-4 text-muted-foreground">{row.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-8"
              >
                <h2 className="font-display text-2xl mb-6">Pants & Jeans</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium">Size</th>
                        <th className="text-left py-3 px-4 font-medium">Waist (in)</th>
                        <th className="text-left py-3 px-4 font-medium">Hip (in)</th>
                        <th className="text-left py-3 px-4 font-medium">Length (in)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mensSizes.bottoms.map((row, index) => (
                        <tr key={index} className="border-b border-border/50 hover:bg-secondary/30">
                          <td className="py-3 px-4 font-medium">{row.size}</td>
                          <td className="py-3 px-4 text-muted-foreground">{row.waist}</td>
                          <td className="py-3 px-4 text-muted-foreground">{row.hip}</td>
                          <td className="py-3 px-4 text-muted-foreground">{row.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </TabsContent>

            {/* Women's Sizes */}
            <TabsContent value="womens" className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-8"
              >
                <h2 className="font-display text-2xl mb-6">Tops, Dresses & Kurtis</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium">Size</th>
                        <th className="text-left py-3 px-4 font-medium">Bust (in)</th>
                        <th className="text-left py-3 px-4 font-medium">Waist (in)</th>
                        <th className="text-left py-3 px-4 font-medium">Hip (in)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {womensSizes.tops.map((row, index) => (
                        <tr key={index} className="border-b border-border/50 hover:bg-secondary/30">
                          <td className="py-3 px-4 font-medium">{row.size}</td>
                          <td className="py-3 px-4 text-muted-foreground">{row.bust}</td>
                          <td className="py-3 px-4 text-muted-foreground">{row.waist}</td>
                          <td className="py-3 px-4 text-muted-foreground">{row.hip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-8"
              >
                <h2 className="font-display text-2xl mb-6">Sarees</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium">Type</th>
                        <th className="text-left py-3 px-4 font-medium">Saree Length</th>
                        <th className="text-left py-3 px-4 font-medium">Blouse Piece</th>
                      </tr>
                    </thead>
                    <tbody>
                      {womensSizes.sarees.map((row, index) => (
                        <tr key={index} className="border-b border-border/50 hover:bg-secondary/30">
                          <td className="py-3 px-4 font-medium">{row.type}</td>
                          <td className="py-3 px-4 text-muted-foreground">{row.length}</td>
                          <td className="py-3 px-4 text-muted-foreground">{row.blouse}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>

          {/* How to Measure */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto mt-12 glass rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Ruler size={24} className="text-primary" />
              </div>
              <h2 className="font-display text-2xl">How to Measure</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {measurementTips.map((tip, index) => (
                <div key={index} className="p-4 bg-secondary/30 rounded-lg">
                  <h3 className="font-medium mb-2">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground">{tip.tip}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Tips Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-4xl mx-auto mt-8 glass rounded-2xl p-8 border-primary/20"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Info size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Sizing Tips</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• If you're between sizes, we recommend going up a size for a more comfortable fit.</li>
                  <li>• For fitted styles, choose your exact size. For relaxed styles, consider sizing up.</li>
                  <li>• Product pages include specific sizing notes when applicable.</li>
                  <li>• Still unsure? Contact our support team for personalized sizing advice.</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default SizeGuidePage;
