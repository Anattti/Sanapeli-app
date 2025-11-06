'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';
import Button from '@/components/Button';
import LanguageToggle from '@/components/LanguageToggle';
import PageTransition from '@/components/PageTransition';
import { getProgress, clearProgress, saveBestScore } from '@/utils/storage';
import { calculatePercentage, getFeedbackLevel, getFeedbackEmoji } from '@/utils/gameLogic';

export default function ResultsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const [progress, setProgress] = useState<{
    correctAnswers: number;
    incorrectAnswers: number;
    incorrectWords: string[];
  } | null>(null);
  
  useEffect(() => {
    const savedProgress = getProgress();
    if (savedProgress) {
      setProgress(savedProgress);
      // Tallenna paras tulos
      saveBestScore(savedProgress.correctAnswers);
    } else {
      // Jos ei ole tuloksia, palaa valikkoon
      router.push('/');
    }
  }, [router]);
  
  if (!progress) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-xl text-gray-600">Ladataan tuloksia...</p>
          </div>
        </div>
      </PageTransition>
    );
  }
  
  const total = progress.correctAnswers + progress.incorrectAnswers;
  const percentage = calculatePercentage(progress.correctAnswers, total);
  const feedbackLevel = getFeedbackLevel(percentage);
  const emoji = getFeedbackEmoji(percentage);
  
  const handlePlayAgain = () => {
    clearProgress();
    router.push('/play');
  };
  
  const handleBackToMenu = () => {
    clearProgress();
    router.push('/');
  };
  
  // Confetti-efekti yli 90% tulokselle (yksinkertainen versio)
  const showConfetti = percentage >= 90;
  
  return (
    <PageTransition>
      <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center relative">
        {/* Kielivalinta */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-10">
          <LanguageToggle variant="header" />
        </div>
        
        {/* Confetti-animaatio */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-3xl"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -50,
                  rotate: 0,
                }}
                animate={{
                  y: window.innerHeight + 50,
                  rotate: 360,
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: 'linear',
                }}
              >
                {['🎉', '🌟', '✨', '🎊', '🏆'][Math.floor(Math.random() * 5)]}
              </motion.div>
            ))}
          </div>
        )}
        
        <motion.div
          className="max-w-2xl w-full text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Otsikko */}
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-8">
            {t.results.title}
          </h1>
          
          {/* Emoji ja palaute */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: 'spring',
              stiffness: 200,
              damping: 10,
              delay: 0.2,
            }}
            className="mb-8"
          >
            <div className="text-8xl md:text-9xl mb-4">
              {emoji}
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-700 mb-2">
              {t.results.feedback[feedbackLevel]}
            </h2>
          </motion.div>
          
          {/* Pisteet */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-soft-lg p-8 mb-8"
          >
            <p className="text-lg text-gray-600 mb-2">{t.results.scoreLabel}</p>
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-5xl md:text-6xl font-bold text-gray-800">
                {progress.correctAnswers}
              </span>
              <span className="text-3xl text-gray-400">/</span>
              <span className="text-3xl text-gray-600">{total}</span>
            </div>
            
            {/* Prosentti */}
            <div className="text-3xl md:text-4xl font-bold mb-6">
              <span
                className={`${
                  percentage >= 90
                    ? 'text-green-600'
                    : percentage >= 70
                    ? 'text-blue-600'
                    : percentage >= 50
                    ? 'text-yellow-600'
                    : 'text-orange-600'
                }`}
              >
                {percentage}%
              </span>
            </div>
            
            {/* Oikeat ja väärät */}
            <div className="flex items-center justify-center gap-8 text-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <span className="font-semibold text-green-600">
                  {progress.correctAnswers}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">❌</span>
                <span className="font-semibold text-red-600">
                  {progress.incorrectAnswers}
                </span>
              </div>
            </div>
          </motion.div>
          
          {/* Napit */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col gap-4"
          >
            <Button
              onClick={handlePlayAgain}
              variant="success"
              size="large"
            >
              🎮 {t.results.playAgain}
            </Button>
            
            {progress.incorrectWords.length > 0 && (
              <Button
                onClick={() => {
                  // TODO: Implementoi harjoittelu väärinmenneillä sanoilla
                  clearProgress();
                  router.push('/practice');
                }}
                variant="primary"
                size="medium"
              >
                📚 {t.results.practiceWrong} ({progress.incorrectWords.length})
              </Button>
            )}
            
            <Button
              onClick={handleBackToMenu}
              variant="secondary"
              size="medium"
            >
              🏠 {t.results.backToMenu}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
}

