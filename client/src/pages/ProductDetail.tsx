import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/context/LanguageContext';
import { useParams, useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProductWithImages, FarmerWithUser } from '@/types';
import {
  Star,
  MessageCircle,
  MapPin,
  Truck,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
} from 'lucide-react';

export default function ProductDetail() {
  const { t, language } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMessageDialog, setShowMessageDialog] = useState(false);

  // Fetch product details
  const {
    data: product,
    isLoading: loadingProduct,
    error: productError,
  } = useQuery<ProductWithImages>({
    queryKey: [`/api/products/${id}`],
  });

  // Fetch farmer details
  const {
    data: farmer,
    isLoading: loadingFarmer,
  } = useQuery<FarmerWithUser>({
    queryKey: [`/api/farmers/${product?.farmerId}`],
    enabled: !!product?.farmerId,
  });

  // Check if user is logged in
  const { data: user } = useQuery<{ id: number; role: string } | null>({
    queryKey: ['/api/auth/me'],
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/cart', { productId: parseInt(id), quantity });
    },
    onSuccess: () => {
      toast({
        title: language === 'en' ? 'Added to cart' : 'कार्ट में जोड़ा गया',
        description: language === 'en' 
          ? `${product?.name} has been added to your cart` 
          : `${product?.nameHi || product?.name} आपके कार्ट में जोड़ा गया है`,
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

  // Message form schema
  const messageSchema = z.object({
    message: z.string().min(1, language === 'en' ? 'Message cannot be empty' : 'संदेश खाली नहीं हो सकता'),
  });

  // Initialize message form
  const messageForm = useForm<{ message: string }>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: '',
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { message: string }) => {
      return apiRequest('POST', '/api/messages', { 
        receiverId: farmer?.userId, 
        content: data.message 
      });
    },
    onSuccess: () => {
      toast({
        title: language === 'en' ? 'Message sent' : 'संदेश भेजा गया',
        description: language === 'en' 
          ? `Your message has been sent to ${farmer?.user.name}` 
          : `आपका संदेश ${farmer?.user.name} को भेज दिया गया है`,
      });
      messageForm.reset();
      setShowMessageDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle message submission
  const onSendMessage = (data: { message: string }) => {
    sendMessageMutation.mutate(data);
  };

  // Handle quantity change
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: language === 'en' ? 'Authentication required' : 'प्रमाणीकरण आवश्यक',
        description: language === 'en' 
          ? 'Please login to add items to your cart' 
          : 'कृपया अपने कार्ट में आइटम जोड़ने के लिए लॉगिन करें',
        variant: 'destructive',
      });
      setLocation('/login');
      return;
    }

    addToCartMutation.mutate();
  };

  // Handle direct message
  const handleMessageFarmer = () => {
    if (!user) {
      toast({
        title: language === 'en' ? 'Authentication required' : 'प्रमाणीकरण आवश्यक',
        description: language === 'en' 
          ? 'Please login to message the farmer' 
          : 'कृपया किसान को संदेश भेजने के लिए लॉगिन करें',
        variant: 'destructive',
      });
      setLocation('/login');
      return;
    }

    setShowMessageDialog(true);
  };

  // Handle image navigation
  const goToPreviousImage = () => {
    if (product?.images && product.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  const goToNextImage = () => {
    if (product?.images && product.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  // Handle buy now
  const handleBuyNow = () => {
    if (!user) {
      toast({
        title: language === 'en' ? 'Authentication required' : 'प्रमाणीकरण आवश्यक',
        description: language === 'en' 
          ? 'Please login to purchase items' 
          : 'कृपया आइटम खरीदने के लिए लॉगिन करें',
        variant: 'destructive',
      });
      setLocation('/login');
      return;
    }

    // Add to cart first, then redirect to checkout
    addToCartMutation.mutate();
    setLocation('/checkout');
  };

  if (productError) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 text-red-500 p-6 rounded-md">
            <h2 className="text-xl font-medium mb-2">{t('error')}</h2>
            <p>{(productError as Error).message || t('somethingWentWrong')}</p>
            <Button 
              variant="outline"
              className="mt-4"
              onClick={() => setLocation('/products')}
            >
              {language === 'en' ? 'Back to Products' : 'उत्पादों पर वापस जाएं'}
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Button 
            variant="ghost" 
            className="p-0 hover:bg-transparent hover:text-primary"
            onClick={() => setLocation('/products')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {language === 'en' ? 'Back to Products' : 'उत्पादों पर वापस जाएं'}
          </Button>
        </div>

        {loadingProduct ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <Skeleton className="h-[400px] w-full rounded-md" />
              <div className="flex gap-2 mt-4 justify-center">
                <Skeleton className="h-16 w-16 rounded-md" />
                <Skeleton className="h-16 w-16 rounded-md" />
                <Skeleton className="h-16 w-16 rounded-md" />
              </div>
            </div>
            <div>
              <Skeleton className="h-10 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-6" />
              
              <Skeleton className="h-12 w-full mb-4" />
              <div className="flex gap-4">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-10 w-1/2" />
              </div>
            </div>
          </div>
        ) : product ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="relative h-[400px] overflow-hidden rounded-md">
                <img 
                  src={product.images && product.images.length > 0
                    ? product.images[currentImageIndex].imageUrl
                    : 'https://placehold.co/600x400/e2e8f0/1e293b?text=No+Image'
                  } 
                  alt={language === 'en' ? product.name : (product.nameHi || product.name)} 
                  className="w-full h-full object-cover"
                />
                
                {product.images && product.images.length > 1 && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                      onClick={goToPreviousImage}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                      onClick={goToNextImage}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </>
                )}
                
                {(product.isOrganic || product.isSeasonal) && (
                  <div className="absolute top-4 right-4">
                    {product.isOrganic && (
                      <span className="bg-[#FFD54F] text-neutral-800 text-xs font-medium px-2 py-1 rounded mb-2 inline-block mr-2">
                        {t('organic')}
                      </span>
                    )}
                    {product.isSeasonal && (
                      <span className="bg-[#FFD54F] text-neutral-800 text-xs font-medium px-2 py-1 rounded inline-block">
                        {t('seasonal')}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 mt-4 justify-center">
                  {product.images.map((image, index) => (
                    <div
                      key={image.id}
                      className={`h-16 w-16 rounded-md cursor-pointer border-2 ${
                        currentImageIndex === index ? 'border-primary' : 'border-transparent'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img 
                        src={image.imageUrl} 
                        alt={`Thumbnail ${index + 1}`} 
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Details */}
            <div>
              <h1 className="font-poppins font-semibold text-2xl md:text-3xl mb-2">
                {language === 'en' ? product.name : (product.nameHi || product.name)}
              </h1>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center text-[#FFC107]">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < Math.round(product.avgRating || 0) ? 'fill-current' : ''}`} 
                    />
                  ))}
                  <span className="text-neutral-600 text-sm ml-1">
                    {product.avgRating || '0'} ({product.totalRatings || '0'} {language === 'en' ? 'ratings' : 'रेटिंग'})
                  </span>
                </div>
                
                {!loadingFarmer && farmer && (
                  <div className="flex items-center ml-4">
                    <MapPin className="h-4 w-4 text-neutral-400 mr-1" />
                    <span className="text-neutral-600 text-sm">{farmer.farmLocation || farmer.user.state}</span>
                  </div>
                )}
              </div>
              
              <div className="text-2xl font-semibold text-[#FF6D00] mb-4">
                ₹{product.price}/{product.unit}
              </div>
              
              <p className="text-neutral-600 mb-6">
                {language === 'en' 
                  ? product.description 
                  : (product.descriptionHi || product.description)}
              </p>
              
              {/* Quantity Selector */}
              <div className="flex items-center mb-6">
                <span className="mr-4 font-medium">{t('quantity')}:</span>
                <div className="flex items-center border border-neutral-300 rounded-md">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-none border-r border-neutral-300"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-none border-l border-neutral-300"
                    onClick={incrementQuantity}
                    disabled={product.stock <= quantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="ml-4 text-sm text-neutral-500">
                  {language === 'en' 
                    ? `${product.stock} units available` 
                    : `${product.stock} इकाइयां उपलब्ध हैं`}
                </span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mb-6">
                <Button 
                  className="flex-1 bg-primary hover:bg-primary-dark min-w-[120px]"
                  onClick={handleAddToCart}
                  disabled={addToCartMutation.isPending}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {addToCartMutation.isPending ? '...' : t('addToCart')}
                </Button>
                <Button 
                  className="flex-1 bg-[#FF6D00] hover:bg-[#E65100] min-w-[120px]"
                  onClick={handleBuyNow}
                >
                  <Truck className="h-4 w-4 mr-2" />
                  {language === 'en' ? 'Buy Now' : 'अभी खरीदें'}
                </Button>
              </div>
              
              <Separator className="my-6" />
              
              {/* Farmer Information */}
              {loadingFarmer ? (
                <div className="flex items-center mb-4">
                  <Skeleton className="h-12 w-12 rounded-full mr-3" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ) : farmer ? (
                <div className="bg-neutral-50 p-4 rounded-md mb-6">
                  <div className="flex items-center mb-2">
                    <div className="h-12 w-12 rounded-full bg-primary-light/20 flex items-center justify-center mr-3">
                      <span className="text-primary font-medium">
                        {farmer.user.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium">{farmer.farmName || farmer.user.name}</h3>
                      <p className="text-sm text-neutral-600">{t('farmerLabel')}</p>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleMessageFarmer}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Message Farmer' : 'किसान को संदेश भेजें'}
                  </Button>
                </div>
              ) : null}
              
              {/* Product Details Tabs */}
              <Tabs defaultValue="details">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="details">
                    {language === 'en' ? 'Details' : 'विवरण'}
                  </TabsTrigger>
                  <TabsTrigger value="shipping">
                    {language === 'en' ? 'Shipping' : 'शिपिंग'}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="mt-4">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 py-1 border-b border-neutral-100">
                      <span className="text-neutral-600">{language === 'en' ? 'Product' : 'उत्पाद'}</span>
                      <span>{language === 'en' ? product.name : (product.nameHi || product.name)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 py-1 border-b border-neutral-100">
                      <span className="text-neutral-600">{t('category')}</span>
                      <span>-</span> {/* This would come from category name */}
                    </div>
                    <div className="grid grid-cols-2 gap-2 py-1 border-b border-neutral-100">
                      <span className="text-neutral-600">{t('unit')}</span>
                      <span>{product.unit}</span>
                    </div>
                    {product.isOrganic && (
                      <div className="grid grid-cols-2 gap-2 py-1 border-b border-neutral-100">
                        <span className="text-neutral-600">{t('organic')}</span>
                        <span>{language === 'en' ? 'Yes' : 'हां'}</span>
                      </div>
                    )}
                    {product.isSeasonal && (
                      <div className="grid grid-cols-2 gap-2 py-1 border-b border-neutral-100">
                        <span className="text-neutral-600">{t('seasonal')}</span>
                        <span>{language === 'en' ? 'Yes' : 'हां'}</span>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="shipping" className="mt-4">
                  <div className="space-y-4">
                    <p className="text-neutral-600">
                      {language === 'en' 
                        ? 'Products are typically delivered within 2-3 days of placing the order, depending on your location and the farmer\'s schedule.'
                        : 'उत्पाद आमतौर पर आपके स्थान और किसान के शेड्यूल के आधार पर ऑर्डर देने के 2-3 दिनों के भीतर वितरित किए जाते हैं।'}
                    </p>
                    <p className="text-neutral-600">
                      {language === 'en'
                        ? 'Delivery charges are calculated at checkout based on your location and order value.'
                        : 'डिलीवरी शुल्क आपके स्थान और ऑर्डर मूल्य के आधार पर चेकआउट पर गणना किया जाता है।'}
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : (
          <div className="bg-neutral-50 p-8 text-center rounded-lg">
            <h2 className="text-xl font-medium mb-2">{t('error')}</h2>
            <p className="text-neutral-600">{t('somethingWentWrong')}</p>
            <Button 
              className="mt-4"
              onClick={() => setLocation('/products')}
            >
              {language === 'en' ? 'Back to Products' : 'उत्पादों पर वापस जाएं'}
            </Button>
          </div>
        )}
      </div>

      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <CardHeader>
            <CardTitle>
              {language === 'en' ? 'Message to Farmer' : 'किसान को संदेश'}
            </CardTitle>
            <CardDescription>
              {language === 'en' 
                ? `Send a message to ${farmer?.user.name} about ${product?.name}` 
                : `${farmer?.user.name} को ${product?.nameHi || product?.name} के बारे में संदेश भेजें`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...messageForm}>
              <form onSubmit={messageForm.handleSubmit(onSendMessage)} className="space-y-4">
                <FormField
                  control={messageForm.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('typeMessage')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={4}
                          placeholder={language === 'en' 
                            ? "Hi, I'm interested in your product. Is it available for delivery to my location?" 
                            : "नमस्ते, मैं आपके उत्पाद में रुचि रखता हूं। क्या यह मेरे स्थान पर डिलीवरी के लिए उपलब्ध है?"
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowMessageDialog(false)}
                  >
                    {language === 'en' ? 'Cancel' : 'रद्द करें'}
                  </Button>
                  <Button 
                    type="submit"
                    disabled={sendMessageMutation.isPending}
                  >
                    {sendMessageMutation.isPending ? '...' : t('send')}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
