import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/context/LanguageContext';
import { useLocation } from 'wouter';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import CustomerOrders from '@/components/CustomerOrders';
import { 
  ShoppingCart, 
  User, 
  MessageSquare, 
  Heart,
  Truck,
  Package,
  Clock,
  Check
} from 'lucide-react';
import { OrderWithItems } from '@/types';

export default function CustomerDashboard() {
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('orders');
  
  // Check if user is logged in and is a customer
  const { data: user, isLoading: loadingUser } = useQuery<{ id: number; role: string; name: string } | null>({
    queryKey: ['/api/auth/me'],
  });
  
  // Redirect if not a customer
  if (user && user.role !== 'customer') {
    setLocation('/');
  }
  
  // Fetch customer's orders
  const { data: orders, isLoading: loadingOrders } = useQuery<OrderWithItems[]>({
    queryKey: ['/api/customer/orders'],
    enabled: !!user && user.role === 'customer',
  });
  
  // Stats cards data
  const getOrderStats = () => {
    if (!orders) return {
      total: 0,
      pending: 0,
      delivered: 0,
      cancelled: 0
    };
    
    return {
      total: orders.length,
      pending: orders.filter(order => order.status === 'pending' || order.status === 'confirmed' || order.status === 'shipped').length,
      delivered: orders.filter(order => order.status === 'delivered').length,
      cancelled: orders.filter(order => order.status === 'cancelled').length
    };
  };
  
  const orderStats = getOrderStats();
  
  const stats = [
    {
      title: language === 'en' ? 'Total Orders' : 'कुल ऑर्डर',
      value: orderStats.total,
      icon: <Package className="h-4 w-4 text-muted-foreground" />,
      color: 'bg-blue-100',
    },
    {
      title: language === 'en' ? 'Pending Orders' : 'लंबित ऑर्डर',
      value: orderStats.pending,
      icon: <Clock className="h-4 w-4 text-muted-foreground" />,
      color: 'bg-amber-100',
    },
    {
      title: language === 'en' ? 'Delivered Orders' : 'वितरित ऑर्डर',
      value: orderStats.delivered,
      icon: <Check className="h-4 w-4 text-muted-foreground" />,
      color: 'bg-green-100',
    },
    {
      title: language === 'en' ? 'Cancelled Orders' : 'रद्द ऑर्डर',
      value: orderStats.cancelled,
      icon: <Truck className="h-4 w-4 text-muted-foreground" />,
      color: 'bg-red-100',
    }
  ];
  
  if (loadingUser) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
          <Skeleton className="h-6 w-32 mx-auto mb-2" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    );
  }
  
  if (!user) {
    setLocation('/login');
    return null;
  }
  
  return (
    <DashboardLayout 
      title={t('dashboard')} 
      userRole="customer"
      activeItem="dashboard"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {language === 'en' ? `Welcome back, ${user.name}` : `वापसी पर स्वागत है, ${user.name}`}
        </h1>
        <p className="text-muted-foreground">
          {language === 'en' 
            ? 'Manage your orders and profile' 
            : 'अपने ऑर्डर और प्रोफ़ाइल का प्रबंधन करें'}
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {loadingOrders
          ? Array(4).fill(0).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-7 w-16 mb-1" />
                </CardContent>
              </Card>
            ))
          : stats.map((stat, i) => (
              <Card key={i}>
                <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2`}>
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.color} p-2 rounded-full`}>
                    {stat.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
      </div>
      
      <Tabs 
        defaultValue="orders" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="orders">
            <ShoppingCart className="mr-2 h-4 w-4" />
            {t('orders')}
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            {language === 'en' ? 'Profile' : 'प्रोफ़ाइल'}
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageSquare className="mr-2 h-4 w-4" />
            {t('messages')}
          </TabsTrigger>
          <TabsTrigger value="wishlist">
            <Heart className="mr-2 h-4 w-4" />
            {language === 'en' ? 'Wishlist' : 'इच्छा-सूची'}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>{t('orders')}</CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? 'View and track your orders' 
                  : 'अपने ऑर्डर देखें और ट्रैक करें'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerOrders />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'en' ? 'Profile' : 'प्रोफ़ाइल'}</CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? 'Manage your personal information' 
                  : 'अपनी व्यक्तिगत जानकारी प्रबंधित करें'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingUser ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="mb-1 text-sm font-medium">{language === 'en' ? 'Full Name' : 'पूरा नाम'}</h3>
                      <p className="text-sm">{user.name}</p>
                    </div>
                    <div>
                      <h3 className="mb-1 text-sm font-medium">{t('phoneNumber')}</h3>
                      <p className="text-sm">+91 987654XXXX</p> {/* This would come from user data */}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="mb-1 text-sm font-medium">{t('email')}</h3>
                      <p className="text-sm">user@example.com</p> {/* This would come from user data */}
                    </div>
                    <div>
                      <h3 className="mb-1 text-sm font-medium">{t('address')}</h3>
                      <p className="text-sm">123 Main St, City, State, PIN</p> {/* This would come from user data */}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button variant="outline">
                      {language === 'en' ? 'Edit Profile' : 'प्रोफ़ाइल संपादित करें'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>{t('messages')}</CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? 'Your conversations with farmers' 
                  : 'किसानों के साथ आपकी बातचीत'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {language === 'en' ? 'No messages yet' : 'अभी तक कोई संदेश नहीं'}
                </h3>
                <p className="text-neutral-500 mb-4">
                  {language === 'en' 
                    ? 'Start a conversation with a farmer by visiting a product page' 
                    : 'उत्पाद पृष्ठ पर जाकर किसान के साथ बातचीत शुरू करें'}
                </p>
                <Button 
                  className="bg-primary hover:bg-primary-dark"
                  onClick={() => setLocation('/products')}
                >
                  {language === 'en' ? 'Browse Products' : 'उत्पाद ब्राउज़ करें'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="wishlist">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'en' ? 'Wishlist' : 'इच्छा-सूची'}</CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? 'Products you have saved for later' 
                  : 'आपके द्वारा बाद के लिए सहेजे गए उत्पाद'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Heart className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {language === 'en' ? 'Your wishlist is empty' : 'आपकी इच्छा-सूची खाली है'}
                </h3>
                <p className="text-neutral-500 mb-4">
                  {language === 'en' 
                    ? 'Save items you like for future reference' 
                    : 'भविष्य के संदर्भ के लिए आपके पसंदीदा आइटम सहेजें'}
                </p>
                <Button 
                  className="bg-primary hover:bg-primary-dark"
                  onClick={() => setLocation('/products')}
                >
                  {language === 'en' ? 'Browse Products' : 'उत्पाद ब्राउज़ करें'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
