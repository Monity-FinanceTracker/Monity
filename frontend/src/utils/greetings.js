/**
 * Dynamic greetings system that varies by time of day and sentiment
 * The sentiment rotates daily (not on page refresh) using day of year
 */

// Morning Greetings (5:00 - 11:59)
const morningGreetings = [
    { sentiment: 'Joyful', greeting: 'Good morning, {name}! It\'s a great day!' },
    { sentiment: 'Calm', greeting: 'Peaceful morning to you, {name}.' },
    { sentiment: 'Hopeful', greeting: 'New day, new chances, {name}. Hello!' },
    { sentiment: 'Curious', greeting: 'What\'s up today, {name}? Good morning!' },
    { sentiment: 'Warm', greeting: 'Sending morning cheer, {name}!' },
    { sentiment: 'Formal', greeting: 'Good morning, {name}. Be productive.' },
    { sentiment: 'Relaxed', greeting: 'Slow morning, happy start, {name}.' },
    { sentiment: 'Energetic', greeting: 'Rise and shine, {name}! Let\'s go!' },
    { sentiment: 'Thoughtful', greeting: 'Be wise this morning, {name}.' },
    { sentiment: 'Playful', greeting: 'Hey, {name}! Wakey, wakey!' }
];

// Afternoon Greetings (12:00 - 17:59)
const afternoonGreetings = [
    { sentiment: 'Joyful', greeting: 'Happy afternoon, {name}! Woohoo!' },
    { sentiment: 'Calm', greeting: 'Afternoon peace be with you, {name}.' },
    { sentiment: 'Hopeful', greeting: 'Finish strong, {name}! Good afternoon.' },
    { sentiment: 'Curious', greeting: 'How\'s the day going, {name}?' },
    { sentiment: 'Warm', greeting: 'Warm afternoon hello, {name}!' },
    { sentiment: 'Formal', greeting: 'Salutations this afternoon, {name}.' },
    { sentiment: 'Relaxed', greeting: 'Chill time, {name}. Afternoon bliss.' },
    { sentiment: 'Energetic', greeting: 'Power through, {name}! You got this!' },
    { sentiment: 'Thoughtful', greeting: 'Remember your goal, {name}. Hello.' },
    { sentiment: 'Playful', greeting: 'Time for a snack, {name}! Hi!' }
];

// Night Greetings (18:00 - 23:59)
const nightGreetings = [
    { sentiment: 'Joyful', greeting: 'Dream big, {name}! Good night!' },
    { sentiment: 'Calm', greeting: 'Peaceful slumber tonight, {name}.' },
    { sentiment: 'Hopeful', greeting: 'Rest up for tomorrow, {name}!' },
    { sentiment: 'Curious', greeting: 'What did you achieve today, {name}?' },
    { sentiment: 'Warm', greeting: 'Cozy night thoughts, {name}.' },
    { sentiment: 'Formal', greeting: 'Wishing you a good rest, {name}.' },
    { sentiment: 'Relaxed', greeting: 'Unwind time, {name}. Good night.' },
    { sentiment: 'Energetic', greeting: 'Recharge quickly, {name}! See ya!' },
    { sentiment: 'Thoughtful', greeting: 'Reflect on your day, {name}.' },
    { sentiment: 'Playful', greeting: 'Don\'t let the bed bugs bite, {name}!' }
];

// Dawn / Late Night Greetings (00:00 - 04:59)
const dawnGreetings = [
    { sentiment: 'Joyful', greeting: 'Night owl greetings, {name}!' },
    { sentiment: 'Calm', greeting: 'Quiet hours peace, {name}.' },
    { sentiment: 'Hopeful', greeting: 'New dawn is coming, {name}. Hello.' },
    { sentiment: 'Curious', greeting: 'Still awake, {name}? What\'s up?' },
    { sentiment: 'Warm', greeting: 'Thinking of you, late night, {name}.' },
    { sentiment: 'Formal', greeting: 'Salutations at the turn, {name}.' },
    { sentiment: 'Relaxed', greeting: 'Enjoy the deep silence, {name}.' },
    { sentiment: 'Energetic', greeting: 'Late-night focus mode, {name}!' },
    { sentiment: 'Thoughtful', greeting: 'Clarity in the dark, {name}.' },
    { sentiment: 'Playful', greeting: 'Secret midnight hello, {name}!' }
];

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
 * @returns {string} Personalized greeting
 */
export const getDynamicGreeting = (userName = 'User') => {
    const timePeriod = getTimePeriod();
    const dayOfYear = getDayOfYear();
    
    // Use day of year modulo 10 to cycle through sentiments (0-9)
    const sentimentIndex = dayOfYear % 10;
    
    // Select appropriate greeting array based on time period
    let greetingsArray;
    switch (timePeriod) {
        case 'morning':
            greetingsArray = morningGreetings;
            break;
        case 'afternoon':
            greetingsArray = afternoonGreetings;
            break;
        case 'night':
            greetingsArray = nightGreetings;
            break;
        case 'dawn':
            greetingsArray = dawnGreetings;
            break;
        default:
            greetingsArray = morningGreetings;
    }
    
    // Get the greeting for today's sentiment
    const greetingObj = greetingsArray[sentimentIndex];
    
    // Replace {name} placeholder with actual user name
    return greetingObj.greeting.replace('{name}', userName);
};

/**
 * Get current sentiment for debugging/display purposes
 * @returns {string} Current sentiment
 */
export const getCurrentSentiment = () => {
    const sentiments = ['Joyful', 'Calm', 'Hopeful', 'Curious', 'Warm', 'Formal', 'Relaxed', 'Energetic', 'Thoughtful', 'Playful'];
    const dayOfYear = getDayOfYear();
    return sentiments[dayOfYear % 10];
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

