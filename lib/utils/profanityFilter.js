// Basic profanity filter - can be enhanced later
const PROFANITY_WORDS = [
  'spam', 'scam', 'fake', 'bullshit', 'crap', 'stupid', 'idiot',
  'moron', 'dumb', 'suck', 'hate', 'kill', 'die', 'damn', 'hell'
];

/**
 * Check if text contains profanity
 * @param {string} text - Text to check
 * @returns {object} - { hasProfanity: boolean, flaggedWords: string[] }
 */
function checkProfanity(text) {
  if (!text || typeof text !== 'string') {
    return { hasProfanity: false, flaggedWords: [] };
  }

  const lowerText = text.toLowerCase();
  const flaggedWords = [];

  PROFANITY_WORDS.forEach(word => {
    if (lowerText.includes(word)) {
      flaggedWords.push(word);
    }
  });

  return {
    hasProfanity: flaggedWords.length > 0,
    flaggedWords
  };
}

/**
 * Filter profanity from text (replace with asterisks)
 * @param {string} text - Text to filter
 * @returns {string} - Filtered text
 */
function filterProfanity(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let filteredText = text;
  
  PROFANITY_WORDS.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filteredText = filteredText.replace(regex, '*'.repeat(word.length));
  });

  return filteredText;
}

module.exports = {
  checkProfanity,
  filterProfanity
};
