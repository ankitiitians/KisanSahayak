import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/context/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { UserCircle, ShoppingCart, Menu } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Header() {
  const { t, language } = useLanguage();
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  // Check if user is logged in
  const { data: user } = useQuery<{ id: number; name: string; role: string } | null>({
    queryKey: ['/api/auth/me'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const navLinks = [
    { name: t('home'), path: '/' },
    { name: t('browseProducts'), path: '/products' },
    { name: t('knowledgeHub'), path: '/knowledge-hub' },
    { name: t('aboutUs'), path: '/about' },
  ];

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="h-10 w-10 rounded-full mr-2 bg-primary flex items-center justify-center text-white">
              <span className="text-lg font-bold">BF</span>
            </div>
            <div>
              <h1 className="font-poppins font-bold text-primary text-xl">{t('appName')}</h1>
              <p className="text-xs text-neutral-600" lang={language === 'hi' ? 'hi' : 'en'}>
                {t('slogan')}
              </p>
            </div>
          </Link>
          
          {/* Navigation Links - Desktop */}
          {!isMobile && (
            <nav className="flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  href={link.path}
                  className={`text-neutral-700 hover:text-primary transition-colors ${
                    location === link.path ? 'text-primary font-medium' : ''
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          )}
          
          {/* Right Section: Language Toggle, Profile, Cart */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <LanguageToggle />
            
            {/* Shopping Cart */}
            {user && (
              <Link href="/cart" className="flex items-center space-x-1 text-neutral-700 hover:text-primary">
                <ShoppingCart className="h-5 w-5" />
                {!isMobile && <span className="hidden md:inline">{t('cart')}</span>}
              </Link>
            )}
            
            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-0 hover:bg-transparent">
                    <div className="flex items-center space-x-1 text-neutral-700 hover:text-primary">
                      <UserCircle className="h-5 w-5" />
                      {!isMobile && <span className="hidden md:inline">{user.name || t('account')}</span>}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={user.role === 'farmer' ? '/farmer/dashboard' : '/customer/dashboard'}>
                      {t('dashboard')}
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'farmer' && (
                    <DropdownMenuItem asChild>
                      <Link href="/farmer/add-product">{t('addProduct')}</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/messages">{t('messages')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/logout">{t('logout')}</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-0 hover:bg-transparent">
                    <div className="flex items-center space-x-1 text-neutral-700 hover:text-primary">
                      <UserCircle className="h-5 w-5" />
                      {!isMobile && <span className="hidden md:inline">{t('account')}</span>}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/login">{t('login')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/register/customer">{t('registerAsCustomer')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/register/farmer">{t('registerAsFarmer')}</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Mobile Menu Toggle */}
            {isMobile && (
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[80%] sm:w-[385px]">
                  <nav className="flex flex-col gap-4 mt-8">
                    {navLinks.map((link) => (
                      <Link 
                        key={link.path} 
                        href={link.path}
                        className={`text-neutral-700 hover:text-primary transition-colors py-2 border-b border-neutral-200 ${
                          location === link.path ? 'text-primary font-medium' : ''
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
