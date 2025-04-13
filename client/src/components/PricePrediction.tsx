import { useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { AlertCircle, TrendingUp, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PricePredictionProps {
  language: 'en' | 'hi';
}

export default function PricePrediction({ language }: PricePredictionProps) {
  const [product, setProduct] = useState('');
  const [quality, setQuality] = useState('medium');
  const [region, setRegion] = useState('');
  const [quantity, setQuantity] = useState('');
  const [season, setSeason] = useState('current');
  const [predictionResult, setPredictionResult] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Translation strings
  const t = {
    title: language === 'en' ? 'AI Price Prediction' : 'एआई मूल्य अनुमान',
    description: language === 'en' 
      ? 'Use AI to get competitive price recommendations for your produce' 
      : 'अपनी उपज के लिए प्रतिस्पर्धी मूल्य अनुशंसाएँ प्राप्त करने के लिए एआई का उपयोग करें',
    productLabel: language === 'en' ? 'Product Type' : 'उत्पाद प्रकार',
    productPlaceholder: language === 'en' ? 'Select product' : 'उत्पाद चुनें',
    qualityLabel: language === 'en' ? 'Quality' : 'गुणवत्ता',
    highQuality: language === 'en' ? 'High' : 'उच्च',
    mediumQuality: language === 'en' ? 'Medium' : 'मध्यम',
    lowQuality: language === 'en' ? 'Low' : 'निम्न',
    regionLabel: language === 'en' ? 'Region' : 'क्षेत्र',
    regionPlaceholder: language === 'en' ? 'Enter your region' : 'अपना क्षेत्र दर्ज करें',
    quantityLabel: language === 'en' ? 'Quantity (kg)' : 'मात्रा (किलोग्राम)',
    quantityPlaceholder: language === 'en' ? 'Enter quantity' : 'मात्रा दर्ज करें',
    seasonLabel: language === 'en' ? 'Season' : 'मौसम',
    currentSeason: language === 'en' ? 'Current Season' : 'वर्तमान मौसम',
    offSeason: language === 'en' ? 'Off Season' : 'ऑफ सीजन',
    peakSeason: language === 'en' ? 'Peak Season' : 'पीक सीजन',
    calculateButton: language === 'en' ? 'Calculate Price' : 'मूल्य की गणना करें',
    calculating: language === 'en' ? 'Calculating...' : 'गणना हो रही है...',
    resultLabel: language === 'en' ? 'Recommended Price Range' : 'अनुशंसित मूल्य सीमा',
    perKg: language === 'en' ? 'per kg' : 'प्रति किलो',
    disclaimer: language === 'en' 
      ? 'This is an AI-based prediction. Actual market prices may vary.' 
      : 'यह एक एआई-आधारित भविष्यवाणी है। वास्तविक बाजार मूल्य भिन्न हो सकते हैं।',
    errorTitle: language === 'en' ? 'Error' : 'त्रुटि',
    errorMessage: language === 'en' 
      ? 'Unable to generate price prediction. Please try again later.' 
      : 'मूल्य भविष्यवाणी उत्पन्न करने में असमर्थ। कृपया बाद में पुनः प्रयास करें।',
  };

  // List of common agricultural products
  const products = [
    { value: 'tomato', label: language === 'en' ? 'Tomato' : 'टमाटर' },
    { value: 'potato', label: language === 'en' ? 'Potato' : 'आलू' },
    { value: 'onion', label: language === 'en' ? 'Onion' : 'प्याज' },
    { value: 'rice', label: language === 'en' ? 'Rice' : 'चावल' },
    { value: 'wheat', label: language === 'en' ? 'Wheat' : 'गेहूं' },
    { value: 'apple', label: language === 'en' ? 'Apple' : 'सेब' },
    { value: 'mango', label: language === 'en' ? 'Mango' : 'आम' },
    { value: 'cucumber', label: language === 'en' ? 'Cucumber' : 'खीरा' },
    { value: 'cauliflower', label: language === 'en' ? 'Cauliflower' : 'फूलगोभी' },
    { value: 'okra', label: language === 'en' ? 'Okra' : 'भिंडी' },
  ];

  // Simple algorithm to generate a price prediction
  // In a real app, this would call an API connected to an AI model
  const generatePricePrediction = () => {
    setError('');
    setIsLoading(true);
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      try {
        // Base prices for different products (in rupees per kg)
        const basePrices: Record<string, number> = {
          'tomato': 30,
          'potato': 25,
          'onion': 35,
          'rice': 45,
          'wheat': 28,
          'apple': 80,
          'mango': 70,
          'cucumber': 20,
          'cauliflower': 35,
          'okra': 40,
        };
        
        // Quality multipliers
        const qualityMultiplier = {
          'high': 1.3,
          'medium': 1.0,
          'low': 0.7,
        };
        
        // Season multipliers
        const seasonMultiplier = {
          'peak': 0.8,  // Prices are lower during peak season due to abundance
          'current': 1.0,
          'off': 1.5,   // Prices are higher during off season due to scarcity
        };
        
        // Calculate base price
        const basePrice = basePrices[product] || 40; // Default if product not found
        
        // Apply multipliers
        let calculatedPrice = basePrice;
        calculatedPrice *= qualityMultiplier[quality as keyof typeof qualityMultiplier];
        calculatedPrice *= seasonMultiplier[season as keyof typeof seasonMultiplier];
        
        // Add some randomness (±10%)
        const randomFactor = 0.9 + (Math.random() * 0.2);
        calculatedPrice *= randomFactor;
        
        // Round to nearest whole number
        calculatedPrice = Math.round(calculatedPrice);
        
        // Set the prediction result
        setPredictionResult(calculatedPrice);
        setIsLoading(false);
      } catch (err) {
        setError(t.errorMessage);
        setIsLoading(false);
      }
    }, 1500); // Simulate a 1.5 second API call
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) {
      setError(language === 'en' ? 'Please select a product' : 'कृपया एक उत्पाद चुनें');
      return;
    }
    generatePricePrediction();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t.errorTitle}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.productLabel}</label>
              <Select value={product} onValueChange={setProduct}>
                <SelectTrigger>
                  <SelectValue placeholder={t.productPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {products.map((prod) => (
                    <SelectItem key={prod.value} value={prod.value}>
                      {prod.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.qualityLabel}</label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">{t.highQuality}</SelectItem>
                  <SelectItem value="medium">{t.mediumQuality}</SelectItem>
                  <SelectItem value="low">{t.lowQuality}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.regionLabel}</label>
              <Input 
                placeholder={t.regionPlaceholder} 
                value={region} 
                onChange={(e) => setRegion(e.target.value)} 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.quantityLabel}</label>
              <Input 
                type="number" 
                placeholder={t.quantityPlaceholder} 
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)} 
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">{t.seasonLabel}</label>
              <Select value={season} onValueChange={setSeason}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">{t.currentSeason}</SelectItem>
                  <SelectItem value="peak">{t.peakSeason}</SelectItem>
                  <SelectItem value="off">{t.offSeason}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? t.calculating : t.calculateButton}
          </Button>
        </form>
        
        {predictionResult !== null && !isLoading && (
          <div className="mt-6 p-4 bg-primary/10 rounded-lg">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">{t.resultLabel}</p>
              <div className="text-right">
                <p className="text-xl font-bold text-primary">₹{predictionResult} <span className="text-xs font-normal text-neutral-500">{t.perKg}</span></p>
                <p className="text-xs text-neutral-500">₹{Math.round(predictionResult * 0.9)} - ₹{Math.round(predictionResult * 1.1)}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <p className="text-xs text-neutral-500">{t.disclaimer}</p>
      </CardFooter>
    </Card>
  );
}