import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/context/LanguageContext';
import { useLocation } from 'wouter';
import MainLayout from '@/layouts/MainLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { 
  Slider
} from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/ProductCard';
import { ProductWithImages, CategoryWithProductCount, ProductFilters } from '@/types';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

export default function Products() {
  const { t, language } = useLanguage();
  const [location] = useLocation();
  
  // Get category from URL if present
  const urlParams = new URLSearchParams(location.split('?')[1]);
  const categoryParam = urlParams.get('category');
  const searchParam = urlParams.get('search');
  
  // State for filters
  const [filters, setFilters] = useState<ProductFilters>({
    categoryId: categoryParam ? parseInt(categoryParam) : undefined,
    minPrice: undefined,
    maxPrice: undefined,
    isOrganic: false,
    isSeasonal: false,
    searchTerm: searchParam || undefined,
    sortBy: 'newest'
  });
  
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch categories
  const { data: categories, isLoading: loadingCategories } = useQuery<CategoryWithProductCount[]>({
    queryKey: ['/api/categories'],
    staleTime: Infinity, // Categories rarely change
  });
  
  // Fetch products with filters
  const {
    data: products,
    isLoading: loadingProducts,
    refetch
  } = useQuery<ProductWithImages[]>({
    queryKey: ['/api/products', filters],
    queryFn: async ({ queryKey }) => {
      const params = new URLSearchParams();
      const [_, filtersObj] = queryKey;
      
      // Add filters to params
      Object.entries(filtersObj as ProductFilters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
      
      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    }
  });
  
  // Refetch when filters change
  useEffect(() => {
    refetch();
  }, [filters, refetch]);
  
  // Handle price range change
  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };
  
  // Apply filters
  const applyFilters = () => {
    setFilters(prev => ({
      ...prev,
      minPrice: priceRange[0],
      maxPrice: priceRange[1]
    }));
    
    // Close filter panel on mobile
    if (window.innerWidth < 768) {
      setShowFilters(false);
    }
  };
  
  // Clear filters
  const clearFilters = () => {
    setPriceRange([0, 5000]);
    setFilters({
      categoryId: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      isOrganic: false,
      isSeasonal: false,
      searchTerm: undefined,
      sortBy: 'newest'
    });
  };
  
  // Handle search
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const searchInput = (e.target as HTMLFormElement).search.value;
    setFilters(prev => ({
      ...prev,
      searchTerm: searchInput
    }));
  };
  
  return (
    <MainLayout>
      <div className="bg-neutral-50 py-6 md:py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="font-poppins font-semibold text-2xl md:text-3xl mb-2">
              {filters.searchTerm 
                ? `${t('searchResults')}: "${filters.searchTerm}"`
                : t('browseProducts')}
            </h1>
            
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                  <Input 
                    name="search"
                    className="pl-10"
                    placeholder={language === 'en' ? "Search products..." : "उत्पाद खोजें..."}
                    defaultValue={filters.searchTerm}
                  />
                </div>
                <Button type="submit">{t('search')}</Button>
              </form>
              
              <div className="md:hidden">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {t('filter')}
                </Button>
              </div>
              
              <Select
                value={filters.sortBy}
                onValueChange={(value) => 
                  setFilters(prev => ({...prev, sortBy: value as ProductFilters['sortBy']}))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('sortBy')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price_asc">{t('priceLowToHigh')}</SelectItem>
                  <SelectItem value="price_desc">{t('priceHighToLow')}</SelectItem>
                  <SelectItem value="newest">{t('newest')}</SelectItem>
                  <SelectItem value="popularity">{t('popularity')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters - Desktop */}
            <div className="hidden md:block w-64 flex-shrink-0">
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-medium text-lg">{t('filter')}</h2>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      {language === 'en' ? 'Clear' : 'साफ़ करें'}
                    </Button>
                  </div>
                  
                  <Accordion type="multiple" defaultValue={['category', 'price', 'badges']}>
                    <AccordionItem value="category">
                      <AccordionTrigger>{t('category')}</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          <div
                            className={`px-2 py-1 rounded cursor-pointer hover:bg-neutral-100 ${
                              filters.categoryId === undefined ? 'bg-primary-light/10 text-primary font-medium' : ''
                            }`}
                            onClick={() => setFilters(prev => ({ ...prev, categoryId: undefined }))}
                          >
                            {language === 'en' ? 'All Categories' : 'सभी श्रेणियां'}
                          </div>
                          
                          {loadingCategories ? (
                            <div className="space-y-2">
                              <Skeleton className="h-6 w-full" />
                              <Skeleton className="h-6 w-full" />
                              <Skeleton className="h-6 w-full" />
                            </div>
                          ) : (
                            categories?.map(category => (
                              <div
                                key={category.id}
                                className={`px-2 py-1 rounded cursor-pointer hover:bg-neutral-100 ${
                                  filters.categoryId === category.id ? 'bg-primary-light/10 text-primary font-medium' : ''
                                }`}
                                onClick={() => setFilters(prev => ({ ...prev, categoryId: category.id }))}
                              >
                                {language === 'en' ? category.name : category.nameHi}
                                <span className="text-xs text-neutral-500 ml-1">({category.productCount})</span>
                              </div>
                            ))
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="price">
                      <AccordionTrigger>{t('priceRange')}</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-6 px-2">
                          <Slider
                            value={priceRange}
                            min={0}
                            max={5000}
                            step={100}
                            onValueChange={handlePriceRangeChange}
                            className="my-6"
                          />
                          
                          <div className="flex justify-between">
                            <div>
                              <p className="text-xs text-neutral-500">{t('minPrice')}</p>
                              <p className="font-medium">₹{priceRange[0]}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-neutral-500">{t('maxPrice')}</p>
                              <p className="font-medium">₹{priceRange[1]}</p>
                            </div>
                          </div>
                          
                          <Button 
                            onClick={applyFilters} 
                            size="sm" 
                            className="w-full mt-2"
                          >
                            {t('applyFilters')}
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="badges">
                      <AccordionTrigger>{language === 'en' ? 'Badges' : 'बैज'}</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="organic" 
                              checked={filters.isOrganic}
                              onCheckedChange={(checked) => 
                                setFilters(prev => ({...prev, isOrganic: checked as boolean}))
                              }
                            />
                            <label
                              htmlFor="organic"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {t('organic')}
                            </label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="seasonal" 
                              checked={filters.isSeasonal}
                              onCheckedChange={(checked) => 
                                setFilters(prev => ({...prev, isSeasonal: checked as boolean}))
                              }
                            />
                            <label
                              htmlFor="seasonal"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {t('seasonal')}
                            </label>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>
            
            {/* Filters - Mobile */}
            {showFilters && (
              <div className="md:hidden">
                <Card className="mb-4">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="font-medium text-lg">{t('filter')}</h2>
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        {language === 'en' ? 'Clear' : 'साफ़ करें'}
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">{t('category')}</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div
                            className={`px-2 py-1 text-center rounded cursor-pointer border ${
                              filters.categoryId === undefined 
                                ? 'border-primary bg-primary-light/10 text-primary font-medium' 
                                : 'border-neutral-200'
                            }`}
                            onClick={() => setFilters(prev => ({ ...prev, categoryId: undefined }))}
                          >
                            {language === 'en' ? 'All' : 'सभी'}
                          </div>
                          
                          {loadingCategories ? (
                            <Skeleton className="h-8 w-full" />
                          ) : (
                            categories?.slice(0, 5).map(category => (
                              <div
                                key={category.id}
                                className={`px-2 py-1 text-center rounded cursor-pointer border ${
                                  filters.categoryId === category.id 
                                    ? 'border-primary bg-primary-light/10 text-primary font-medium' 
                                    : 'border-neutral-200'
                                }`}
                                onClick={() => setFilters(prev => ({ ...prev, categoryId: category.id }))}
                              >
                                {language === 'en' ? category.name : category.nameHi}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-medium mb-2">{t('priceRange')}</h3>
                        <Slider
                          value={priceRange}
                          min={0}
                          max={5000}
                          step={100}
                          onValueChange={handlePriceRangeChange}
                          className="my-6"
                        />
                        
                        <div className="flex justify-between">
                          <div>
                            <p className="text-xs text-neutral-500">{t('minPrice')}</p>
                            <p className="font-medium">₹{priceRange[0]}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-neutral-500">{t('maxPrice')}</p>
                            <p className="font-medium">₹{priceRange[1]}</p>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-medium mb-2">{language === 'en' ? 'Badges' : 'बैज'}</h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="organic-mobile" 
                              checked={filters.isOrganic}
                              onCheckedChange={(checked) => 
                                setFilters(prev => ({...prev, isOrganic: checked as boolean}))
                              }
                            />
                            <label
                              htmlFor="organic-mobile"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {t('organic')}
                            </label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="seasonal-mobile" 
                              checked={filters.isSeasonal}
                              onCheckedChange={(checked) => 
                                setFilters(prev => ({...prev, isSeasonal: checked as boolean}))
                              }
                            />
                            <label
                              htmlFor="seasonal-mobile"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {t('seasonal')}
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setShowFilters(false)}
                        >
                          {language === 'en' ? 'Cancel' : 'रद्द करें'}
                        </Button>
                        <Button 
                          className="flex-1"
                          onClick={applyFilters}
                        >
                          {t('applyFilters')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Products Grid */}
            <div className="flex-1">
              {loadingProducts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm">
                      <Skeleton className="h-48 w-full" />
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <Skeleton className="h-6 w-24" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4 mb-4" />
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-9 w-24" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : products && products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg p-8 text-center">
                  <SlidersHorizontal className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
                  <h3 className="text-xl font-medium mb-2">{t('noProductsFound')}</h3>
                  <p className="text-neutral-600 mb-4">
                    {language === 'en' 
                      ? 'Try adjusting your filters or search for something else.' 
                      : 'अपने फ़िल्टर को समायोजित करें या कुछ और खोजें।'}
                  </p>
                  <Button onClick={clearFilters}>{t('clearFilters')}</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
