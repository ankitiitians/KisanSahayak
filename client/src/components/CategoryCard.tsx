import { Link } from 'wouter';
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

// Define a mapping from category names to icons
const getCategoryIcon = (categoryName: string) => {
  const iconMap: Record<string, any> = {
    'Vegetables': faSeedling,
    'Fruits': faAppleAlt, 
    'Grains': faWheatAlt,
    'Spices': faMortarPestle,
    'Dairy': faBottleWater,
    'Organic': faCarrot
  };
  
  return iconMap[categoryName] || faSeedling;
};

type CategoryCardProps = {
  category: CategoryWithProductCount;
};

export default function CategoryCard({ category }: CategoryCardProps) {
  // Temporary fix - hardcode language to English
  const language = 'en';
  
  // Get the appropriate icon based on category name
  const icon = getCategoryIcon(category.name);
  
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