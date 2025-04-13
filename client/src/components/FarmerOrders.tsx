import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/context/LanguageContext';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle2,
  XCircle,
  Truck,
  ShoppingBag,
  Eye,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { OrderWithItems } from '@/types';

type FarmerOrdersProps = {
  limit?: number;
};

export default function FarmerOrders({ limit }: FarmerOrdersProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);

  // Fetch farmer's orders
  const { data: orders, isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ['/api/farmer/orders'],
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, itemId, status }: { orderId: number; itemId: number; status: string }) => {
      return apiRequest('PATCH', `/api/farmer/orders/${orderId}/items/${itemId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/farmer/orders'] });
      toast({
        title: language === 'en' ? 'Order updated' : 'ऑर्डर अपडेट किया गया',
        description: language === 'en' 
          ? 'Order status has been updated successfully' 
          : 'ऑर्डर स्थिति सफलतापूर्वक अपडेट की गई है',
      });
      setOrderDetailsOpen(false);
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
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'hi-IN', options);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          {language === 'en' ? 'Pending' : 'लंबित'}
        </Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          {language === 'en' ? 'Confirmed' : 'पुष्टि की गई'}
        </Badge>;
      case 'shipped':
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
          {language === 'en' ? 'Shipped' : 'भेज दिया गया'}
        </Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
          {language === 'en' ? 'Delivered' : 'वितरित'}
        </Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
          {language === 'en' ? 'Cancelled' : 'रद्द'}
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Handle view order details
  const handleViewOrder = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  // Handle order status update
  const handleUpdateStatus = (orderId: number, itemId: number, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, itemId, status });
  };

  const filteredOrders = limit && orders ? orders.slice(0, limit) : orders;

  if (isLoading) {
    return (
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
                  <TableCell><Skeleton className="h-8 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div>
      {filteredOrders && filteredOrders.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('orderId')}</TableHead>
                <TableHead>{t('orderDate')}</TableHead>
                <TableHead>{t('orderAmount')}</TableHead>
                <TableHead>{t('orderStatus')}</TableHead>
                <TableHead className="text-right">{language === 'en' ? 'Actions' : 'कार्रवाइयां'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewOrder(order)}
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
          <ShoppingBag className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
          <p className="mb-4">
            {language === 'en' 
              ? 'No orders found. Your orders will appear here when customers place them.' 
              : 'कोई ऑर्डर नहीं मिला। जब ग्राहक ऑर्डर देंगे तो आपके ऑर्डर यहां दिखाई देंगे।'}
          </p>
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {language === 'en' ? `Order #${selectedOrder.id} Details` : `ऑर्डर #${selectedOrder.id} विवरण`}
                </DialogTitle>
                <DialogDescription>
                  {language === 'en' 
                    ? `Ordered on ${formatDate(selectedOrder.createdAt)}`
                    : `${formatDate(selectedOrder.createdAt)} को ऑर्डर किया गया`}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">{language === 'en' ? 'Delivery Address' : 'डिलीवरी पता'}</h4>
                    <p className="text-sm text-neutral-600">{selectedOrder.deliveryAddress}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">{language === 'en' ? 'Payment Method' : 'भुगतान विधि'}</h4>
                    <p className="text-sm text-neutral-600">{selectedOrder.paymentMethod.toUpperCase()}</p>
                    <p className="text-sm text-neutral-600">{selectedOrder.paymentStatus}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">{language === 'en' ? 'Order Items' : 'ऑर्डर आइटम'}</h4>
                  
                  <div className="space-y-4">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex flex-col md:flex-row gap-4 border rounded-lg p-3">
                        <div className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                          <img 
                            src={item.product.images && item.product.images.length > 0
                              ? item.product.images[0].imageUrl
                              : 'https://placehold.co/100x100/e2e8f0/1e293b?text=No+Image'
                            } 
                            alt={language === 'en' ? item.product.name : (item.product.nameHi || item.product.name)} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-grow">
                          <h5 className="font-medium">
                            {language === 'en' ? item.product.name : (item.product.nameHi || item.product.name)}
                          </h5>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-sm text-neutral-600">
                              {item.quantity} x ₹{item.price} = ₹{(item.quantity * item.price).toFixed(2)}
                            </p>
                            {getStatusBadge(item.status)}
                          </div>
                          
                          <div className="flex gap-2 mt-2">
                            {item.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                  onClick={() => handleUpdateStatus(selectedOrder.id, item.id, 'confirmed')}
                                  disabled={updateOrderStatusMutation.isPending}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  {language === 'en' ? 'Accept' : 'स्वीकार करें'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                  onClick={() => handleUpdateStatus(selectedOrder.id, item.id, 'cancelled')}
                                  disabled={updateOrderStatusMutation.isPending}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  {language === 'en' ? 'Reject' : 'अस्वीकार करें'}
                                </Button>
                              </>
                            )}
                            
                            {item.status === 'confirmed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                onClick={() => handleUpdateStatus(selectedOrder.id, item.id, 'shipped')}
                                disabled={updateOrderStatusMutation.isPending}
                              >
                                <Truck className="h-4 w-4 mr-1" />
                                {language === 'en' ? 'Ship' : 'भेजें'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button onClick={() => setOrderDetailsOpen(false)}>
                  {language === 'en' ? 'Close' : 'बंद करें'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
