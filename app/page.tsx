'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import Button from '@/components/Button';
import LanguageToggle from '@/components/LanguageToggle';
import PageTransition from '@/components/PageTransition';

export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };
  
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
        {/* Kielivalinta oikeassa yläkulmassa */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-10">
          <LanguageToggle variant="header" />
        </div>
        
        <motion.main
          className="flex flex-col items-center justify-center max-w-2xl w-full text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Otsikko */}
          <motion.div variants={itemVariants} className="mb-6">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
              {t.menu.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              {t.menu.subtitle}
            </p>
          </motion.div>
          
          {/* Emoji-banneri */}
          <motion.div
            variants={itemVariants}
            className="text-6xl md:text-8xl mb-12 flex gap-4"
          >
            <motion.span
              animate={{
                rotate: [0, 10, -10, 10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            >
              📚
            </motion.span>
            <motion.span
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            >
              🎮
            </motion.span>
            <motion.span
              animate={{
                rotate: [0, -10, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            >
              🌟
            </motion.span>
          </motion.div>
          
          {/* Napit */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-4 w-full max-w-md"
          >
            <Button
              onClick={() => router.push('/practice')}
              variant="primary"
              size="large"
            >
              🧠 {t.menu.practice}
            </Button>
            
            <Button
              onClick={() => router.push('/play')}
              variant="secondary"
              size="large"
            >
              🎮 {t.menu.play}
            </Button>
          </motion.div>
        </motion.main>
      </div>
    </PageTransition>
  );
}
