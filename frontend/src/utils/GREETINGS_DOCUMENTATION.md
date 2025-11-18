# 🌟 Dynamic Greetings System Documentation

## Overview
The Dynamic Greetings System provides personalized, time-aware greetings that change based on the time of day and rotate through different sentiments daily. This creates a more engaging and human-like user experience.

## Features

### ⏰ Time-Based Greetings
Greetings automatically adjust based on four time periods:

- **🌠 Dawn / Late Night** (00:00 - 04:59)
- **☀️ Morning** (05:00 - 11:59)
- **🌻 Afternoon** (12:00 - 17:59)
- **🌙 Night** (18:00 - 23:59)

### 💝 Sentiment Rotation
The system cycles through 10 different sentiments/feelings:

1. **Joyful** - Enthusiastic and cheerful
2. **Calm** - Peaceful and serene
3. **Hopeful** - Optimistic and encouraging
4. **Curious** - Inquisitive and engaging
5. **Warm** - Friendly and caring
6. **Formal** - Professional and respectful
7. **Relaxed** - Casual and easygoing
8. **Energetic** - Dynamic and motivating
9. **Thoughtful** - Reflective and wise
10. **Playful** - Fun and lighthearted

### 🎯 Key Characteristics

1. **Consistent Throughout the Day**: The sentiment stays the same for the entire day (not just per session)
2. **User-Personalized**: All greetings include the user's name
3. **Daily Rotation**: Sentiment changes based on the day of the year (365-day cycle)
4. **No Randomness**: Uses day-of-year algorithm for predictability

## Usage

### Basic Usage

```javascript
import { getDynamicGreeting } from '../utils/greetings';

// Get greeting with user's name
const greeting = getDynamicGreeting('Alice');
// Example output: "Top of the morning to you, Alice! What an exciting day ahead!"
```

### Get Current Sentiment

```javascript
import { getCurrentSentiment } from '../utils/greetings';

const sentiment = getCurrentSentiment();
// Returns: "Joyful", "Calm", "Hopeful", etc.
```

### Get Time Period Emoji

```javascript
import { getTimePeriodEmoji } from '../utils/greetings';

const emoji = getTimePeriodEmoji();
// Returns: "☀️", "🌻", "🌙", or "🌠"
```

## Implementation Examples

### Dashboard Component

```javascript
import { getDynamicGreeting } from '../../utils/greetings';
import { useAuth } from '../../context/useAuth';

const Dashboard = () => {
    const { user } = useAuth();
    const userName = user?.user_metadata?.name || 'User';
    const greeting = getDynamicGreeting(userName);
    
    return (
        <h1>{greeting}</h1>
    );
};
```

## Example Greetings by Time Period

### Morning Greetings (☀️)
- **Joyful**: "Top of the morning to you, {name}! What an exciting day ahead!"
- **Calm**: "May your morning be filled with peace and clarity, {name}. Good morning."
- **Energetic**: "Let's go, {name}! Attack this day with enthusiasm and power!"

### Afternoon Greetings (🌻)
- **Joyful**: "Woohoo, {name}! The sun is shining and so are you! Happy afternoon!"
- **Thoughtful**: "Take a breath, {name}. Remember why you started this morning. Good afternoon."
- **Playful**: "Halfway there, {name}! Did someone say snack time? Hello!"

### Night Greetings (🌙)
- **Calm**: "May your mind and body find deep peace tonight, {name}. Sleep well."
- **Hopeful**: "Rest up, {name}. May tomorrow be a fresh start filled with wonderful possibilities."
- **Warm**: "Good night, {name}. Sending you cozy thoughts and a peaceful slumber."

### Dawn Greetings (🌠)
- **Curious**: "What deep thoughts keep you company at this hour, {name}? Greetings!"
- **Energetic**: "Still going strong, {name}! Let the pre-dawn energy fuel your productivity!"
- **Playful**: "Psst, {name}... The moon and the stars send their secret hello!"

## Algorithm Details

### Day-to-Sentiment Mapping
The system uses a simple modulo operation to map days to sentiments:

```javascript
dayOfYear % 10 = sentimentIndex (0-9)
```

This means:
- Day 1, 11, 21, 31... → Sentiment 0 (Joyful)
- Day 2, 12, 22, 32... → Sentiment 1 (Calm)
- Day 3, 13, 23, 33... → Sentiment 2 (Hopeful)
- And so on...

### Time Period Determination
```javascript
Hour 0-4   → Dawn
Hour 5-11  → Morning
Hour 12-17 → Afternoon
Hour 18-23 → Night
```

## Benefits

1. **Enhanced User Experience**: Personalized greetings make users feel welcomed
2. **Variety**: 40 different greetings (10 sentiments × 4 time periods)
3. **Consistency**: Same greeting throughout the day prevents confusion
4. **Predictability**: No random behavior, easier to test and debug
5. **Cultural Awareness**: Different greetings for different times of day

## Testing

Run the tests to verify functionality:

```bash
npm test -- greetings.test.js
```

## Future Enhancements

Possible improvements:
- Multi-language support
- Seasonal variations
- User preference for sentiment types
- Integration with user's timezone
- Custom greetings for special dates (birthdays, holidays)

---

**Last Updated**: November 17, 2025  
**Maintained By**: Monity Development Team



