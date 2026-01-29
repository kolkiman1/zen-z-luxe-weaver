import type { ReactNode } from "react";
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AnimatePresence } from "framer-motion";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NewsletterProvider } from "@/contexts/NewsletterContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { PerformanceProvider } from "@/contexts/PerformanceContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CompareProvider } from "@/contexts/CompareContext";
import { TrackingScripts } from "@/components/TrackingScripts";
import LoadingScreen from "@/components/ui/LoadingScreen";
import PageTransition from "@/components/ui/PageTransition";
import CompareModal from "@/components/compare/CompareModal";
import CompareFloatingButton from "@/components/compare/CompareFloatingButton";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const OrderTrackingPage = lazy(() => import("./pages/OrderTrackingPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const ShippingPage = lazy(() => import("./pages/ShippingPage"));
const ReturnsPage = lazy(() => import("./pages/ReturnsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const SizeGuidePage = lazy(() => import("./pages/SizeGuidePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminInventory = lazy(() => import("./pages/admin/AdminInventory"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminInquiries = lazy(() => import("./pages/admin/AdminInquiries"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminAnnouncements = lazy(() => import("./pages/admin/AdminAnnouncements"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminMarketing = lazy(() => import("./pages/admin/AdminMarketing"));
const AdminActivityLogs = lazy(() => import("./pages/admin/AdminActivityLogs"));
const AdminTrackingAnalytics = lazy(() => import("./pages/admin/AdminTrackingAnalytics"));
const AdminSeoSettings = lazy(() => import("./pages/admin/AdminSeoSettings"));
const AdminSecurityDashboard = lazy(() => import("./pages/admin/AdminSecurityDashboard"));
const AdminEmailTemplates = lazy(() => import("./pages/admin/AdminEmailTemplates"));
const AdminSectionMedia = lazy(() => import("./pages/admin/AdminSectionMedia"));
const AdminSectionContent = lazy(() => import("./pages/admin/AdminSectionContent"));
const AdminSectionElements = lazy(() => import("./pages/admin/AdminSectionElements"));
const AdminCategoryBanners = lazy(() => import("./pages/admin/AdminCategoryBanners"));
const AdminProductCollections = lazy(() => import("./pages/admin/AdminProductCollections"));
const AdminSectionMaterials = lazy(() => import("./pages/admin/AdminSectionMaterials"));
const MobileAdminApp = lazy(() => import("./pages/admin/MobileAdminApp"));
const AdminPerformance = lazy(() => import("./pages/admin/AdminPerformance"));
const AdminThemes = lazy(() => import("./pages/admin/AdminThemes"));
const AdminNavigationPromos = lazy(() => import("./pages/admin/AdminNavigationPromos"));
const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  const withTransition = (node: ReactNode) => <PageTransition>{node}</PageTransition>;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={withTransition(<Index />)} />
        <Route path="/category/:slug" element={withTransition(<CategoryPage />)} />
        <Route path="/product/:id" element={withTransition(<ProductDetailPage />)} />
        <Route path="/wishlist" element={withTransition(<WishlistPage />)} />
        <Route path="/checkout" element={withTransition(<CheckoutPage />)} />
        <Route path="/payment-success" element={withTransition(<PaymentSuccessPage />)} />
        <Route path="/auth" element={withTransition(<AuthPage />)} />
        <Route path="/forgot-password" element={withTransition(<ForgotPasswordPage />)} />
        <Route path="/orders" element={withTransition(<OrdersPage />)} />
        <Route path="/orders/:orderId" element={withTransition(<OrderTrackingPage />)} />
        <Route path="/track-order" element={withTransition(<OrderTrackingPage />)} />
        <Route path="/dashboard" element={withTransition(<UserDashboard />)} />
        {/* Info Pages */}
        <Route path="/contact" element={withTransition(<ContactPage />)} />
        <Route path="/faq" element={withTransition(<FAQPage />)} />
        <Route path="/shipping" element={withTransition(<ShippingPage />)} />
        <Route path="/returns" element={withTransition(<ReturnsPage />)} />
        <Route path="/privacy" element={withTransition(<PrivacyPage />)} />
        <Route path="/terms" element={withTransition(<TermsPage />)} />
        <Route path="/size-guide" element={withTransition(<SizeGuidePage />)} />
        <Route path="/about" element={withTransition(<AboutPage />)} />
        {/* Admin Routes */}
        <Route path="/admin" element={withTransition(<AdminDashboard />)} />
        <Route path="/admin/products" element={withTransition(<AdminProducts />)} />
        <Route path="/admin/inventory" element={withTransition(<AdminInventory />)} />
        <Route path="/admin/orders" element={withTransition(<AdminOrders />)} />
        <Route path="/admin/customers" element={withTransition(<AdminCustomers />)} />
        <Route path="/admin/analytics" element={withTransition(<AdminAnalytics />)} />
        <Route path="/admin/tracking" element={withTransition(<AdminTrackingAnalytics />)} />
        <Route path="/admin/marketing" element={withTransition(<AdminMarketing />)} />
        <Route path="/admin/themes" element={withTransition(<AdminThemes />)} />
        <Route path="/admin/navigation-promos" element={withTransition(<AdminNavigationPromos />)} />
        <Route path="/admin/inquiries" element={withTransition(<AdminInquiries />)} />
        <Route path="/admin/users" element={withTransition(<AdminUsers />)} />
        <Route path="/admin/announcements" element={withTransition(<AdminAnnouncements />)} />
        <Route path="/admin/activity-logs" element={withTransition(<AdminActivityLogs />)} />
        <Route path="/admin/seo" element={withTransition(<AdminSeoSettings />)} />
        <Route path="/admin/section-media" element={withTransition(<AdminSectionMedia />)} />
        <Route path="/admin/section-content" element={withTransition(<AdminSectionContent />)} />
        <Route path="/admin/section-elements" element={withTransition(<AdminSectionElements />)} />
        <Route path="/admin/category-banners" element={withTransition(<AdminCategoryBanners />)} />
        <Route path="/admin/product-collections" element={withTransition(<AdminProductCollections />)} />
        <Route path="/admin/section-materials" element={withTransition(<AdminSectionMaterials />)} />
        <Route path="/admin/security" element={withTransition(<AdminSecurityDashboard />)} />
        <Route path="/admin/email-templates" element={withTransition(<AdminEmailTemplates />)} />
        <Route path="/admin/mobile" element={withTransition(<MobileAdminApp />)} />
        <Route path="/admin/performance" element={withTransition(<AdminPerformance />)} />
        <Route path="*" element={withTransition(<NotFound />)} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <NewsletterProvider>
              <LoadingProvider>
                <PerformanceProvider>
                  <ThemeProvider>
                    <CompareProvider>
                      <TooltipProvider>
                        <TrackingScripts />
                        <Toaster />
                        <Sonner />
                        <BrowserRouter>
                          <CompareModal />
                          <CompareFloatingButton />
                          <Suspense fallback={<LoadingScreen />}>
                            <AnimatedRoutes />
                          </Suspense>
                        </BrowserRouter>
                      </TooltipProvider>
                    </CompareProvider>
                  </ThemeProvider>
                </PerformanceProvider>
              </LoadingProvider>
            </NewsletterProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
