import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLanguage } from '@/context/LanguageContext';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/layouts/MainLayout';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { CartItemWithProduct } from '@/types';
import { 
  CreditCard, 
  Smartphone, 
  Truck, 
  Wallet, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function Checkout() {
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

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

  // Define form schema
  const checkoutSchema = z.object({
    deliveryAddress: z.string().min(10, language === 'en' ? 'Address is too short' : 'पता बहुत छोटा है'),
    paymentMethod: z.enum(['upi', 'card', 'wallet', 'cod']),
  });

  // Initialize form
  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryAddress: '',
      paymentMethod: 'upi',
    },
  });

  // Place order mutation
  const placeOrderMutation = useMutation({
    mutationFn: async (data: z.infer<typeof checkoutSchema>) => {
      const orderData = {
        ...data,
        totalAmount: total,
      };
      return apiRequest('POST', '/api/orders', orderData);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setOrderId(data.orderId);
      setOrderSuccess(true);
      
      toast({
        title: language === 'en' ? 'Order placed successfully' : 'ऑर्डर सफलतापूर्वक दिया गया',
        description: language === 'en' 
          ? `Your order #${data.orderId} has been placed successfully` 
          : `आपका ऑर्डर #${data.orderId} सफलतापूर्वक दिया गया है`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: z.infer<typeof checkoutSchema>) => {
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
    
    placeOrderMutation.mutate(data);
  };

  if (!user) {
    setLocation('/login');
    return null;
  }

  if (orderSuccess) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold mb-4">
              {language === 'en' ? 'Order Placed Successfully!' : 'ऑर्डर सफलतापूर्वक दिया गया!'}
            </h1>
            
            <p className="text-neutral-600 mb-6">
              {language === 'en' 
                ? `Your order #${orderId} has been placed successfully. We've sent a confirmation to your email and phone.` 
                : `आपका ऑर्डर #${orderId} सफलतापूर्वक दिया गया है। हमने आपके ईमेल और फोन पर एक पुष्टिकरण भेजा है।`}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline"
                onClick={() => setLocation(`/customer/dashboard`)}
              >
                {language === 'en' ? 'View Order Status' : 'ऑर्डर स्थिति देखें'}
              </Button>
              <Button 
                className="bg-primary hover:bg-primary-dark"
                onClick={() => setLocation('/products')}
              >
                {language === 'en' ? 'Continue Shopping' : 'खरीदारी जारी रखें'}
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-poppins font-semibold text-2xl md:text-3xl flex items-center">
            {t('checkout')}
          </h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Truck className="mr-2 h-5 w-5" />
                      {language === 'en' ? 'Delivery Information' : 'डिलीवरी जानकारी'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="deliveryAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('deliveryAddress')}</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder={language === 'en' 
                                ? "Enter your full address including house/flat number, street, locality, city, state and PIN code" 
                                : "अपना पूरा पता दर्ज करें जिसमें घर/फ्लैट नंबर, गली, मोहल्ला, शहर, राज्य और पिन कोड शामिल हो"
                              }
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="mr-2 h-5 w-5" />
                      {t('paymentDetails')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>{t('selectPaymentMethod')}</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-neutral-50 transition-colors">
                                <RadioGroupItem value="upi" id="upi" />
                                <label htmlFor="upi" className="flex items-center flex-grow cursor-pointer">
                                  <Smartphone className="h-5 w-5 mr-2 text-[#FF6D00]" />
                                  <div>
                                    <div className="font-medium">{t('upi')}</div>
                                    <div className="text-sm text-neutral-500">
                                      {language === 'en' 
                                        ? 'Pay using Google Pay, PhonePe, BHIM UPI, etc.' 
                                        : 'Google Pay, PhonePe, BHIM UPI, आदि का उपयोग करके भुगतान करें।'}
                                    </div>
                                  </div>
                                </label>
                              </div>
                              
                              <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-neutral-50 transition-colors">
                                <RadioGroupItem value="card" id="card" />
                                <label htmlFor="card" className="flex items-center flex-grow cursor-pointer">
                                  <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                                  <div>
                                    <div className="font-medium">{t('cards')}</div>
                                    <div className="text-sm text-neutral-500">
                                      {language === 'en' 
                                        ? 'Pay using Credit or Debit card' 
                                        : 'क्रेडिट या डेबिट कार्ड का उपयोग करके भुगतान करें'}
                                    </div>
                                  </div>
                                </label>
                              </div>
                              
                              <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-neutral-50 transition-colors">
                                <RadioGroupItem value="wallet" id="wallet" />
                                <label htmlFor="wallet" className="flex items-center flex-grow cursor-pointer">
                                  <Wallet className="h-5 w-5 mr-2 text-purple-600" />
                                  <div>
                                    <div className="font-medium">{t('wallets')}</div>
                                    <div className="text-sm text-neutral-500">
                                      {language === 'en' 
                                        ? 'Pay using Paytm, Amazon Pay, etc.' 
                                        : 'Paytm, Amazon Pay, आदि का उपयोग करके भुगतान करें'}
                                    </div>
                                  </div>
                                </label>
                              </div>
                              
                              <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-neutral-50 transition-colors">
                                <RadioGroupItem value="cod" id="cod" />
                                <label htmlFor="cod" className="flex items-center flex-grow cursor-pointer">
                                  <Truck className="h-5 w-5 mr-2 text-green-600" />
                                  <div>
                                    <div className="font-medium">{t('cod')}</div>
                                    <div className="text-sm text-neutral-500">
                                      {language === 'en' 
                                        ? 'Pay when your order is delivered' 
                                        : 'अपना ऑर्डर मिलने पर भुगतान करें'}
                                    </div>
                                  </div>
                                </label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                <div className="lg:hidden">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {language === 'en' ? 'Order Summary' : 'ऑर्डर सारांश'}
                      </CardTitle>
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
                    </CardContent>
                    <CardFooter>
                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary-dark"
                        disabled={placeOrderMutation.isPending}
                      >
                        {placeOrderMutation.isPending 
                          ? (language === 'en' ? 'Processing...' : 'प्रोसेसिंग...') 
                          : t('placeOrder')}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                
                <div className="hidden lg:block">
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary-dark"
                    disabled={placeOrderMutation.isPending}
                  >
                    {placeOrderMutation.isPending 
                      ? (language === 'en' ? 'Processing...' : 'प्रोसेसिंग...') 
                      : t('placeOrder')}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
          
          {/* Order Summary */}
          <div className="hidden lg:block">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'en' ? 'Order Summary' : 'ऑर्डर सारांश'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCart ? (
                  <div className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : cartItems && cartItems.length > 0 ? (
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
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
                          <p className="font-medium">
                            {language === 'en' ? item.product.name : (item.product.nameHi || item.product.name)}
                          </p>
                          <div className="flex justify-between text-sm">
                            <span>{item.quantity} x ₹{item.product.price}</span>
                            <span>₹{(item.quantity * item.product.price).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-neutral-500">
                      {language === 'en' ? 'Your cart is empty' : 'आपका कार्ट खाली है'}
                    </p>
                  </div>
                )}
                
                <div className="space-y-4">
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
                </div>
              </CardContent>
              <CardFooter className="bg-neutral-50 rounded-b-lg border-t">
                <div className="w-full text-center flex items-center justify-center text-sm text-neutral-600">
                  <ShieldCheck className="h-4 w-4 mr-2 text-green-600" />
                  {language === 'en' 
                    ? 'Secure checkout powered by trusted payment gateways' 
                    : 'विश्वसनीय भुगतान गेटवे द्वारा संचालित सुरक्षित चेकआउट'}
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
