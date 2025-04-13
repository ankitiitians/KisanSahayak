import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/context/LanguageContext';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type AdminDashboardStats = {
  totalUsers: number;
  totalFarmers: number;
  totalCustomers: number;
  pendingVerifications: number;
  totalOrders: number;
  totalProducts: number;
};

type VerificationUser = {
  id: number;
  name: string;
  phone: string;
  email?: string;
  role: string;
  state: string;
  createdAt: string;
  farmDetails?: {
    farmName?: string;
    farmLocation?: string;
    farmSize?: string;
    aadhaarNumber?: string;
  };
};

export default function AdminDashboard() {
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState<VerificationUser | null>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);

  // Check if user is logged in and is an admin
  const { data: user, isLoading: loadingUser } = useQuery<{ id: number; role: string; name: string } | null>({
    queryKey: ['/api/auth/me'],
  });
  
  // Redirect if not an admin
  if (user && user.role !== 'admin') {
    setLocation('/');
  }
  
  // Fetch admin dashboard stats
  const { data: dashboardStats, isLoading: loadingStats } = useQuery<AdminDashboardStats>({
    queryKey: ['/api/admin/dashboard/stats'],
    enabled: !!user && user.role === 'admin',
  });
  
  // Fetch pending verifications
  const { data: pendingVerifications, isLoading: loadingVerifications } = useQuery<VerificationUser[]>({
    queryKey: ['/api/admin/verifications/pending'],
    enabled: !!user && user.role === 'admin' && activeTab === 'verifications',
  });

  // Verify user mutation
  const verifyUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest('POST', `/api/admin/verifications/approve/${userId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/verifications/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard/stats'] });
      
      toast({
        title: language === 'en' ? 'User verified' : 'उपयोगकर्ता सत्यापित',
        description: language === 'en' 
          ? 'The user has been successfully verified' 
          : 'उपयोगकर्ता सफलतापूर्वक सत्यापित किया गया है',
      });
      
      setUserDetailsOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Reject user mutation
  const rejectUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest('POST', `/api/admin/verifications/reject/${userId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/verifications/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard/stats'] });
      
      toast({
        title: language === 'en' ? 'User rejected' : 'उपयोगकर्ता अस्वीकृत',
        description: language === 'en' 
          ? 'The user has been rejected' 
          : 'उपयोगकर्ता को अस्वीकार कर दिया गया है',
      });
      
      setUserDetailsOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'hi-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle view user details
  const handleViewUser = (user: VerificationUser) => {
    setSelectedUser(user);
    setUserDetailsOpen(true);
  };

  // Handle verify user
  const handleVerifyUser = (userId: number) => {
    verifyUserMutation.mutate(userId);
  };

  // Handle reject user
  const handleRejectUser = (userId: number) => {
    rejectUserMutation.mutate(userId);
  };

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
      title={t('adminDashboard')} 
      userRole="admin"
      activeItem={activeTab}
    >
      <Tabs 
        defaultValue="dashboard" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="dashboard">
            <BarChart3 className="mr-2 h-4 w-4" />
            {t('dashboard')}
          </TabsTrigger>
          <TabsTrigger value="verifications">
            <AlertTriangle className="mr-2 h-4 w-4" />
            {t('pendingVerifications')}
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            {t('users')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {loadingStats ? (
              Array(6).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-7 w-16 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
              ))
            ) : dashboardStats ? (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {language === 'en' ? 'Total Users' : 'कुल उपयोगकर्ता'}
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.totalUsers}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {language === 'en' ? 'Farmers' : 'किसान'}
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.totalFarmers}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {language === 'en' ? 'Customers' : 'ग्राहक'}
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.totalCustomers}</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t('pendingVerifications')}
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.pendingVerifications}</div>
                    <Button 
                      variant="link" 
                      className="px-0 text-yellow-600" 
                      onClick={() => setActiveTab('verifications')}
                    >
                      {language === 'en' ? 'View pending' : 'लंबित देखें'} →
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {language === 'en' ? 'Total Orders' : 'कुल ऑर्डर'}
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.totalOrders}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {language === 'en' ? 'Total Products' : 'कुल उत्पाद'}
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.totalProducts}</div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>
          
          {/* Additional Dashboard Content */}
          <Card>
            <CardHeader>
              <CardTitle>{language === 'en' ? 'Recent Activity' : 'हाल की गतिविधि'}</CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? 'Recent signups and platform activity' 
                  : 'हाल के साइनअप और प्लेटफॉर्म गतिविधि'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="text-center py-6 text-neutral-500">
                  {language === 'en' 
                    ? 'Activity log will be implemented in a future update' 
                    : 'गतिविधि लॉग भविष्य के अपडेट में लागू किया जाएगा'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="verifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('pendingVerifications')}</CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? 'Review and verify new farmer registrations' 
                  : 'नए किसान पंजीकरणों की समीक्षा और सत्यापन करें'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingVerifications ? (
                <div className="space-y-3">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                          <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                          <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                          <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                          <TableHead><Skeleton className="h-4 w-10" /></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[1, 2, 3].map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : pendingVerifications && pendingVerifications.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === 'en' ? 'Name' : 'नाम'}</TableHead>
                        <TableHead>{t('phoneNumber')}</TableHead>
                        <TableHead>{language === 'en' ? 'Role' : 'भूमिका'}</TableHead>
                        <TableHead>{t('state')}</TableHead>
                        <TableHead>{language === 'en' ? 'Registered On' : 'पंजीकरण तिथि'}</TableHead>
                        <TableHead className="text-right">{language === 'en' ? 'Actions' : 'कार्रवाइयां'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingVerifications.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={user.role === 'farmer' ? 'bg-green-100' : ''}>
                              {user.role === 'farmer' 
                                ? (language === 'en' ? 'Farmer' : 'किसान')
                                : (language === 'en' ? 'Customer' : 'ग्राहक')}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.state}</TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewUser(user)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {language === 'en' ? 'View' : 'देखें'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <p className="mb-4">
                    {language === 'en' 
                      ? 'No pending verifications. All users have been reviewed.' 
                      : 'कोई लंबित सत्यापन नहीं। सभी उपयोगकर्ताओं की समीक्षा की गई है।'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('users')}</CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? 'Manage all users on the platform' 
                  : 'प्लेटफॉर्म पर सभी उपयोगकर्ताओं का प्रबंधन करें'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="text-center py-6 text-neutral-500">
                  {language === 'en' 
                    ? 'User management interface will be implemented in a future update' 
                    : 'उपयोगकर्ता प्रबंधन इंटरफेस भविष्य के अपडेट में लागू किया जाएगा'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Details Dialog */}
      <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {language === 'en' ? 'User Verification Request' : 'उपयोगकर्ता सत्यापन अनुरोध'}
                </DialogTitle>
                <DialogDescription>
                  {language === 'en' 
                    ? `Review information provided by ${selectedUser.name}`
                    : `${selectedUser.name} द्वारा प्रदान की गई जानकारी की समीक्षा करें`}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">{language === 'en' ? 'Name' : 'नाम'}</h4>
                    <p className="text-sm">{selectedUser.name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">{t('phoneNumber')}</h4>
                    <p className="text-sm">{selectedUser.phone}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">{t('email')}</h4>
                    <p className="text-sm">{selectedUser.email || '-'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">{t('state')}</h4>
                    <p className="text-sm">{selectedUser.state}</p>
                  </div>
                </div>
                
                {selectedUser.role === 'farmer' && selectedUser.farmDetails && (
                  <>
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-2">{t('farmDetails')}</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium mb-1">{t('farmName')}</h5>
                          <p className="text-sm">{selectedUser.farmDetails.farmName || '-'}</p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium mb-1">{t('farmLocation')}</h5>
                          <p className="text-sm">{selectedUser.farmDetails.farmLocation || '-'}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <h5 className="text-sm font-medium mb-1">{t('farmSize')}</h5>
                          <p className="text-sm">{selectedUser.farmDetails.farmSize || '-'}</p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium mb-1">{t('aadhaarNumber')}</h5>
                          <p className="text-sm">
                            {selectedUser.farmDetails.aadhaarNumber 
                              ? `XXXX-XXXX-${selectedUser.farmDetails.aadhaarNumber.substring(8)}` 
                              : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline"
                  className="flex-1 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleRejectUser(selectedUser.id)}
                  disabled={rejectUserMutation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {rejectUserMutation.isPending 
                    ? (language === 'en' ? 'Rejecting...' : 'अस्वीकार कर रहा है...') 
                    : t('rejectUser')}
                </Button>
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleVerifyUser(selectedUser.id)}
                  disabled={verifyUserMutation.isPending}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {verifyUserMutation.isPending 
                    ? (language === 'en' ? 'Verifying...' : 'सत्यापित कर रहा है...') 
                    : t('verifyUser')}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
