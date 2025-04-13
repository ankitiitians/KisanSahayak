import { Link } from 'wouter';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <footer className="bg-neutral-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-full mr-2 bg-primary flex items-center justify-center text-white">
                <span className="text-sm font-bold">BF</span>
              </div>
              <h3 className="font-poppins font-bold text-xl">{t('appName')}</h3>
            </div>
            <p className="text-neutral-400 text-sm mb-4">
              {language === 'en' 
                ? "Connecting farmers directly with customers across India. Supporting local agriculture and fair prices."
                : "भारत भर में किसानों को सीधे ग्राहकों से जोड़ना। स्थानीय कृषि और उचित मूल्य का समर्थन करना।"}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-medium text-lg mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-neutral-400 hover:text-white transition-colors">{t('home')}</Link></li>
              <li><Link href="/products" className="text-neutral-400 hover:text-white transition-colors">{t('browseProducts')}</Link></li>
              <li><Link href="/register/farmer" className="text-neutral-400 hover:text-white transition-colors">{t('forFarmers')}</Link></li>
              <li><Link href="/register/customer" className="text-neutral-400 hover:text-white transition-colors">{t('forCustomers')}</Link></li>
              <li><Link href="/knowledge-hub" className="text-neutral-400 hover:text-white transition-colors">{t('knowledgeHub')}</Link></li>
              <li><Link href="/about" className="text-neutral-400 hover:text-white transition-colors">{t('aboutUs')}</Link></li>
            </ul>
          </div>
          
          {/* Help & Support */}
          <div>
            <h3 className="font-medium text-lg mb-4">{t('helpSupport')}</h3>
            <ul className="space-y-2">
              <li><Link href="/faq" className="text-neutral-400 hover:text-white transition-colors">{t('faq')}</Link></li>
              <li><Link href="/contact" className="text-neutral-400 hover:text-white transition-colors">{t('contactUs')}</Link></li>
              <li><Link href="/terms" className="text-neutral-400 hover:text-white transition-colors">{t('termsOfService')}</Link></li>
              <li><Link href="/privacy" className="text-neutral-400 hover:text-white transition-colors">{t('privacyPolicy')}</Link></li>
              <li><Link href="/refund" className="text-neutral-400 hover:text-white transition-colors">{t('refundPolicy')}</Link></li>
            </ul>
          </div>
          
          {/* Download & Contact */}
          <div>
            <h3 className="font-medium text-lg mb-4">{t('contactUs')}</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-400 mt-1 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-neutral-400">Bharat Fasal, 123 Agri Tower, Delhi NCR, India - 110001</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-neutral-400">+91 98765 43210</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-neutral-400">contact@bharatfasal.in</span>
              </li>
            </ul>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">{t('language')} / भाषा</h4>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setLanguage('en')}
                  className={`px-4 py-2 border rounded text-sm hover:bg-neutral-700 transition-colors ${
                    language === 'en' ? 'border-primary-light text-primary-light' : 'border-neutral-600 text-neutral-400'
                  }`}
                >
                  English
                </button>
                <button 
                  onClick={() => setLanguage('hi')}
                  className={`px-4 py-2 border rounded text-sm hover:bg-neutral-700 transition-colors ${
                    language === 'hi' ? 'border-primary-light text-primary-light' : 'border-neutral-600 text-neutral-400'
                  }`}
                  lang="hi"
                >
                  हिंदी
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 mt-8 pt-6">
          <p className="text-center text-neutral-500 text-sm">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
