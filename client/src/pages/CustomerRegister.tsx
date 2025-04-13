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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomerRegisterFormData, OTPVerificationForm } from '@/types';
import OTPInput from '@/components/OTPInput';

export default function CustomerRegister() {
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [otpValue, setOtpValue] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Define registration form schema
  const registerSchema = z.object({
    name: z.string().min(2, language === 'en' ? 'Name is required' : 'नाम आवश्यक है'),
    phone: z.string()
      .min(10, language === 'en' ? 'Phone number must be 10 digits' : 'फोन नंबर 10 अंकों का होना चाहिए')
      .max(10, language === 'en' ? 'Phone number must be 10 digits' : 'फोन नंबर 10 अंकों का होना चाहिए')
      .regex(/^\d+$/, language === 'en' ? 'Phone number must contain only digits' : 'फोन नंबर में केवल अंक होने चाहिए'),
    email: z.string().email().optional().or(z.literal('')),
    password: z.string()
      .min(6, language === 'en' ? 'Password must be at least 6 characters' : 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए'),
    confirmPassword: z.string(),
    address: z.string().min(5, language === 'en' ? 'Address is required' : 'पता आवश्यक है'),
    state: z.string().min(1, language === 'en' ? 'State is required' : 'राज्य आवश्यक है'),
  }).refine((data) => data.password === data.confirmPassword, {
    message: language === 'en' ? "Passwords don't match" : "पासवर्ड मेल नहीं खाते",
    path: ['confirmPassword'],
  });

  // Initialize form
  const form = useForm<CustomerRegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      address: '',
      state: '',
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: CustomerRegisterFormData) => {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = data;
      return apiRequest('POST', '/api/auth/register/customer', registerData);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setUserId(data.userId);
      
      toast({
        title: language === 'en' ? 'Registration initiated' : 'पंजीकरण शुरू किया गया',
        description: language === 'en' 
          ? 'We have sent an OTP to your mobile number' 
          : 'हमने आपके मोबाइल नंबर पर एक OTP भेजा है',
      });
      
      setStep('verify');
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

  // OTP verification mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async (data: OTPVerificationForm) => {
      return apiRequest('POST', '/api/auth/verify-otp', {
        userId,
        otp: data.otp,
        role: 'customer'
      });
    },
    onSuccess: async () => {
      toast({
        title: language === 'en' ? 'Registration successful' : 'पंजीकरण सफल',
        description: language === 'en' 
          ? 'Your account has been created successfully' 
          : 'आपका खाता सफलतापूर्वक बनाया गया है',
      });
      
      setLocation('/login');
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
  const onSubmit = (data: CustomerRegisterFormData) => {
    setError(null);
    registerMutation.mutate(data);
  };

  // OTP verification handler
  const verifyOtp = () => {
    if (otpValue.length !== 6) {
      setError(language === 'en' ? 'Please enter a valid 6-digit OTP' : 'कृपया एक वैध 6-अंकीय OTP दर्ज करें');
      return;
    }

    setError(null);
    verifyOtpMutation.mutate({ otp: otpValue });
  };

  // Resend OTP handler
  const resendOtp = async () => {
    if (!userId) return;

    try {
      await apiRequest('POST', '/api/auth/resend-otp', { userId });
      toast({
        title: language === 'en' ? 'OTP Resent' : 'OTP फिर से भेजा गया',
        description: language === 'en' ? 'A new OTP has been sent to your mobile' : 'आपके मोबाइल पर एक नया OTP भेजा गया है',
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    }
  };

  // List of Indian states
  const indianStates = [
    { value: 'andhra_pradesh', label: language === 'en' ? 'Andhra Pradesh' : 'आंध्र प्रदेश' },
    { value: 'arunachal_pradesh', label: language === 'en' ? 'Arunachal Pradesh' : 'अरुणाचल प्रदेश' },
    { value: 'assam', label: language === 'en' ? 'Assam' : 'असम' },
    { value: 'bihar', label: language === 'en' ? 'Bihar' : 'बिहार' },
    { value: 'chhattisgarh', label: language === 'en' ? 'Chhattisgarh' : 'छत्तीसगढ़' },
    { value: 'goa', label: language === 'en' ? 'Goa' : 'गोवा' },
    { value: 'gujarat', label: language === 'en' ? 'Gujarat' : 'गुजरात' },
    { value: 'haryana', label: language === 'en' ? 'Haryana' : 'हरियाणा' },
    { value: 'himachal_pradesh', label: language === 'en' ? 'Himachal Pradesh' : 'हिमाचल प्रदेश' },
    { value: 'jharkhand', label: language === 'en' ? 'Jharkhand' : 'झारखंड' },
    { value: 'karnataka', label: language === 'en' ? 'Karnataka' : 'कर्नाटक' },
    { value: 'kerala', label: language === 'en' ? 'Kerala' : 'केरल' },
    { value: 'madhya_pradesh', label: language === 'en' ? 'Madhya Pradesh' : 'मध्य प्रदेश' },
    { value: 'maharashtra', label: language === 'en' ? 'Maharashtra' : 'महाराष्ट्र' },
    { value: 'manipur', label: language === 'en' ? 'Manipur' : 'मणिपुर' },
    { value: 'meghalaya', label: language === 'en' ? 'Meghalaya' : 'मेघालय' },
    { value: 'mizoram', label: language === 'en' ? 'Mizoram' : 'मिजोरम' },
    { value: 'nagaland', label: language === 'en' ? 'Nagaland' : 'नागालैंड' },
    { value: 'odisha', label: language === 'en' ? 'Odisha' : 'ओडिशा' },
    { value: 'punjab', label: language === 'en' ? 'Punjab' : 'पंजाब' },
    { value: 'rajasthan', label: language === 'en' ? 'Rajasthan' : 'राजस्थान' },
    { value: 'sikkim', label: language === 'en' ? 'Sikkim' : 'सिक्किम' },
    { value: 'tamil_nadu', label: language === 'en' ? 'Tamil Nadu' : 'तमिलनाडु' },
    { value: 'telangana', label: language === 'en' ? 'Telangana' : 'तेलंगाना' },
    { value: 'tripura', label: language === 'en' ? 'Tripura' : 'त्रिपुरा' },
    { value: 'uttar_pradesh', label: language === 'en' ? 'Uttar Pradesh' : 'उत्तर प्रदेश' },
    { value: 'uttarakhand', label: language === 'en' ? 'Uttarakhand' : 'उत्तराखंड' },
    { value: 'west_bengal', label: language === 'en' ? 'West Bengal' : 'पश्चिम बंगाल' },
    { value: 'delhi', label: language === 'en' ? 'Delhi' : 'दिल्ली' },
  ];

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center bg-neutral-50 py-12">
        <Card className="w-full max-w-md mx-4">
          {step === 'register' ? (
            <>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">{t('registerAsCustomer')}</CardTitle>
                <CardDescription className="text-center">
                  {t('alreadyHaveAccount')} <Link href="/login" className="text-primary hover:underline">{t('login')}</Link>
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
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('fullName')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('email')}</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('password')}</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('confirmPassword')}</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('address')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('state')}</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('selectState')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {indianStates.map((state) => (
                                <SelectItem key={state.value} value={state.value}>
                                  {state.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary-dark"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? '...' : t('createAccount')}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-neutral-500">
                  {t('alreadyHaveAccount')} <Link href="/login" className="text-primary hover:underline">{t('login')}</Link>
                </p>
              </CardFooter>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">{t('verifyOTPTitle')}</CardTitle>
                <CardDescription className="text-center">{t('otpSent')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">
                    {error}
                  </div>
                )}
                
                <div className="mb-6">
                  <OTPInput 
                    value={otpValue}
                    onChange={setOtpValue}
                  />
                </div>
                
                <Button 
                  className="w-full bg-primary hover:bg-primary-dark"
                  onClick={verifyOtp}
                  disabled={verifyOtpMutation.isPending}
                >
                  {verifyOtpMutation.isPending ? '...' : t('verifyAndContinue')}
                </Button>
                
                <div className="text-center">
                  <Button 
                    variant="link" 
                    className="text-primary hover:underline" 
                    onClick={resendOtp}
                  >
                    {t('resendOTP')}
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
