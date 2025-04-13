import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/context/LanguageContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Eye,
  ShoppingBag
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { OrderWithItems } from '@/types';

export default function CustomerOrders() {
  const { t, language } = useLanguage();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);

  // Fetch customer's orders
  const { data: orders, isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ['/api/customer/orders'],
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
      {orders && orders.length > 0 ? (
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
              {orders.map((order) => (
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
              ? 'You haven\'t placed any orders yet.' 
              : 'आपने अभी तक कोई ऑर्डर नहीं दिया है।'}
          </p>
          <Button 
            className="bg-primary hover:bg-primary-dark"
            onClick={() => window.location.href = '/products'} // Using window.location to force a page refresh
          >
            {language === 'en' ? 'Browse Products' : 'उत्पाद ब्राउज़ करें'}
          </Button>
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
                    <p className="text-sm text-neutral-600">
                      {selectedOrder.paymentStatus === 'completed' 
                        ? (language === 'en' ? 'Paid' : 'भुगतान किया गया') 
                        : (language === 'en' ? 'Payment Pending' : 'भुगतान लंबित')}
                    </p>
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
                          
                          <div className="mt-2">
                            <p className="text-sm text-neutral-600">
                              {language === 'en' ? `Seller: ${item.product.farmerName || 'Unknown'}` : `विक्रेता: ${item.product.farmerName || 'अज्ञात'}`}
                            </p>
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
