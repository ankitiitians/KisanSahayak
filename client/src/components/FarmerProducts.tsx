import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/context/LanguageContext';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ProductWithImages } from '@/types';

export default function FarmerProducts() {
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  // Fetch farmer's products
  const { data: products, isLoading } = useQuery<ProductWithImages[]>({
    queryKey: ['/api/farmer/products'],
  });

  // Toggle product visibility mutation
  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, isVisible }: { id: number; isVisible: boolean }) => {
      return apiRequest('PATCH', `/api/products/${id}/visibility`, { isVisible });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/farmer/products'] });
      toast({
        title: language === 'en' ? 'Product updated' : 'उत्पाद अपडेट किया गया',
        description: language === 'en' 
          ? 'Product visibility has been updated' 
          : 'उत्पाद की दृश्यता अपडेट की गई है',
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

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/farmer/products'] });
      toast({
        title: language === 'en' ? 'Product deleted' : 'उत्पाद हटा दिया गया',
        description: language === 'en' 
          ? 'The product has been successfully deleted' 
          : 'उत्पाद सफलतापूर्वक हटा दिया गया है',
      });
      setProductToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
      setProductToDelete(null);
    },
  });

  // Handle product visibility toggle
  const handleVisibilityToggle = (id: number, currentValue: boolean) => {
    toggleVisibilityMutation.mutate({ id, isVisible: !currentValue });
  };

  // Handle product actions
  const handleViewProduct = (id: number) => {
    setLocation(`/products/${id}`);
  };

  const handleEditProduct = (id: number) => {
    setLocation(`/farmer/edit-product/${id}`);
  };

  const handleDeleteProduct = (id: number) => {
    setProductToDelete(id);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
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
                  <TableCell><Skeleton className="h-12 w-12 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
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
      {products && products.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">{language === 'en' ? 'Image' : 'छवि'}</TableHead>
                <TableHead>{language === 'en' ? 'Product' : 'उत्पाद'}</TableHead>
                <TableHead>{t('price')}</TableHead>
                <TableHead>{t('stock')}</TableHead>
                <TableHead>{language === 'en' ? 'Status' : 'स्थिति'}</TableHead>
                <TableHead className="text-right">{language === 'en' ? 'Actions' : 'कार्रवाइयां'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="h-12 w-12 rounded-md overflow-hidden">
                      <img 
                        src={product.images && product.images.length > 0
                          ? product.images[0].imageUrl
                          : 'https://placehold.co/100x100/e2e8f0/1e293b?text=No+Image'
                        } 
                        alt={language === 'en' ? product.name : (product.nameHi || product.name)} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {language === 'en' ? product.name : (product.nameHi || product.name)}
                  </TableCell>
                  <TableCell>₹{product.price}/{product.unit}</TableCell>
                  <TableCell>{product.stock} {product.unit}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={product.stock > 0} 
                        onCheckedChange={() => handleVisibilityToggle(product.id, product.stock > 0)}
                        disabled={toggleVisibilityMutation.isPending}
                      />
                      <span>
                        {product.stock > 0 
                          ? (language === 'en' ? 'Active' : 'सक्रिय') 
                          : (language === 'en' ? 'Inactive' : 'निष्क्रिय')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">{language === 'en' ? 'Actions' : 'कार्रवाइयां'}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewProduct(product.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          {language === 'en' ? 'View' : 'देखें'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditProduct(product.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          {language === 'en' ? 'Edit' : 'संपादित करें'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {language === 'en' ? 'Delete' : 'हटाएं'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="mb-4">
            {language === 'en' 
              ? 'You haven\'t added any products yet.' 
              : 'आपने अभी तक कोई उत्पाद नहीं जोड़ा है।'}
          </p>
          <Button 
            className="bg-primary hover:bg-primary-dark"
            onClick={() => setLocation('/farmer/add-product')}
          >
            {t('addProduct')}
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={productToDelete !== null} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'en' ? 'Are you sure?' : 'क्या आप सुनिश्चित हैं?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'en' 
                ? 'This action cannot be undone. This will permanently delete your product.'
                : 'यह क्रिया पूर्ववत नहीं की जा सकती। यह आपके उत्पाद को स्थायी रूप से हटा देगा।'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === 'en' ? 'Cancel' : 'रद्द करें'}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteProductMutation.isPending 
                ? (language === 'en' ? 'Deleting...' : 'हटा रहा है...') 
                : (language === 'en' ? 'Delete' : 'हटाएं')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
