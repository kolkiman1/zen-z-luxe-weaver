import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/cart/CartSidebar';
import { SEOHead } from '@/components/SEOHead';

const TermsPage = () => {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: `By accessing and using zen-z.store, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our website or services.`,
    },
    {
      title: '2. Use of Website',
      content: `You agree to use our website only for lawful purposes and in a way that does not infringe upon the rights of others. You must not:

• Use the website in any way that is unlawful or fraudulent
• Attempt to gain unauthorized access to our systems
• Transmit any harmful or malicious code
• Interfere with the proper working of the website
• Use automated systems to access the website without permission`,
    },
    {
      title: '3. Products and Pricing',
      content: `• All products are subject to availability
• Prices are listed in Bangladeshi Taka (BDT) and are subject to change without notice
• We reserve the right to limit quantities
• Product images are for illustration purposes and may differ slightly from actual products
• We make every effort to display accurate product information but do not guarantee complete accuracy`,
    },
    {
      title: '4. Orders and Payment',
      content: `• All orders are subject to acceptance and availability
• We reserve the right to refuse or cancel any order at our discretion
• Payment must be made in full before order dispatch
• For COD orders, 20% advance payment is required to confirm the order
• You agree to provide accurate billing and shipping information`,
    },
    {
      title: '5. Shipping and Delivery',
      content: `• Delivery times are estimates and not guaranteed
• Risk of loss passes to you upon delivery
• You are responsible for inspecting packages upon delivery
• Claims for damaged or missing items must be reported within 24 hours of delivery
• We are not responsible for delays caused by circumstances beyond our control`,
    },
    {
      title: '6. Returns and Refunds',
      content: `• Returns are accepted within 7 days of delivery for eligible items
• Items must be unworn, unwashed, and in original condition with tags attached
• Refunds are processed within 5-7 business days after receiving returned items
• Original shipping costs are non-refundable
• Please refer to our Returns Policy for complete details`,
    },
    {
      title: '7. User Accounts',
      content: `• You are responsible for maintaining the confidentiality of your account credentials
• You are responsible for all activities under your account
• You must provide accurate and complete registration information
• We reserve the right to suspend or terminate accounts for violations of these terms
• You must notify us immediately of any unauthorized use of your account`,
    },
    {
      title: '8. Intellectual Property',
      content: `All content on this website, including but not limited to text, graphics, logos, images, and software, is the property of zen-z.store and is protected by intellectual property laws. You may not:

• Copy, reproduce, or distribute any content without permission
• Use our trademarks without written consent
• Modify or create derivative works from our content`,
    },
    {
      title: '9. Limitation of Liability',
      content: `To the maximum extent permitted by law:

• We are not liable for any indirect, incidental, or consequential damages
• Our liability is limited to the amount paid for the product in question
• We do not guarantee uninterrupted or error-free website operation
• We are not responsible for third-party content or services`,
    },
    {
      title: '10. Indemnification',
      content: `You agree to indemnify and hold harmless zen-z.store, its officers, directors, employees, and agents from any claims, damages, or expenses arising from:

• Your use of the website
• Your violation of these terms
• Your violation of any third-party rights`,
    },
    {
      title: '11. Governing Law',
      content: `These Terms and Conditions are governed by the laws of Bangladesh. Any disputes shall be subject to the exclusive jurisdiction of the courts in Dhaka, Bangladesh.`,
    },
    {
      title: '12. Changes to Terms',
      content: `We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the website constitutes acceptance of the modified terms.`,
    },
    {
      title: '13. Contact Information',
      content: `For questions about these Terms and Conditions, please contact us:

**Email:** legal@zen-z.store
**Phone:** +880 1XXX-XXXXXX
**Address:** Gulshan-2, Dhaka 1212, Bangladesh`,
    },
  ];

  return (
    <>
      <SEOHead
        title="Terms & Conditions"
        description="Read the terms and conditions for using zen-z.store. Understand your rights and responsibilities when shopping with us."
        keywords="terms and conditions, terms of service, legal, user agreement"
        url="/terms"
        noIndex={false}
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
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6">
              Terms & <span className="text-gradient-gold">Conditions</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Last updated: December 2024
            </p>
          </motion.div>

          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-8 mb-8 max-w-4xl mx-auto"
          >
            <p className="text-muted-foreground leading-relaxed">
              Welcome to zen-z.store. These Terms and Conditions govern your use of our website 
              and the purchase of products from our online store. By accessing our website or placing 
              an order, you agree to be bound by these terms.
            </p>
          </motion.div>

          {/* Terms Sections */}
          <div className="max-w-4xl mx-auto space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="glass rounded-2xl p-8"
              >
                <h2 className="font-display text-xl mb-4">{section.title}</h2>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default TermsPage;
