import { Link } from 'wouter';
import { useLanguage } from '@/context/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import TestimonialCard from '@/components/TestimonialCard';
import { ProductWithImages, CategoryWithProductCount } from '@/types';
import { 
  Sprout, 
  Apple, 
  Wheat, 
  Utensils,
  PillBottle,
  Carrot,
  UserPlus,
  ArrowRightLeft,
  Truck,
  Smartphone,
  Languages,
  MessageCircle
} from 'lucide-react';

export default function Home() {
  // Temporary workaround - we'll fix the language context later
  const t = (key: string) => key;
  const language = 'en';

  // Fetch categories
  const { data: categories, isLoading: loadingCategories } = useQuery<CategoryWithProductCount[]>({
    queryKey: ['/api/categories'],
    staleTime: Infinity, // Categories rarely change
  });

  // Fetch featured products
  const { data: featuredProducts, isLoading: loadingProducts } = useQuery<ProductWithImages[]>({
    queryKey: ['/api/products/featured'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Static testimonials data
  const testimonials = [
    {
      name: 'Ramesh Singh',
      role: 'farmer',
      location: 'Punjab',
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
      text: language === 'en' 
        ? "Since joining Bharat Fasal, I've been able to sell my wheat directly to customers in Delhi and get 20% better prices than at the local mandi. The platform is easy to use, even for someone like me who isn't very tech-savvy."
        : "भारत फसल से जुड़ने के बाद, मैं अपना गेहूं सीधे दिल्ली के ग्राहकों को बेच पा रहा हूं और स्थानीय मंडी की तुलना में 20% बेहतर कीमतें प्राप्त कर रहा हूं। प्लेटफॉर्म उपयोग में आसान है, यहां तक कि मेरे जैसे व्यक्ति के लिए भी जो ज्यादा तकनीकी नहीं है।",
      rating: 5
    },
    {
      name: 'Priya Sharma',
      role: 'customer',
      location: 'Mumbai',
      image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
      text: language === 'en'
        ? "I love how I can now buy directly from farmers near Mumbai. The vegetables are fresher than what I used to get at the market, and I feel good knowing my money is going directly to the people who grow my food."
        : "मुझे यह पसंद है कि अब मैं मुंबई के पास के किसानों से सीधे खरीद सकती हूं। सब्जियां बाजार से मिलने वाली सब्जियों से ज्यादा ताजा हैं, और मुझे अच्छा लगता है यह जानकर कि मेरा पैसा सीधे उन लोगों को जा रहा है जो मेरा भोजन उगाते हैं।",
      rating: 4.5
    }
  ];

  // Default categories in case API hasn't loaded yet
  const defaultCategories: CategoryWithProductCount[] = [
    { id: 1, name: 'Vegetables', nameHi: 'सब्जियां', icon: 'fas fa-seedling', bgColor: 'bg-primary-light/10', iconColor: 'text-primary', productCount: 0 },
    { id: 2, name: 'Fruits', nameHi: 'फल', icon: 'fas fa-apple-alt', bgColor: 'bg-accent-light/20', iconColor: 'text-secondary', productCount: 0 },
    { id: 3, name: 'Grains', nameHi: 'अनाज', icon: 'fas fa-wheat-awn', bgColor: 'bg-primary-light/10', iconColor: 'text-primary', productCount: 0 },
    { id: 4, name: 'Spices', nameHi: 'मसाले', icon: 'fas fa-mortar-pestle', bgColor: 'bg-accent-light/20', iconColor: 'text-secondary', productCount: 0 },
    { id: 5, name: 'Dairy', nameHi: 'डेयरी', icon: 'fas fa-milk-bottle', bgColor: 'bg-primary-light/10', iconColor: 'text-primary', productCount: 0 },
    { id: 6, name: 'Organic', nameHi: 'जैविक', icon: 'fas fa-carrot', bgColor: 'bg-accent-light/20', iconColor: 'text-secondary', productCount: 0 }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary-dark py-10 md:py-16 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="md:flex items-center">
            <div className="md:w-1/2 text-white z-10 relative">
              <h1 className="font-poppins font-bold text-3xl md:text-4xl lg:text-5xl mb-4">{t('heroTitle')}</h1>
              <p className="text-lg mb-6 max-w-lg">{t('heroSubtitle')}</p>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Link href="/register/customer">
                  <Button 
                    variant="secondary" 
                    className="bg-white text-primary font-medium py-3 px-6 rounded-lg shadow-md hover:bg-neutral-100 transition-colors text-center"
                  >
                    {t('imCustomer')}
                  </Button>
                </Link>
                <Link href="/register/farmer">
                  <Button 
                    className="bg-[#FF6D00] text-white font-medium py-3 px-6 rounded-lg shadow-md hover:bg-[#E65100] transition-colors text-center"
                  >
                    {t('imFarmer')}
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="md:w-1/2 mt-10 md:mt-0 relative">
              <img 
                src="https://images.unsplash.com/photo-1595356700395-6f14b5ea4fce?ixlib=rb-1.2.1&auto=format&fit=crop&w=640&h=480&q=80" 
                alt="Farmer with fresh produce" 
                className="rounded-lg shadow-lg mx-auto z-10 relative"
              />
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD54F] rounded-full filter blur-3xl opacity-20 -m-10"></div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
            <path fill="#ffffff" fillOpacity="1" d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,197.3C840,192,960,160,1080,154.7C1200,149,1320,171,1380,181.3L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-poppins font-semibold text-2xl md:text-3xl text-center mb-8">{t('browseByCategoryTitle')}</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loadingCategories
              ? defaultCategories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))
              : categories && categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-neutral-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-poppins font-semibold text-2xl md:text-3xl">{t('featuredProducts')}</h2>
            <Link href="/products">
              <span className="text-primary hover:text-primary-dark font-medium flex items-center">
                {t('viewAll')} <span className="ml-2">→</span>
              </span>
            </Link>
          </div>
          
          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loadingProducts
              ? Array(4).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
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
                ))
              : featuredProducts && featuredProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-poppins font-semibold text-2xl md:text-3xl text-center mb-8">{t('howItWorksTitle')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-light/20 flex items-center justify-center">
                <UserPlus className="text-primary h-8 w-8" />
              </div>
              <h3 className="font-poppins font-medium text-xl mb-3">{t('register')}</h3>
              <p className="text-neutral-600">{t('registerDesc')}</p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#FF9E40]/20 flex items-center justify-center">
                <ArrowRightLeft className="text-[#FF6D00] h-8 w-8" />
              </div>
              <h3 className="font-poppins font-medium text-xl mb-3">{t('connect')}</h3>
              <p className="text-neutral-600">{t('connectDesc')}</p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#FFECB3]/30 flex items-center justify-center">
                <Truck className="text-primary h-8 w-8" />
              </div>
              <h3 className="font-poppins font-medium text-xl mb-3">{t('receive')}</h3>
              <p className="text-neutral-600">{t('receiveDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Farmer Registration Banner */}
      <section className="py-10 bg-gradient-to-r from-primary-dark to-primary relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="md:flex items-center justify-between">
            <div className="md:w-7/12">
              <h2 className="font-poppins font-bold text-2xl md:text-3xl text-white mb-4">{t('farmerBannerTitle')}</h2>
              <p className="text-white/90 mb-6 max-w-2xl">{t('farmerBannerDesc')}</p>
              
              <div className="flex flex-wrap gap-4 mb-6 md:mb-0">
                <div className="flex items-center bg-white/10 px-4 py-2 rounded-lg">
                  <i className="fas fa-check-circle text-[#FFD54F] mr-2"></i>
                  <span className="text-white text-sm">{t('noCommissionFees')}</span>
                </div>
                <div className="flex items-center bg-white/10 px-4 py-2 rounded-lg">
                  <i className="fas fa-check-circle text-[#FFD54F] mr-2"></i>
                  <span className="text-white text-sm">{t('directCustomerContact')}</span>
                </div>
                <div className="flex items-center bg-white/10 px-4 py-2 rounded-lg">
                  <i className="fas fa-check-circle text-[#FFD54F] mr-2"></i>
                  <span className="text-white text-sm">{t('simpleInventoryManagement')}</span>
                </div>
              </div>
            </div>
            
            <div className="md:w-4/12 mt-6 md:mt-0">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="font-poppins font-medium text-xl mb-4 text-neutral-800">{t('registerAsFarmerTitle')}</h3>
                
                <Link href="/register/farmer">
                  <Button 
                    className="w-full bg-[#FF6D00] hover:bg-[#E65100] text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    {t('getStarted')}
                  </Button>
                </Link>
                
                <p className="text-xs text-neutral-500 mt-3 text-center">{t('termsAgree')}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/10 to-transparent"></div>
        <div className="absolute top-10 right-10">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-10">
            <path d="M20 0C8.954 0 0 8.954 0 20v160c0 11.046 8.954 20 20 20h160c11.046 0 20-8.954 20-20V20c0-11.046-8.954-20-20-20H20z" fill="#fff"/>
            <path d="M150 60c-8.284 0-15 6.716-15 15 0 8.284 6.716 15 15 15 8.284 0 15-6.716 15-15 0-8.284-6.716-15-15-15z" fill="#fff"/>
          </svg>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 bg-neutral-100">
        <div className="container mx-auto px-4">
          <h2 className="font-poppins font-semibold text-2xl md:text-3xl text-center mb-8">{t('testimonialsTitle')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="py-12 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="md:flex items-center">
            <div className="md:w-1/2 order-2 md:order-1">
              <h2 className="font-poppins font-semibold text-2xl md:text-3xl mb-4">{t('simpleToolsTitle')}</h2>
              <p className="text-neutral-600 mb-6">{t('simpleToolsDesc')}</p>
              
              <div className="space-y-4">
                <div className="flex">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-light/20 flex items-center justify-center mr-4">
                    <Smartphone className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">{t('mobileFriendly')}</h3>
                    <p className="text-neutral-600 text-sm">{t('mobileFriendlyDesc')}</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FF9E40]/20 flex items-center justify-center mr-4">
                    <Languages className="text-[#FF6D00] h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">{t('bilingualSupport')}</h3>
                    <p className="text-neutral-600 text-sm">{t('bilingualSupportDesc')}</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FFECB3]/30 flex items-center justify-center mr-4">
                    <MessageCircle className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">{t('directCommunication')}</h3>
                    <p className="text-neutral-600 text-sm">{t('directCommunicationDesc')}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 order-1 md:order-2 mb-8 md:mb-0">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1541506618330-7c369fc759b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80" 
                  alt="Farmer using smartphone" 
                  className="rounded-lg shadow-lg mx-auto"
                />
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary rounded-full filter blur-2xl opacity-20"></div>
                <div className="absolute -top-4 -left-4 w-32 h-32 bg-[#FF6D00] rounded-full filter blur-2xl opacity-20"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
