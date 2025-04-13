import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/context/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  User, 
  Settings,
  LogOut,
  Users,
  BarChart3,
  AlertTriangle
} from 'lucide-react';

type DashboardLayoutProps = {
  children: ReactNode;
  title: string;
  userRole: 'farmer' | 'customer' | 'admin';
  activeItem?: string;
};

export default function DashboardLayout({ 
  children, 
  title, 
  userRole, 
  activeItem = 'dashboard' 
}: DashboardLayoutProps) {
  const { t, language } = useLanguage();
  const [location, setLocation] = useLocation();

  // Define sidebar items based on user role
  const sidebarItems = {
    farmer: [
      { id: 'dashboard', label: t('dashboard'), icon: <LayoutDashboard className="mr-2 h-4 w-4" />, href: '/farmer/dashboard' },
      { id: 'products', label: t('products'), icon: <Package className="mr-2 h-4 w-4" />, href: '/farmer/products' },
      { id: 'orders', label: t('orders'), icon: <ShoppingCart className="mr-2 h-4 w-4" />, href: '/farmer/orders' },
      { id: 'messages', label: t('messages'), icon: <MessageSquare className="mr-2 h-4 w-4" />, href: '/messages' },
      { id: 'profile', label: language === 'en' ? 'Profile' : 'प्रोफ़ाइल', icon: <User className="mr-2 h-4 w-4" />, href: '/farmer/profile' },
      { id: 'settings', label: language === 'en' ? 'Settings' : 'सेटिंग्स', icon: <Settings className="mr-2 h-4 w-4" />, href: '/settings' },
    ],
    customer: [
      { id: 'dashboard', label: t('dashboard'), icon: <LayoutDashboard className="mr-2 h-4 w-4" />, href: '/customer/dashboard' },
      { id: 'orders', label: t('orders'), icon: <ShoppingCart className="mr-2 h-4 w-4" />, href: '/customer/orders' },
      { id: 'messages', label: t('messages'), icon: <MessageSquare className="mr-2 h-4 w-4" />, href: '/messages' },
      { id: 'profile', label: language === 'en' ? 'Profile' : 'प्रोफ़ाइल', icon: <User className="mr-2 h-4 w-4" />, href: '/customer/profile' },
      { id: 'settings', label: language === 'en' ? 'Settings' : 'सेटिंग्स', icon: <Settings className="mr-2 h-4 w-4" />, href: '/settings' },
    ],
    admin: [
      { id: 'dashboard', label: t('dashboard'), icon: <LayoutDashboard className="mr-2 h-4 w-4" />, href: '/admin/dashboard' },
      { id: 'users', label: t('users'), icon: <Users className="mr-2 h-4 w-4" />, href: '/admin/users' },
      { id: 'verifications', label: t('pendingVerifications'), icon: <AlertTriangle className="mr-2 h-4 w-4" />, href: '/admin/verifications' },
      { id: 'analytics', label: t('analytics'), icon: <BarChart3 className="mr-2 h-4 w-4" />, href: '/admin/analytics' },
      { id: 'settings', label: language === 'en' ? 'Settings' : 'सेटिंग्स', icon: <Settings className="mr-2 h-4 w-4" />, href: '/admin/settings' },
    ]
  };

  const handleLogout = () => {
    // Send a request to logout endpoint
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).then(() => {
      setLocation('/login');
    });
  };

  return (
    <div className={`min-h-screen flex flex-col ${language === 'hi' ? 'font-hindi' : 'font-roboto'}`} lang={language}>
      <Header />
      <div className="flex-grow flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-neutral-200 p-4">
          <div className="font-medium text-lg mb-6">{title}</div>
          <nav className="space-y-1 flex-grow">
            {sidebarItems[userRole].map((item) => (
              <Link key={item.id} href={item.href}>
                <Button
                  variant={activeItem === item.id ? "default" : "ghost"}
                  className={`w-full justify-start ${activeItem === item.id ? 'bg-primary text-white' : ''}`}
                >
                  {item.icon}
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
          <Separator className="my-4" />
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t('logout')}
          </Button>
        </aside>

        {/* Mobile Sidebar Buttons */}
        <div className="md:hidden flex overflow-x-auto p-2 bg-white border-b border-neutral-200">
          {sidebarItems[userRole].map((item) => (
            <Link key={item.id} href={item.href}>
              <Button
                variant={activeItem === item.id ? "default" : "ghost"}
                size="sm"
                className={`mr-2 ${activeItem === item.id ? 'bg-primary text-white' : ''}`}
              >
                {item.icon}
                <span className="sr-only">{item.label}</span>
              </Button>
            </Link>
          ))}
          <Button 
            variant="ghost" 
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">{t('logout')}</span>
          </Button>
        </div>

        {/* Main Content */}
        <main className="flex-grow p-4 md:p-6 bg-neutral-50 overflow-auto">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
