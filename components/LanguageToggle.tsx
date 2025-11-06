'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface LanguageToggleProps {
  variant?: 'header' | 'inline';
}

export default function LanguageToggle({ variant = 'header' }: LanguageToggleProps) {
  const { language, setLanguage, t } = useLanguage();
  
  const toggleLanguage = () => {
    setLanguage(language === 'fi' ? 'en' : 'fi');
  };
  
  const baseStyles = 'font-semibold rounded-xl shadow-soft transition-all duration-200';
  
  const variantStyles = {
    header: 'px-4 py-2 text-sm bg-white/80 hover:bg-white',
    inline: 'px-3 py-1.5 text-xs bg-white/60 hover:bg-white/80',
  };
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleLanguage}
      className={`${baseStyles} ${variantStyles[variant]}`}
      title={language === 'fi' ? 'Switch to English' : 'Vaihda suomeksi'}
    >
      {t.menu.switchLanguage}
    </motion.button>
  );
}

