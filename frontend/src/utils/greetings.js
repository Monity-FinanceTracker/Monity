/**
 * Dynamic greetings system that varies by time of day and sentiment
 * The sentiment rotates daily (not on page refresh) using day of year
 */

// Sentiment keys for translation lookup
const sentiments = ['joyful', 'calm', 'hopeful', 'curious', 'warm', 'formal', 'relaxed', 'energetic', 'thoughtful', 'playful'];

/**
 * Get day of year (0-365) to determine which sentiment to use
 * This ensures the sentiment stays the same throughout the entire day
 */
const getDayOfYear = (date = new Date()) => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
};

/**
 * Get time period based on current hour
 * @returns {'morning' | 'afternoon' | 'night' | 'dawn'}
 */
const getTimePeriod = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 24) return 'night';
    return 'dawn'; // 00:00 - 04:59
};

/**
 * Get greeting based on time of day and user name
 * The sentiment rotates daily based on day of year (0-9 cycle)
 * @param {string} userName - User's name to include in greeting
 * @param {Function} t - Translation function from react-i18next
 * @returns {string} Personalized greeting
 */
export const getDynamicGreeting = (userName = 'User', t = null) => {
    const timePeriod = getTimePeriod();
    const dayOfYear = getDayOfYear();
    
    // Use day of year modulo 10 to cycle through sentiments (0-9)
    const sentimentIndex = dayOfYear % 10;
    const sentiment = sentiments[sentimentIndex];
    
    // If translation function is provided, use translations
    if (t) {
        const translationKey = `greetings.${timePeriod}.${sentiment}`;
        const greeting = t(translationKey, { name: userName });
        return greeting;
    }
    
    // Fallback to English if no translation function provided
    const fallbackGreetings = {
        morning: {
            joyful: 'Good morning, {name}! It\'s a great day!',
            calm: 'Peaceful morning to you, {name}',
            hopeful: 'New day, new chances, {name}. Hello',
            curious: 'What\'s up today, {name}? Good morning!',
            warm: 'Sending morning cheer, {name}',
            formal: 'Good morning, {name}. Be productive.',
            relaxed: 'Slow morning, happy start, {name}',
            energetic: 'Rise and shine, {name}. Let\'s go',
            thoughtful: 'Be wise this morning, {name}',
            playful: 'Hey, {name}! Wakey, wakey!'
        },
        afternoon: {
            joyful: 'Happy afternoon, {name}! Woohoo!',
            calm: 'Afternoon peace be with you, {name}',
            hopeful: 'Finish strong, {name}! Good afternoon',
            curious: 'How\'s the day going, {name}?',
            warm: 'Warm afternoon hello, {name}',
            formal: 'Salutations this afternoon, {name}',
            relaxed: 'Chill time, {name} Afternoon bliss',
            energetic: 'Power through, {name}. You got this',
            thoughtful: 'Remember your goal, {name}. Hello',
            playful: 'Time for a snack, {name}. Hi'
        },
        night: {
            joyful: 'Dream big, {name}. Good night!',
            calm: 'Peaceful slumber tonight, {name}',
            hopeful: 'Rest up for tomorrow, {name}',
            curious: 'What did you achieve today, {name}?',
            warm: 'Cozy night thoughts, {name}',
            formal: 'Wishing you a good rest, {name}',
            relaxed: 'Unwind time, {name}. Good night',
            energetic: 'Recharge quickly, {name}. See ya',
            thoughtful: 'Reflect on your day, {name}',
            playful: 'Don\'t let the bed bugs bite, {name}!'
        },
        dawn: {
            joyful: 'Night owl greetings, {name}',
            calm: 'Quiet hours peace, {name}',
            hopeful: 'New dawn is coming, {name}',
            curious: 'Still awake, {name}? What\'s up?',
            warm: 'Thinking of you, late night, {name}',
            formal: 'Salutations at the turn, {name}',
            relaxed: 'Enjoy the deep silence, {name}',
            energetic: 'Late-night focus mode, {name}',
            thoughtful: 'Clarity in the dark, {name}',
            playful: 'Secret midnight hello, {name}'
        }
    };
    
    const greeting = fallbackGreetings[timePeriod]?.[sentiment] || fallbackGreetings.morning.joyful;
    return greeting.replace('{name}', userName);
};

/**
 * Get current sentiment for debugging/display purposes
 * @returns {string} Current sentiment
 */
export const getCurrentSentiment = () => {
    const sentimentLabels = ['Joyful', 'Calm', 'Hopeful', 'Curious', 'Warm', 'Formal', 'Relaxed', 'Energetic', 'Thoughtful', 'Playful'];
    const dayOfYear = getDayOfYear();
    return sentimentLabels[dayOfYear % 10];
};

/**
 * Get time period emoji for visual enhancement
 * @returns {string} Emoji representing current time period
 */
export const getTimePeriodEmoji = () => {
    const timePeriod = getTimePeriod();
    switch (timePeriod) {
        case 'morning':
            return '☀️';
        case 'afternoon':
            return '🌻';
        case 'night':
            return '🌙';
        case 'dawn':
            return '🌠';
        default:
            return '☀️';
    }
};

