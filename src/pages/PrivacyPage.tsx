import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/cart/CartSidebar';
import { SEOHead } from '@/components/SEOHead';

const PrivacyPage = () => {
  const sections = [
    {
      title: '1. Information We Collect',
      content: `We collect information you provide directly to us, including:
      
• **Personal Information:** Name, email address, phone number, and shipping address when you create an account or place an order.
• **Payment Information:** Payment details are processed securely through our payment partners (bKash, Nagad). We do not store complete payment information.
• **Order Information:** Details about your purchases, preferences, and order history.
• **Communication Data:** Messages you send us through contact forms or customer support.
• **Device Information:** IP address, browser type, and device information for security and analytics purposes.`,
    },
    {
      title: '2. How We Use Your Information',
      content: `We use the information we collect to:

• Process and fulfill your orders
• Send order confirmations and shipping updates
• Provide customer support
• Send promotional emails (with your consent)
• Improve our website and services
• Prevent fraud and enhance security
• Comply with legal obligations`,
    },
    {
      title: '3. Information Sharing',
      content: `We may share your information with:

• **Service Providers:** Delivery partners, payment processors, and IT service providers who help us operate our business.
• **Legal Requirements:** When required by law or to protect our rights and safety.

We do NOT sell, rent, or trade your personal information to third parties for marketing purposes.`,
    },
    {
      title: '4. Data Security',
      content: `We implement appropriate security measures to protect your personal information:

• SSL encryption for data transmission
• Secure servers and databases
• Regular security audits
• Limited employee access to personal data
• Secure payment processing through trusted partners

While we strive to protect your data, no method of transmission over the internet is 100% secure.`,
    },
    {
      title: '5. Your Rights',
      content: `You have the right to:

• **Access:** Request a copy of your personal data
• **Correct:** Update or correct inaccurate information
• **Delete:** Request deletion of your account and personal data
• **Opt-out:** Unsubscribe from marketing communications at any time
• **Withdraw Consent:** Withdraw consent for data processing

To exercise these rights, contact us at privacy@gen-zee.store`,
    },
    {
      title: '6. Cookies',
      content: `We use cookies and similar technologies to:

• Remember your preferences
• Keep you signed in
• Analyze site traffic and usage
• Improve user experience

You can control cookie settings through your browser preferences.`,
    },
    {
      title: '7. Third-Party Links',
      content: `Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to read their privacy policies before providing any personal information.`,
    },
    {
      title: '8. Children\'s Privacy',
      content: `Our services are not intended for children under 16. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.`,
    },
    {
      title: '9. Changes to This Policy',
      content: `We may update this Privacy Policy periodically. Changes will be posted on this page with an updated revision date. We encourage you to review this policy regularly.`,
    },
    {
      title: '10. Contact Us',
      content: `If you have questions about this Privacy Policy or our data practices, contact us at:

**Email:** privacy@gen-zee.store
**Phone:** +880 1XXX-XXXXXX
**Address:** Gulshan-2, Dhaka 1212, Bangladesh`,
    },
  ];

  return (
    <>
      <SEOHead
        title="Privacy Policy"
        description="Learn how zen-z.store collects, uses, and protects your personal information. Your privacy matters to us."
        keywords="privacy policy, data protection, personal information, privacy"
        url="/privacy"
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
              Privacy <span className="text-gradient-gold">Policy</span>
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
              At zen-z.store ("we," "us," or "our"), we are committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you visit our website or make a purchase. Please read this policy carefully.
            </p>
          </motion.div>

          {/* Policy Sections */}
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

export default PrivacyPage;
