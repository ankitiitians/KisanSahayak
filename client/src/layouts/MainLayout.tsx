import { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';

type MainLayoutProps = {
  children: ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  const { language } = useLanguage();

  return (
    <div 
      className={`min-h-screen flex flex-col ${language === 'hi' ? 'font-hindi' : 'font-roboto'}`}
      lang={language}
    >
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
