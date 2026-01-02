import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  LogOut,
  ChevronLeft,
  Menu,
  Users,
  Megaphone,
  Activity,
  Search,
  Shield,
  Mail,
  Bell,
  Settings,
  Home
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { useAdminNotificationBadges } from '@/hooks/useAdminNotificationBadges';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import AdminOrderNotifications from './AdminOrderNotifications';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badgeKey?: 'orders' | 'inquiries' | 'products' | 'security' | 'customers';
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package, badgeKey: 'products' },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart, badgeKey: 'orders' },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Analytics', href: '/admin/analytics', icon: LayoutDashboard },
  { name: 'Tracking', href: '/admin/tracking', icon: Activity },
  { name: 'SEO', href: '/admin/seo', icon: Search },
  { name: 'Security', href: '/admin/security', icon: Shield, badgeKey: 'security' },
  { name: 'Marketing', href: '/admin/marketing', icon: Megaphone },
  { name: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare, badgeKey: 'inquiries' },
  { name: 'Email Templates', href: '/admin/email-templates', icon: Mail },
  { name: 'Admins', href: '/admin/users', icon: Users },
  { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
  { name: 'Activity Logs', href: '/admin/activity-logs', icon: Activity },
];

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const { user, signOut } = useAuth();
  const { isAdmin, loading } = useAdmin();
  const { badges } = useAdminNotificationBadges();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Calculate total notifications
  const totalNotifications = badges.orders + badges.inquiries + badges.security + badges.products;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground animate-pulse">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    toast.error('Access denied', {
      description: 'You do not have admin privileges.',
    });
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="bg-gradient-to-b from-card via-card to-card/95 border-r border-border/50 flex flex-col fixed h-full z-40"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/50">
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Link to="/" className="font-display text-xl flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-gold flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">G</span>
                  </div>
                  Gen-zee<span className="text-primary">.</span>admin
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-secondary/80"
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto no-scrollbar">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;
              
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.1)]'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                  >
                    <div className={`relative ${isActive ? 'text-primary' : 'group-hover:text-primary transition-colors'}`}>
                      <item.icon size={20} />
                      {badgeCount > 0 && !sidebarOpen && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
                      )}
                    </div>
                    <AnimatePresence mode="wait">
                      {sidebarOpen && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex-1 flex items-center justify-between"
                        >
                          <span className="text-sm font-medium">{item.name}</span>
                          {badgeCount > 0 && (
                            <Badge 
                              variant="destructive" 
                              className="h-5 min-w-[20px] text-xs px-1.5 animate-pulse"
                            >
                              {badgeCount}
                            </Badge>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border/50 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
          >
            <Home size={20} />
            <AnimatePresence mode="wait">
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-medium"
                >
                  Back to Store
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
          >
            <LogOut size={20} />
            <AnimatePresence mode="wait">
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-medium"
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? 280 : 80 }}
      >
        {/* Header */}
        <header className="h-16 bg-card/80 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              key={title}
              className="font-display text-xl font-semibold"
            >
              {title}
            </motion.h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <Button variant="ghost" size="icon" className="relative hover:bg-secondary/80">
                <Bell size={20} />
                {totalNotifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center animate-pulse">
                    {totalNotifications > 99 ? '99+' : totalNotifications}
                  </span>
                )}
              </Button>
            </div>
            
            {/* User Info */}
            <div className="flex items-center gap-3 pl-4 border-l border-border/50">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-gold flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-sm">
                  {user?.email?.[0].toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{user?.email?.split('@')[0]}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>

        {/* Order Notifications */}
        <AdminOrderNotifications />
      </div>
    </div>
  );
};

export default AdminLayout;
