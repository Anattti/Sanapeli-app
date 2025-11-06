import { Word } from '@/types';

export const words: Word[] = [
  // Pakolliset retkeilyvälineet ja kodin tavarat
  { emoji: '🧴', en: 'towel', fi: 'pyyhe', weight: 1, article: 'a' },
  { emoji: '🗺️', en: 'map', fi: 'kartta', weight: 1, article: 'a' },
  { emoji: '☔', en: 'umbrella', fi: 'sateenvarjo', weight: 1, article: 'an' },
  { emoji: '🎒', en: 'backpack', fi: 'reppu', weight: 1, article: 'a' },
  { emoji: '🍴', en: 'fork', fi: 'haarukka', weight: 1, article: 'a' },
  { emoji: '🔪', en: 'knife', fi: 'veitsi', weight: 1, article: 'a' },
  { emoji: '🍽️', en: 'plate', fi: 'lautanen', weight: 1, article: 'a' },
  { emoji: '🥄', en: 'spoon', fi: 'lusikka', weight: 1, article: 'a' },
  { emoji: '☕', en: 'mug', fi: 'muki', weight: 1, article: 'a' },
  { emoji: '✂️', en: 'scissors', fi: 'sakset', weight: 1 }, // Monikko, ei artikkelia
  { emoji: '🔦', en: 'flashlight', fi: 'taskulamppu', weight: 1, article: 'a' },
  { emoji: '🛏️', en: 'sleeping bag', fi: 'makuupussi', weight: 1, article: 'a' },
  { emoji: '⛺', en: 'tent', fi: 'teltta', weight: 1, article: 'a' },
  { emoji: '🩹', en: 'first aid kit', fi: 'ensiapupakkaus', weight: 1, article: 'a' },
  { emoji: '🪓', en: 'axe', fi: 'kirves', weight: 1, article: 'an' },
  { emoji: '🕶️', en: 'sunglasses', fi: 'aurinkolasit', weight: 1 }, // Monikko, ei artikkelia
  
  // Lisäsanoja - Eläimet
  { emoji: '🐶', en: 'dog', fi: 'koira', weight: 1, article: 'a' },
  { emoji: '🐱', en: 'cat', fi: 'kissa', weight: 1, article: 'a' },
  { emoji: '🐦', en: 'bird', fi: 'lintu', weight: 1, article: 'a' },
  { emoji: '🐟', en: 'fish', fi: 'kala', weight: 1, article: 'a' },
  { emoji: '🐴', en: 'horse', fi: 'hevonen', weight: 1, article: 'a' },
  { emoji: '🐻', en: 'bear', fi: 'karhu', weight: 1, article: 'a' },
  
  // Ruoka
  { emoji: '🍎', en: 'apple', fi: 'omena', weight: 1, article: 'an' },
  { emoji: '🍌', en: 'banana', fi: 'banaani', weight: 1, article: 'a' },
  { emoji: '🍞', en: 'bread', fi: 'leipä', weight: 1 }, // Ei artikkelia (uncountable)
  { emoji: '🧀', en: 'cheese', fi: 'juusto', weight: 1 }, // Ei artikkelia (uncountable)
  { emoji: '🥛', en: 'milk', fi: 'maito', weight: 1 }, // Ei artikkelia (uncountable)
  
  // Luonto ja ympäristö
  { emoji: '🌳', en: 'tree', fi: 'puu', weight: 1, article: 'a' },
  { emoji: '🌸', en: 'flower', fi: 'kukka', weight: 1, article: 'a' },
  { emoji: '⛰️', en: 'mountain', fi: 'vuori', weight: 1, article: 'a' },
  { emoji: '🌊', en: 'water', fi: 'vesi', weight: 1 }, // Ei artikkelia (uncountable)
  { emoji: '☀️', en: 'sun', fi: 'aurinko', weight: 1 }, // "the sun" (ainutlaatuinen)
  { emoji: '🌙', en: 'moon', fi: 'kuu', weight: 1 }, // "the moon" (ainutlaatuinen)
  
  // Liikenne
  { emoji: '🚗', en: 'car', fi: 'auto', weight: 1, article: 'a' },
  { emoji: '🚲', en: 'bicycle', fi: 'polkupyörä', weight: 1, article: 'a' },
  { emoji: '✈️', en: 'plane', fi: 'lentokone', weight: 1, article: 'a' },
  { emoji: '🚂', en: 'train', fi: 'juna', weight: 1, article: 'a' },
  
  // Vaatteet
  { emoji: '👕', en: 'shirt', fi: 'paita', weight: 1, article: 'a' },
  { emoji: '👖', en: 'pants', fi: 'housut', weight: 1 }, // Monikko, ei artikkelia
  { emoji: '👟', en: 'shoes', fi: 'kengät', weight: 1 }, // Monikko, ei artikkelia
  { emoji: '🧢', en: 'cap', fi: 'lippalakki', weight: 1, article: 'a' },
  
  // Muuta
  { emoji: '🏠', en: 'house', fi: 'talo', weight: 1, article: 'a' },
  { emoji: '📱', en: 'phone', fi: 'puhelin', weight: 1, article: 'a' },
  { emoji: '📚', en: 'books', fi: 'kirjat', weight: 1 }, // Monikko, ei artikkelia
  { emoji: '⚽', en: 'ball', fi: 'pallo', weight: 1, article: 'a' },
];

