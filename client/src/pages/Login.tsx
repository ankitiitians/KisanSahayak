import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '@/context/LanguageContext';
import { Link, useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/layouts/MainLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LoginFormData } from '@/types';

export default function Login() {
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  // Define form schema
  const loginSchema = z.object({
    phone: z.string()
      .min(10, language === 'en' ? 'Phone number must be 10 digits' : 'फोन नंबर 10 अंकों का होना चाहिए')
      .max(10, language === 'en' ? 'Phone number must be 10 digits' : 'फोन नंबर 10 अंकों का होना चाहिए')
      .regex(/^\d+$/, language === 'en' ? 'Phone number must contain only digits' : 'फोन नंबर में केवल अंक होने चाहिए'),
    password: z.string()
      .min(6, language === 'en' ? 'Password must be at least 6 characters' : 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए'),
  });

  // Initialize form
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: '',
      password: '',
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      return apiRequest('POST', '/api/auth/login', data);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      toast({
        title: language === 'en' ? 'Login successful' : 'लॉगिन सफल',
        description: language === 'en' 
          ? `Welcome back, ${data.name}!` 
          : `वापसी पर स्वागत है, ${data.name}!`,
      });
      
      // Redirect based on user role
      if (data.role === 'farmer') {
        setLocation('/farmer/dashboard');
      } else if (data.role === 'customer') {
        setLocation('/customer/dashboard');
      } else if (data.role === 'admin') {
        setLocation('/admin/dashboard');
      } else {
        setLocation('/');
      }
    },
    onError: (error: Error) => {
      setError(error.message);
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: LoginFormData) => {
    setError(null);
    loginMutation.mutate(data);
  };

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center bg-neutral-50 py-12">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">{t('loginTitle')}</CardTitle>
            <CardDescription className="text-center">
              {t('noAccount')} <Link href="/register/customer" className="text-primary hover:underline">{t('register')}</Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('phoneNumber')}</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 border border-r-0 border-neutral-300 bg-neutral-100 text-neutral-500 rounded-l-md">
                            +91
                          </span>
                          <Input 
                            {...field} 
                            className="rounded-l-none" 
                            placeholder="9876543210" 
                            maxLength={10}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('password')}</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="text-right">
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    {t('forgotPassword')}
                  </Link>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary-dark"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? '...' : t('loginButton')}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-neutral-500">
              {t('noAccount')} <Link href="/register/customer" className="text-primary hover:underline">{t('register')}</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
