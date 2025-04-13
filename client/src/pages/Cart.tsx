import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/context/LanguageContext';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { CartItemWithProduct } from '@/types';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Check if user is logged in
  const { data: user } = useQuery<{ id: number; role: string } | null>({
    queryKey: ['/api/auth/me'],
  });
  
  // Fetch cart items
  const { 
    data: cartItems, 
    isLoading: loadingCart,
    error: cartError
  } = useQuery<CartItemWithProduct[]>({
    queryKey: ['/api/cart'],
    enabled: !!user,
  });
  
  // Update cart item quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      return apiRequest('PATCH', `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error: Error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Remove cart item mutation
  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/cart/${id}`);
    },
    onSuccess: () => {
      toast({
        title: language === 'en' ? 'Item removed' : 'आइटम हटा दिया गया',
        description: language === 'en' 
          ? 'The item has been removed from your cart' 
          : 'आइटम आपके कार्ट से हटा दिया गया है',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error: Error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Calculate cart totals
  const calculateTotals = () => {
    if (!cartItems || cartItems.length === 0) return { subtotal: 0, deliveryFee: 0, total: 0 };
    
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
    
    // Simple delivery fee calculation (can be made more complex based on requirements)
    const deliveryFee = subtotal > 1000 ? 0 : 50;
    
    return {
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee
    };
  };
  
  const { subtotal, deliveryFee, total } = calculateTotals();
  
  // Handle quantity change
  const handleQuantityChange = (id: number, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;
    
    updateQuantityMutation.mutate({ id, quantity: newQuantity });
  };
  
  // Handle remove item
  const handleRemoveItem = (id: number) => {
    removeItemMutation.mutate(id);
  };
  
  // Handle proceed to checkout
  const handleCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      toast({
        title: language === 'en' ? 'Empty cart' : 'खाली कार्ट',
        description: language === 'en' 
          ? 'Your cart is empty. Add some items before checkout.' 
          : 'आपका कार्ट खाली है। चेकआउट से पहले कुछ आइटम जोड़ें।',
        variant: 'destructive',
      });
      return;
    }
    
    setLocation('/checkout');
  };
  
  if (!user) {
    setLocation('/login');
    return null;
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-poppins font-semibold text-2xl md:text-3xl flex items-center">
            <ShoppingCart className="mr-2 h-6 w-6" />
            {t('yourCart')}
          </h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'en' ? 'Shopping Cart' : 'शॉपिंग कार्ट'}</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCart ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((_, i) => (
                      <div key={i} className="flex flex-col md:flex-row gap-4 pb-4 border-b">
                        <Skeleton className="h-24 w-24 rounded-md" />
                        <div className="flex-1">
                          <Skeleton className="h-6 w-48 mb-2" />
                          <Skeleton className="h-4 w-24 mb-2" />
                          <Skeleton className="h-6 w-20" />
                        </div>
                        <div className="flex flex-col justify-between">
                          <Skeleton className="h-10 w-32" />
                          <Skeleton className="h-9 w-9" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : cartError ? (
                  <div className="text-center py-8">
                    <p className="text-red-500">
                      {(cartError as Error).message || t('somethingWentWrong')}
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/cart'] })}
                    >
                      {language === 'en' ? 'Try Again' : 'पुनः प्रयास करें'}
                    </Button>
                  </div>
                ) : cartItems && cartItems.length > 0 ? (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex flex-col md:flex-row gap-4 pb-4 border-b">
                        {/* Product Image */}
                        <div 
                          className="h-24 w-24 rounded-md overflow-hidden cursor-pointer"
                          onClick={() => setLocation(`/products/${item.product.id}`)}
                        >
                          <img 
                            src={item.product.images && item.product.images.length > 0
                              ? item.product.images[0].imageUrl
                              : 'https://placehold.co/300x300/e2e8f0/1e293b?text=No+Image'
                            } 
                            alt={language === 'en' ? item.product.name : (item.product.nameHi || item.product.name)} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1">
                          <h3 
                            className="font-medium text-lg cursor-pointer hover:text-primary"
                            onClick={() => setLocation(`/products/${item.product.id}`)}
                          >
                            {language === 'en' ? item.product.name : (item.product.nameHi || item.product.name)}
                          </h3>
                          
                          <p className="text-sm text-neutral-600 mb-2">
                            {language === 'en' 
                              ? `Seller: ${item.product.farmerName || 'Unknown'}`
                              : `विक्रेता: ${item.product.farmerName || 'अज्ञात'}`}
                          </p>
                          
                          <div className="text-[#FF6D00] font-medium">
                            ₹{item.product.price}/{item.product.unit}
                          </div>
                        </div>
                        
                        {/* Quantity and Remove */}
                        <div className="flex flex-col justify-between">
                          <div className="flex items-center border border-neutral-300 rounded-md">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 rounded-none border-r border-neutral-300"
                              onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                              disabled={updateQuantityMutation.isPending}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-10 text-center">{item.quantity}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 rounded-none border-l border-neutral-300"
                              onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                              disabled={updateQuantityMutation.isPending}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={removeItemMutation.isPending}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
                    <h3 className="text-lg font-medium mb-2">{t('emptyCart')}</h3>
                    <p className="text-neutral-500 mb-4">
                      {language === 'en' 
                        ? 'Your shopping cart is empty. Add some fresh products to get started!' 
                        : 'आपका शॉपिंग कार्ट खाली है। शुरू करने के लिए कुछ ताजा उत्पाद जोड़ें!'}
                    </p>
                    <Button 
                      className="bg-primary hover:bg-primary-dark"
                      onClick={() => setLocation('/products')}
                    >
                      {t('startShopping')}
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setLocation('/products')}
                >
                  {language === 'en' ? 'Continue Shopping' : 'खरीदारी जारी रखें'}
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{language === 'en' ? 'Order Summary' : 'ऑर्डर सारांश'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-neutral-600">{t('subtotal')}</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">{t('deliveryFee')}</span>
                  <span>{deliveryFee > 0 ? `₹${deliveryFee.toFixed(2)}` : language === 'en' ? 'Free' : 'मुफ़्त'}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>{t('total')}</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                
                <div className="text-xs text-neutral-500 text-right">
                  {language === 'en' 
                    ? 'Taxes included where applicable' 
                    : 'कर जहां लागू हो शामिल हैं'}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-primary hover:bg-primary-dark"
                  onClick={handleCheckout}
                  disabled={!cartItems || cartItems.length === 0}
                >
                  {t('proceedToCheckout')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
