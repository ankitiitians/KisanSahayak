import { Link } from 'wouter';
import { useLanguage } from '@/context/LanguageContext';
import { ProductWithImages } from '@/types';
import { Button } from '@/components/ui/button';
import { StarIcon, MapPinIcon } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type ProductCardProps = {
  product: ProductWithImages;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/cart', { productId: product.id, quantity: 1 });
    },
    onSuccess: () => {
      toast({
        title: language === 'en' ? 'Added to cart' : 'कार्ट में जोड़ा गया',
        description: language === 'en' 
          ? `${product.name} has been added to your cart` 
          : `${product.nameHi || product.name} आपके कार्ट में जोड़ा गया है`,
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCartMutation.mutate();
  };

  // Get primary image or placeholder
  const imageUrl = product.images?.length 
    ? product.images.find(img => img.isMain)?.imageUrl || product.images[0].imageUrl
    : 'https://placehold.co/400x300/e2e8f0/1e293b?text=No+Image';

  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
        {/* Product Image */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={language === 'en' ? product.name : (product.nameHi || product.name)} 
            className="w-full h-full object-cover"
          />
          {product.isOrganic && (
            <div className="absolute top-2 right-2 bg-[#FFD54F] text-neutral-800 text-xs font-medium px-2 py-1 rounded">
              {t('organic')}
            </div>
          )}
          {product.isSeasonal && !product.isOrganic && (
            <div className="absolute top-2 right-2 bg-[#FFD54F] text-neutral-800 text-xs font-medium px-2 py-1 rounded">
              {t('seasonal')}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="p-4 flex-grow flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-lg">
              {language === 'en' ? product.name : (product.nameHi || product.name)}
            </h3>
            <div className="text-[#FF6D00] font-medium">₹{product.price}/{product.unit}</div>
          </div>
          
          <div className="flex items-center text-xs text-neutral-600 mb-3">
            <MapPinIcon className="w-3 h-3 mr-1" />
            <span>{product.farmerLocation || 'India'}</span>
            <span className="mx-2">•</span>
            <div className="flex items-center">
              <StarIcon className="w-3 h-3 text-[#FFC107] mr-1" />
              <span>{product.avgRating || '0'} ({product.totalRatings || '0'})</span>
            </div>
          </div>
          
          <p className="text-sm text-neutral-600 mb-4 flex-grow">
            {language === 'en' 
              ? (product.description.length > 80 ? `${product.description.substring(0, 80)}...` : product.description)
              : (product.descriptionHi && product.descriptionHi.length > 80 
                  ? `${product.descriptionHi.substring(0, 80)}...` 
                  : (product.descriptionHi || product.description))}
          </p>
          
          <div className="flex justify-between items-center mt-auto">
            <div className="text-xs text-neutral-500">
              <span>{t('soldBy')}:</span>
              <span className="font-medium ml-1">{product.farmerName || 'Bharat Fasal'}</span>
            </div>
            
            <Button 
              size="sm"
              className="bg-primary text-white hover:bg-primary-dark transition-colors"
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending}
            >
              {addToCartMutation.isPending ? '...' : t('addToCart')}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
