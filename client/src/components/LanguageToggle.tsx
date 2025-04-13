import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="px-3 py-1 h-auto text-sm rounded-full hover:bg-neutral-100 border border-neutral-300"
      onClick={toggleLanguage}
    >
      <span className="mr-1">EN</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-1">
        <path d="M8 3L4 7l4 4" />
        <path d="M4 7h16" />
        <path d="m16 21 4-4-4-4" />
        <path d="M20 17H4" />
      </svg>
      <span className="ml-1" lang="hi">हिं</span>
    </Button>
  );
}
