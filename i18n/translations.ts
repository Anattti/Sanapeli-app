import { Translations, Language } from '@/types';

export const translations: Record<Language, Translations> = {
  fi: {
    menu: {
      title: 'Opi englantia emojeilla!',
      subtitle: 'Hauska tapa oppia sanastoa',
      practice: 'Harjoittele',
      play: 'Pelaa',
      switchLanguage: 'EN',
    },
    practice: {
      title: 'Harjoittelu',
      backToMenu: 'Takaisin valikkoon',
      clickToReveal: 'Klikkaa nähdäksesi sanan',
    },
    play: {
      correct: 'Oikein! 🎉',
      incorrect: 'Väärin! Yritä uudelleen 💪',
      score: 'Pisteet',
      progress: 'Edistyminen',
    },
    results: {
      title: 'Tulokset',
      scoreLabel: 'Pisteesi',
      feedback: {
        excellent: 'Mahtavaa!',
        great: 'Hyvä työ!',
        good: 'Jatka harjoittelua!',
        keepTrying: 'Opit koko ajan!',
      },
      playAgain: 'Pelaa uudestaan',
      practiceWrong: 'Harjoittele väärinmenneitä',
      backToMenu: 'Takaisin valikkoon',
    },
  },
  en: {
    menu: {
      title: 'Learn English with Emojis!',
      subtitle: 'Fun way to learn vocabulary',
      practice: 'Practice',
      play: 'Play',
      switchLanguage: 'FI',
    },
    practice: {
      title: 'Practice Mode',
      backToMenu: 'Back to Menu',
      clickToReveal: 'Click to reveal the word',
    },
    play: {
      correct: 'Correct! 🎉',
      incorrect: 'Wrong! Try again 💪',
      score: 'Score',
      progress: 'Progress',
    },
    results: {
      title: 'Results',
      scoreLabel: 'Your Score',
      feedback: {
        excellent: 'Amazing!',
        great: 'Great job!',
        good: 'Keep practicing!',
        keepTrying: "You're learning!",
      },
      playAgain: 'Play Again',
      practiceWrong: 'Practice Wrong Answers',
      backToMenu: 'Back to Menu',
    },
  },
};

