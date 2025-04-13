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
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FarmerRegisterFormData, OTPVerificationForm } from '@/types';
import OTPInput from '@/components/OTPInput';

export default function FarmerRegister() {
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [activeTab, setActiveTab] = useState('personal');
  const [otpValue, setOtpValue] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Define registration form schema
  const registerSchema = z.object({
    // Personal Details
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
    
    // Farm Details
    farmName: z.string().optional(),
    farmLocation: z.string().optional(),
    farmSize: z.string().optional(),
    aadhaarNumber: z.string().optional(),
    
    // Bank Details
    bankAccount: z.string().optional(),
    ifscCode: z.string().optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: language === 'en' ? "Passwords don't match" : "पासवर्ड मेल नहीं खाते",
    path: ['confirmPassword'],
  });

  // Initialize form
  const form = useForm<FarmerRegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      address: '',
      state: '',
      farmName: '',
      farmLocation: '',
      farmSize: '',
      aadhaarNumber: '',
      bankAccount: '',
      ifscCode: '',
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: FarmerRegisterFormData) => {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = data;
      return apiRequest('POST', '/api/auth/register/farmer', registerData);
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
        role: 'farmer'
      });
    },
    onSuccess: async () => {
      toast({
        title: language === 'en' ? 'Registration successful' : 'पंजीकरण सफल',
        description: language === 'en' 
          ? 'Your account is now pending verification by our team. You will be notified once approved.' 
          : 'आपका खाता अब हमारी टीम द्वारा सत्यापन के लिए लंबित है। स्वीकृत होने पर आपको सूचित किया जाएगा।',
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
  const onSubmit = (data: FarmerRegisterFormData) => {
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Form navigation
  const goToNextTab = () => {
    if (activeTab === 'personal') {
      const isValid = [
        'name', 'phone', 'password', 'confirmPassword', 'address', 'state'
      ].every(field => {
        const result = form.trigger(field as any);
        return result;
      });
      
      if (isValid) {
        setActiveTab('farm');
      }
    } else if (activeTab === 'farm') {
      setActiveTab('bank');
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center bg-neutral-50 py-12">
        <Card className="w-full max-w-md mx-4">
          {step === 'register' ? (
            <>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">{t('registerAsFarmerTitle')}</CardTitle>
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
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                      <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="personal">
                          {language === 'en' ? 'Personal' : 'व्यक्तिगत'}
                        </TabsTrigger>
                        <TabsTrigger value="farm">
                          {language === 'en' ? 'Farm' : 'खेत'}
                        </TabsTrigger>
                        <TabsTrigger value="bank">
                          {language === 'en' ? 'Bank' : 'बैंक'}
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="personal" className="space-y-4">
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
                        
                        <div className="pt-2">
                          <Button 
                            type="button" 
                            className="w-full bg-primary hover:bg-primary-dark"
                            onClick={goToNextTab}
                          >
                            {language === 'en' ? 'Next' : 'अगला'}
                          </Button>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="farm" className="space-y-4">
                        <div className="bg-primary-light/10 p-4 rounded-md mb-2">
                          <h3 className="font-medium text-lg mb-1">{t('farmDetails')}</h3>
                          <p className="text-sm text-neutral-600">
                            {language === 'en' 
                              ? 'These details help customers know more about your farm.' 
                              : 'ये विवरण ग्राहकों को आपके खेत के बारे में अधिक जानने में मदद करते हैं।'}
                          </p>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="farmName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('farmName')}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="farmLocation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('farmLocation')}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="farmSize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('farmSize')}</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" min="0" step="0.01" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="aadhaarNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('aadhaarNumber')}</FormLabel>
                              <FormControl>
                                <Input {...field} maxLength={12} />
                              </FormControl>
                              <FormMessage />
                              <p className="text-xs text-neutral-500 mt-1">
                                {language === 'en' 
                                  ? 'For verification purposes only. Your Aadhaar number will be kept secure.' 
                                  : 'केवल सत्यापन उद्देश्यों के लिए। आपका आधार नंबर सुरक्षित रखा जाएगा।'}
                              </p>
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-between pt-2">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setActiveTab('personal')}
                          >
                            {language === 'en' ? 'Back' : 'पीछे'}
                          </Button>
                          <Button 
                            type="button" 
                            className="bg-primary hover:bg-primary-dark"
                            onClick={goToNextTab}
                          >
                            {language === 'en' ? 'Next' : 'अगला'}
                          </Button>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="bank" className="space-y-4">
                        <div className="bg-primary-light/10 p-4 rounded-md mb-2">
                          <h3 className="font-medium text-lg mb-1">{t('bankDetails')}</h3>
                          <p className="text-sm text-neutral-600">
                            {language === 'en' 
                              ? 'Your bank details are required to receive payments from sales.' 
                              : 'बिक्री से भुगतान प्राप्त करने के लिए आपके बैंक विवरण आवश्यक हैं।'}
                          </p>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="bankAccount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('accountNumber')}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="ifscCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('ifscCode')}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="mt-4">
                          <div className="flex items-center space-x-2 mb-4">
                            <Checkbox id="terms" required />
                            <label
                              htmlFor="terms"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {t('termsAgree')}
                            </label>
                          </div>
                        </div>
                        
                        <div className="flex justify-between pt-2">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setActiveTab('farm')}
                          >
                            {language === 'en' ? 'Back' : 'पीछे'}
                          </Button>
                          <Button 
                            type="submit" 
                            className="bg-primary hover:bg-primary-dark"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? '...' : t('createAccount')}
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
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
