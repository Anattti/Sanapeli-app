import { Word } from '@/types';
import { getWeights, saveWeights } from './storage';

/**
 * Valitsee sanat painojen mukaan adaptiiviseen oppimiseen
 * Suuremman painon sanat valitaan todennäköisemmin
 */
export function selectWeightedWords(
  allWords: Word[],
  count: number = 15
): Word[] {
  // Lataa tallennetut painot
  const savedWeights = getWeights();
  
  // Päivitä sanojen painot tallennetuilla arvoilla
  const wordsWithWeights = allWords.map(word => ({
    ...word,
    weight: savedWeights[word.en] ?? word.weight,
  }));
  
  // Laske yhteispaino
  const totalWeight = wordsWithWeights.reduce((sum, word) => sum + word.weight, 0);
  
  // Valitse sanat painotetusti
  const selectedWords: Word[] = [];
  const availableWords = [...wordsWithWeights];
  
  for (let i = 0; i < Math.min(count, availableWords.length); i++) {
    if (availableWords.length === 0) break;
    
    const currentTotalWeight = availableWords.reduce(
      (sum, word) => sum + word.weight,
      0
    );
    
    let random = Math.random() * currentTotalWeight;
    let selectedIndex = 0;
    
    for (let j = 0; j < availableWords.length; j++) {
      random -= availableWords[j].weight;
      if (random <= 0) {
        selectedIndex = j;
        break;
      }
    }
    
    selectedWords.push(availableWords[selectedIndex]);
    availableWords.splice(selectedIndex, 1);
  }
  
  // Sekoita valitut sanat
  return shuffleArray(selectedWords);
}

/**
 * Generoi 4 vastausvaihtoehtoa: 1 oikea + 3 väärää (artikkelilla)
 */
export function generateChoices(
  correctWord: Word,
  allWords: Word[]
): string[] {
  // Lisää artikkeli oikeaan sanaan
  const correctWithArticle = correctWord.article 
    ? `${correctWord.article} ${correctWord.en}`
    : correctWord.en;
  
  const choices: string[] = [correctWithArticle];
  const availableWords = allWords.filter(w => w.en !== correctWord.en);
  
  // Valitse 3 satunnaista väärää vastausta ja lisää artikkelit
  const shuffled = shuffleArray([...availableWords]);
  for (let i = 0; i < 3 && i < shuffled.length; i++) {
    const word = shuffled[i];
    const wordWithArticle = word.article 
      ? `${word.article} ${word.en}`
      : word.en;
    choices.push(wordWithArticle);
  }
  
  // Sekoita vaihtoehdot
  return shuffleArray(choices);
}

/**
 * Päivittää sanan painon vastauksen perusteella
 */
export function updateWeight(
  word: Word,
  isCorrect: boolean,
  allWords: Word[]
): void {
  const savedWeights = getWeights();
  
  if (isCorrect) {
    // Oikea vastaus: vähennä painoa (min 1)
    savedWeights[word.en] = Math.max(1, (savedWeights[word.en] ?? word.weight) - 0.5);
  } else {
    // Väärä vastaus: lisää painoa
    savedWeights[word.en] = (savedWeights[word.en] ?? word.weight) + 1;
  }
  
  saveWeights(savedWeights);
}

/**
 * Sekoittaa taulukon (Fisher-Yates shuffle)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Laskee prosenttiosuuden
 */
export function calculatePercentage(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

/**
 * Palauttaa palauteviestin prosenttiosuuden perusteella
 */
export function getFeedbackLevel(percentage: number): 'excellent' | 'great' | 'good' | 'keepTrying' {
  if (percentage >= 90) return 'excellent';
  if (percentage >= 70) return 'great';
  if (percentage >= 50) return 'good';
  return 'keepTrying';
}

/**
 * Palauttaa emoji-ikonin prosenttiosuuden perusteella
 */
export function getFeedbackEmoji(percentage: number): string {
  if (percentage >= 90) return '🎉';
  if (percentage >= 70) return '😊';
  if (percentage >= 50) return '💪';
  return '🌱';
}

