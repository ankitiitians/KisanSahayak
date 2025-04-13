// import { useLanguage } from '@/context/LanguageContext';
import { StarIcon } from 'lucide-react';

type TestimonialCardProps = {
  name: string;
  role: string;
  location: string;
  image: string;
  text: string;
  rating: number;
};

export default function TestimonialCard({ 
  name, 
  role, 
  location, 
  image, 
  text, 
  rating 
}: TestimonialCardProps) {
  // Temporary fix - create simple translation function
  const t = (key: string): string => {
    const translations: Record<string, string> = {
      'farmerLabel': 'Farmer',
      'customerLabel': 'Customer'
    };
    return translations[key] || key;
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-start mb-4">
        <img 
          src={image} 
          alt={name} 
          className="w-14 h-14 rounded-full object-cover mr-4" 
        />
        <div>
          <h3 className="font-medium text-lg">{name}</h3>
          <p className="text-neutral-600 text-sm">
            {role === 'farmer' ? t('farmerLabel') : t('customerLabel')}, {location}
          </p>
        </div>
      </div>
      
      <blockquote className="text-neutral-700 italic mb-4">
        "{text}"
      </blockquote>
      
      <div className="flex text-[#FFC107]">
        {[...Array(5)].map((_, i) => (
          <StarIcon 
            key={i} 
            className={`w-4 h-4 ${i < rating ? 'fill-current' : ''}`} 
          />
        ))}
      </div>
    </div>
  );
}
