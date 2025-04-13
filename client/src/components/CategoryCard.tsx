import { Link } from 'wouter';
// import { useLanguage } from '@/context/LanguageContext';
import { CategoryWithProductCount } from '@/types';

type CategoryCardProps = {
  category: CategoryWithProductCount;
};

export default function CategoryCard({ category }: CategoryCardProps) {
  // Temporary fix - hardcode language to English
  const language = 'en';
  
  return (
    <Link href={`/products?category=${category.id}`}>
      <div className="bg-neutral-100 rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
        <div className={`w-16 h-16 mx-auto mb-3 rounded-full ${category.bgColor} flex items-center justify-center`}>
          <i className={`${category.icon} ${category.iconColor} text-2xl`}></i>
        </div>
        <h3 className="font-medium">
          {language === 'en' ? category.name : category.nameHi}
        </h3>
      </div>
    </Link>
  );
}
