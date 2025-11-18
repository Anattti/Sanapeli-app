'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import PageTransition from '@/components/PageTransition';

export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.15,
        delayChildren: shouldReduceMotion ? 0 : 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: { y: shouldReduceMotion ? 0 : 50, opacity: 0, scale: shouldReduceMotion ? 1 : 0.8 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { type: 'spring' as const, stiffness: 100, damping: 12 },
    },
    hover: {
      y: shouldReduceMotion ? 0 : -10,
      scale: shouldReduceMotion ? 1 : 1.05,
      boxShadow: '0 20px 30px rgba(0,0,0,0.15)',
      transition: { type: 'spring' as const, stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.95 }
  };

  const menuItems = [
    {
      id: 'practice',
      title: t.menu.practice,
      icon: '🧠',
      color: 'from-blue-400 to-cyan-300',
      path: '/practice',
      delay: 0
    },
    {
      id: 'play',
      title: t.menu.play,
      icon: '🎮',
      color: 'from-purple-400 to-pink-400',
      path: '/play',
      delay: 0.1
    },
    {
      id: 'streak',
      title: t.menu.streak,
      icon: '🔥',
      color: 'from-orange-400 to-red-400',
      path: '/streak',
      delay: 0.2
    },
    {
      id: 'challenge',
      title: t.menu.challenge,
      icon: '🏆',
      color: 'from-yellow-400 to-amber-500',
      path: '/challenge',
      delay: 0.3
    }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-8">

        {/* Animated Background Elements - Hidden on mobile, static if reduced motion */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
          {!shouldReduceMotion && (
            <>
              <motion.div
                className="absolute top-20 left-10 text-6xl opacity-20"
                animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              >
                ☁️
              </motion.div>
              <motion.div
                className="absolute top-40 right-20 text-8xl opacity-20"
                animate={{ y: [0, -50, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                ☁️
              </motion.div>
              <motion.div
                className="absolute bottom-20 left-1/4 text-5xl opacity-20"
                animate={{ y: [0, -20, 0], x: [0, 20, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              >
                ✨
              </motion.div>
            </>
          )}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-5"></div>
        </div>

        {/* Header Actions */}
        <div className="absolute top-6 right-6 z-20">
          <LanguageToggle variant="header" />
        </div>

        <motion.main
          className="relative z-10 w-full max-w-4xl flex flex-col items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Section */}
          <div className="text-center mb-12 relative">
            <motion.div
              initial={{ scale: 0, rotate: shouldReduceMotion ? 0 : -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="inline-block mb-4"
            >
              <span className={`text-8xl md:text-9xl filter drop-shadow-xl cursor-pointer hover:scale-110 transition-transform duration-300 ${!shouldReduceMotion ? 'animate-float' : ''}`}>
                🦁
              </span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-4 text-outline tracking-tight"
              variants={{
                hidden: { y: shouldReduceMotion ? 0 : 20, opacity: 0 },
                visible: { y: 0, opacity: 1 }
              }}
            >
              {t.menu.title}
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-gray-600 font-medium max-w-lg mx-auto glass-panel py-2 px-6 rounded-full"
              variants={{
                hidden: { y: shouldReduceMotion ? 0 : 20, opacity: 0 },
                visible: { y: 0, opacity: 1 }
              }}
            >
              {t.menu.subtitle}
            </motion.p>
          </div>

          {/* Game Menu Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl px-4"
            variants={{
              visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.1 } }
            }}
          >
            {menuItems.map((item) => (
              <motion.div
                key={item.id}
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => router.push(item.path)}
                className={`
                  relative overflow-hidden rounded-3xl cursor-pointer
                  bg-white shadow-xl border-4 border-white
                  group h-40 md:h-48 flex items-center justify-between px-8
                  transition-colors duration-300
                `}
              >
                {/* Card Background Gradient */}
                <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${item.color} group-hover:opacity-20 transition-opacity duration-300`} />

                {/* Content */}
                <div className="flex flex-col items-start z-10">
                  <span className="text-2xl font-bold text-gray-800 mb-1 group-hover:text-purple-600 transition-colors">
                    {item.title}
                  </span>
                  <span className="text-sm font-medium text-gray-500 bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm">
                    Start Adventure
                  </span>
                </div>

                {/* Icon */}
                <div className="text-6xl md:text-7xl filter drop-shadow-lg transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                  {item.icon}
                </div>

                {/* Decorative Circle */}
                <div className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br ${item.color} opacity-20 blur-2xl group-hover:opacity-30 transition-all duration-500`} />
              </motion.div>
            ))}
          </motion.div>
        </motion.main>

        {/* Footer Decoration */}
        <motion.div
          className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-white/50 to-transparent pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        />
      </div>
    </PageTransition>
  );
}
