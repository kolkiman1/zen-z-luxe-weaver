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
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import WishlistPage from "./pages/WishlistPage";
import CheckoutPage from "./pages/CheckoutPage";
import AuthPage from "./pages/AuthPage";
import OrdersPage from "./pages/OrdersPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminInquiries from "./pages/admin/AdminInquiries";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminMarketing from "./pages/admin/AdminMarketing";
import AdminActivityLogs from "./pages/admin/AdminActivityLogs";
import AdminTrackingAnalytics from "./pages/admin/AdminTrackingAnalytics";
import AdminSeoSettings from "./pages/admin/AdminSeoSettings";
import AdminSecurityDashboard from "./pages/admin/AdminSecurityDashboard";
import UserDashboard from "./pages/UserDashboard";
import NotFound from "./pages/NotFound";

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
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/category/:slug" element={<CategoryPage />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/orders/:orderId" element={<OrderTrackingPage />} />
                    <Route path="/dashboard" element={<UserDashboard />} />
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
                    <Route path="*" element={<NotFound />} />
                  </Routes>
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
