import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ShoppingBag, Search, HelpCircle, ArrowLeft } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import zenZeeLogo from "@/assets/zen-zee-logo.png";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const quickLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Shop Men", href: "/category/men", icon: ShoppingBag },
    { name: "Shop Women", href: "/category/women", icon: ShoppingBag },
    { name: "FAQ", href: "/faq", icon: HelpCircle },
  ];

  return (
    <>
      <SEOHead
        title="Page Not Found | Zen Zee Store"
        description="The page you're looking for doesn't exist. Explore our premium fashion collections."
        noIndex={true}
      />
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header with logo */}
        <header className="py-6 px-4">
          <Link to="/" className="inline-block">
            <img src={zenZeeLogo} alt="Zen Zee" className="h-10 w-auto" />
          </Link>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full text-center">
            {/* Animated 404 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <motion.h1 
                className="text-[120px] md:text-[180px] font-display font-bold leading-none"
                style={{
                  background: 'linear-gradient(180deg, hsl(var(--foreground)) 0%, hsl(var(--gold)) 50%, hsl(var(--foreground)) 100%)',
                  backgroundSize: '100% 300%',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
                animate={{
                  backgroundPosition: ['0% 0%', '0% 100%', '0% 0%'],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                404
              </motion.h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4 mb-10"
            >
              <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground">
                Page Not Found
              </h2>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                The page you're looking for seems to have wandered off. Let's get you back to exploring our premium collections.
              </p>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <Button asChild size="lg" className="gap-2">
                <Link to="/">
                  <Home size={18} />
                  Back to Home
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/category/women">
                  <Search size={18} />
                  Browse Collections
                </Link>
              </Button>
            </motion.div>

            {/* Quick links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="pt-8 border-t border-border"
            >
              <p className="text-sm text-muted-foreground mb-6">Quick Links</p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
                  >
                    <link.icon size={16} />
                    {link.name}
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Go back button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-12"
            >
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <ArrowLeft size={16} />
                Go back to previous page
              </button>
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Need help?{" "}
            <Link to="/contact" className="text-primary hover:underline">
              Contact our support team
            </Link>
          </p>
        </footer>
      </div>
    </>
  );
};

export default NotFound;
