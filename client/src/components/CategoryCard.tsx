import { Link } from 'wouter';
// import { useLanguage } from '@/context/LanguageContext';
import { CategoryWithProductCount } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSeedling, 
  faAppleAlt, 
  faWheatAlt, 
  faMortarPestle, 
  faBottleWater, 
  faCarrot
} from '@fortawesome/free-solid-svg-icons';

const iconMap = {
  'fas fa-seedling': faSeedling,
  'fas fa-apple-alt': faAppleAlt,
  'fas fa-wheat-awn': faWheatAlt,
  'fas fa-mortar-pestle': faMortarPestle,
  'fas fa-milk-bottle': faBottleWater,
  'fas fa-carrot': faCarrot
};

type CategoryCardProps = {
  category: CategoryWithProductCount;
};

export default function CategoryCard({ category }: CategoryCardProps) {
  // Temporary fix - hardcode language to English
  const language = 'en';
  
  // Get appropriate icon or fallback to seedling
  const icon = iconMap[category.icon as keyof typeof iconMap] || faSeedling;
  
  return (
    <Link href={`/products?category=${category.id}`}>
      <div className="bg-neutral-100 rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
        <div className={`w-16 h-16 mx-auto mb-3 rounded-full ${category.bgColor} flex items-center justify-center`}>
          <FontAwesomeIcon 
            icon={icon} 
            className={`${category.iconColor} text-2xl`} 
            size="lg"
          />
        </div>
        <h3 className="font-medium">
          {language === 'en' ? category.name : category.nameHi}
        </h3>
      </div>
    </Link>
  );
}
