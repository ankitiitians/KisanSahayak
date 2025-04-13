import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/context/LanguageContext';
import { useLocation } from 'wouter';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import FarmerProducts from '@/components/FarmerProducts';
import FarmerOrders from '@/components/FarmerOrders';
import PricePrediction from '@/components/PricePrediction';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Plus, 
  DollarSign,
  Users,
  Truck,
  Star
} from 'lucide-react';

export default function FarmerDashboard() {
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Check if user is logged in and is a farmer
  const { data: user, isLoading: loadingUser } = useQuery<{ id: number; role: string; name: string } | null>({
    queryKey: ['/api/auth/me'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Redirect if not a farmer
  if (user && user.role !== 'farmer') {
    setLocation('/');
  }
  
  // Fetch farmer's dashboard data
  const { data: dashboardData, isLoading: loadingDashboard } = useQuery({
    queryKey: ['/api/farmer/dashboard'],
    enabled: !!user && user.role === 'farmer',
  });
  
  // Example sales data for chart
  const salesData = [
    { name: 'Jan', sales: 12000 },
    { name: 'Feb', sales: 19000 },
    { name: 'Mar', sales: 15000 },
    { name: 'Apr', sales: 22000 },
    { name: 'May', sales: 28000 },
    { name: 'Jun', sales: 32000 },
  ];
  
  // Stats cards data
  const stats = [
    {
      title: language === 'en' ? 'Total Revenue' : 'कुल राजस्व',
      value: '₹45,231',
      description: language === 'en' ? '+20.1% from last month' : 'पिछले महीने से +20.1%',
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: language === 'en' ? 'Active Orders' : 'सक्रिय ऑर्डर',
      value: '12',
      description: language === 'en' ? '4 pending delivery' : '4 डिलीवरी के लिए लंबित',
      icon: <Truck className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: language === 'en' ? 'Customers' : 'ग्राहक',
      value: '48',
      description: language === 'en' ? '12 new this month' : 'इस महीने 12 नए',
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: language === 'en' ? 'Average Rating' : 'औसत रेटिंग',
      value: '4.8/5',
      description: language === 'en' ? 'From 36 ratings' : '36 रेटिंग से',
      icon: <Star className="h-4 w-4 text-muted-foreground" />,
    },
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
      userRole="farmer"
      activeItem="dashboard"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {language === 'en' ? `Welcome back, ${user.name}` : `वापसी पर स्वागत है, ${user.name}`}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Here\'s an overview of your farm business' 
              : 'यहां आपके कृषि व्यवसाय का अवलोकन है'}
          </p>
        </div>
        
        <Button 
          className="bg-primary hover:bg-primary-dark"
          onClick={() => setLocation('/farmer/add-product')}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('addProduct')}
        </Button>
      </div>
      
      <Tabs 
        defaultValue="overview" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">
            <TrendingUp className="mr-2 h-4 w-4" />
            {t('overview')}
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package className="mr-2 h-4 w-4" />
            {t('products')}
          </TabsTrigger>
          <TabsTrigger value="orders">
            <ShoppingCart className="mr-2 h-4 w-4" />
            {t('orders')}
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <DollarSign className="mr-2 h-4 w-4" />
            {language === 'en' ? 'Price Prediction' : 'मूल्य अनुमान'}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {loadingDashboard
              ? Array(4).fill(0).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-4 rounded-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-7 w-16 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </CardContent>
                  </Card>
                ))
              : stats.map((stat, i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {stat.title}
                      </CardTitle>
                      {stat.icon}
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
          </div>
          
          {/* Sales Chart */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>{t('revenue')}</CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? 'Your sales revenue over the last 6 months' 
                  : 'पिछले 6 महीनों में आपका बिक्री राजस्व'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px]">
                {loadingDashboard ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis 
                        tickFormatter={(value) => 
                          `₹${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                        } 
                      />
                      <Tooltip 
                        formatter={(value) => 
                          [`₹${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, language === 'en' ? 'Revenue' : 'राजस्व']
                        } 
                      />
                      <Bar dataKey="sales" fill="#4CAF50" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>{t('newOrders')}</CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? 'You have 6 new orders today' 
                  : 'आज आपके 6 नए ऑर्डर हैं'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FarmerOrders limit={5} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{t('products')}</CardTitle>
                  <CardDescription>
                    {language === 'en' 
                      ? 'Manage your product listings' 
                      : 'अपने उत्पाद सूचियों का प्रबंधन करें'}
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setLocation('/farmer/add-product')}
                  className="bg-primary hover:bg-primary-dark"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('addProduct')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <FarmerProducts />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>{t('orders')}</CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? 'View and manage your orders' 
                  : 'अपने ऑर्डर देखें और प्रबंधित करें'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FarmerOrders />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'en' ? 'AI Price Prediction' : 'एआई मूल्य अनुमान'}</CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? 'Get competitive price suggestions for your produce based on market trends' 
                  : 'बाजार रुझानों के आधार पर अपनी उपज के लिए प्रतिस्पर्धी मूल्य सुझाव प्राप्त करें'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PricePrediction language={language} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
