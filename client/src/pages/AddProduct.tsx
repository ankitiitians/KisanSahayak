import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useLocation } from 'wouter';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AddProduct() {
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-poppins font-semibold text-2xl md:text-3xl">
            {t('addProduct')}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'en' ? 'Add New Product' : 'नया उत्पाद जोड़ें'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center py-8">
            <p className="text-neutral-600 mb-4">
              {language === 'en' 
                ? 'Product form will be implemented in the next phase.' 
                : 'उत्पाद फॉर्म अगले चरण में लागू किया जाएगा।'}
            </p>
            <Button 
              onClick={() => setLocation('/farmer/dashboard')}
              className="bg-primary hover:bg-primary-dark"
            >
              {language === 'en' ? 'Back to Dashboard' : 'डैशबोर्ड पर वापस जाएं'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}