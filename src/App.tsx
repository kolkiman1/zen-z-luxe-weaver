import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NewsletterProvider } from "@/contexts/NewsletterContext";
import { TrackingScripts } from "@/components/TrackingScripts";
import LoadingScreen from "@/components/ui/LoadingScreen";

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
const MobileAdminApp = lazy(() => import("./pages/admin/MobileAdminApp"));

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <NewsletterProvider>
              <TooltipProvider>
                <TrackingScripts />
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Suspense fallback={<LoadingScreen />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/category/:slug" element={<CategoryPage />} />
                      <Route path="/product/:id" element={<ProductDetailPage />} />
                      <Route path="/wishlist" element={<WishlistPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/payment-success" element={<PaymentSuccessPage />} />
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/orders" element={<OrdersPage />} />
                      <Route path="/orders/:orderId" element={<OrderTrackingPage />} />
                      <Route path="/dashboard" element={<UserDashboard />} />
                      {/* Info Pages */}
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/faq" element={<FAQPage />} />
                      <Route path="/shipping" element={<ShippingPage />} />
                      <Route path="/returns" element={<ReturnsPage />} />
                      <Route path="/privacy" element={<PrivacyPage />} />
                      <Route path="/terms" element={<TermsPage />} />
                      <Route path="/size-guide" element={<SizeGuidePage />} />
                      <Route path="/about" element={<AboutPage />} />
                      {/* Admin Routes */}
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/admin/products" element={<AdminProducts />} />
                      <Route path="/admin/orders" element={<AdminOrders />} />
                      <Route path="/admin/customers" element={<AdminCustomers />} />
                      <Route path="/admin/analytics" element={<AdminAnalytics />} />
                      <Route path="/admin/tracking" element={<AdminTrackingAnalytics />} />
                      <Route path="/admin/marketing" element={<AdminMarketing />} />
                      <Route path="/admin/inquiries" element={<AdminInquiries />} />
                      <Route path="/admin/users" element={<AdminUsers />} />
                      <Route path="/admin/announcements" element={<AdminAnnouncements />} />
                      <Route path="/admin/activity-logs" element={<AdminActivityLogs />} />
                      <Route path="/admin/seo" element={<AdminSeoSettings />} />
                      <Route path="/admin/security" element={<AdminSecurityDashboard />} />
                      <Route path="/admin/email-templates" element={<AdminEmailTemplates />} />
                      <Route path="/admin/mobile" element={<MobileAdminApp />} />
                      <Route path="*" element={<NotFound />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </BrowserRouter>
              </TooltipProvider>
            </NewsletterProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
