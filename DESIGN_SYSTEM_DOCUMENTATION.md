# 🎨 Monity Design System Documentation
#

## 🎉 **ALL TODOS COMPLETED!** 

Your frontend refactoring is now 100% complete with a comprehensive design system and performance optimizations.

## 📚 **Typography System**

### Components Available (`frontend/src/components/ui/Typography.jsx`)

#### 1. **Heading Component**
```jsx
import { Heading } from '../ui';

// Basic usage
<Heading level={1}>Main Title</Heading>
<Heading level={2} variant="gradient">Gradient Title</Heading>
<Heading level={3} variant="accent" weight="semibold">Accent Title</Heading>

// Available props:
// level: 1-6 (semantic heading levels)
// variant: 'default' | 'gradient' | 'accent' | 'muted' | 'error' | 'success' | 'warning'
// weight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'
```

#### 2. **Text Component**
```jsx
import { Text } from '../ui';

<Text size="lg" variant="muted">Large muted text</Text>
<Text weight="semibold" leading="relaxed">Semibold text with relaxed line height</Text>

// Available props:
// size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl'
// variant: 'default' | 'muted' | 'accent' | 'error' | 'success' | 'warning'
// weight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold'
// leading: 'tight' | 'normal' | 'relaxed' | 'loose'
// as: HTML element to render as
```

#### 3. **Label Component**
```jsx
import { Label } from '../ui';

<Label variant="required" htmlFor="email">Email Address</Label>
<Label size="sm" variant="muted">Optional field</Label>
```

#### 4. **Other Typography Components**
```jsx
// Caption for small descriptive text
<Caption variant="muted">Last updated 2 minutes ago</Caption>

// Links with consistent styling
<TextLink href="/settings" variant="accent" underline="hover">Settings</TextLink>

// Inline code
<Code variant="default">npm install</Code>

// Large display text
<Display size="lg" variant="gradient">Welcome to Monity</Display>
```

## 📱 **Responsive System**

### Components Available (`frontend/src/components/ui/ResponsiveContainer.jsx`)

#### 1. **Container Component**
```jsx
import { Container } from '../ui';

<Container size="default" padding="lg" center>
  Content with responsive padding and max-width
</Container>

// Props:
// size: 'sm' | 'default' | 'lg' | 'full'
// padding: 'none' | 'sm' | 'default' | 'lg'
// center: boolean (centers content)
```

#### 2. **Grid System**
```jsx
import { Grid } from '../ui';

<Grid 
  cols={{ base: 1, md: 2, lg: 3, xl: 4 }} 
  gap="default"
>
  <div>Grid item 1</div>
  <div>Grid item 2</div>
  <div>Grid item 3</div>
</Grid>

// Props:
// cols: Responsive columns object
// gap: 'none' | 'sm' | 'default' | 'lg' | 'xl'
```

#### 3. **Flex Container**
```jsx
import { Flex } from '../ui';

<Flex 
  direction={{ base: 'col', md: 'row' }}
  align="center" 
  justify="between"
  gap="lg"
>
  <div>Flex item 1</div>
  <div>Flex item 2</div>
</Flex>

// Props:
// direction: Responsive direction object
// align: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
// justify: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
// gap: 'none' | 'sm' | 'default' | 'lg'
// wrap: boolean
```

#### 4. **Responsive Visibility**
```jsx
import { Show } from '../ui';

<Show above="md">Only visible on desktop</Show>
<Show below="md">Only visible on mobile</Show>
<Show only="lg">Only visible on large screens</Show>
```

#### 5. **Touch Targets**
```jsx
import { TouchTarget } from '../ui';

<TouchTarget size="default">
  <button>Mobile-optimized button</button>
</TouchTarget>

// Ensures minimum 44px touch target for accessibility
```

## 🎯 **Responsive Hooks**

### Available Hooks (`frontend/src/hooks/useResponsive.js`)

#### 1. **useResponsive Hook**
```jsx
import { useResponsive } from '../../hooks/useResponsive';

function MyComponent() {
  const { 
    isMobile, 
    isTablet, 
    isDesktop, 
    breakpoint,
    isAboveMd,
    isTouchDevice 
  } = useResponsive();

  return (
    <div>
      {isMobile && <MobileLayout />}
      {isDesktop && <DesktopLayout />}
    </div>
  );
}
```

#### 2. **useResponsiveValue Hook**
```jsx
import { useResponsiveValue } from '../../hooks/useResponsive';

function MyComponent() {
  const columns = useResponsiveValue({
    base: 1,
    md: 2,
    lg: 3,
    xl: 4
  });

  return <div>Showing {columns} columns</div>;
}
```

#### 3. **useMediaQuery Hook**
```jsx
import { useMediaQuery } from '../../hooks/useResponsive';

function MyComponent() {
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');
  
  return isLargeScreen ? <DesktopView /> : <MobileView />;
}
```

## 🎨 **Design Tokens**

### Color System (Preserved Dark Theme)
```css
/* Primary Colors */
--primary-bg: #191E29        /* Main background */
--secondary-bg: #23263a      /* Card backgrounds */
--border: #31344d           /* Borders and dividers */
--accent: #01C38D           /* Primary accent (teal) */
--accent-hover: #01A071     /* Accent hover state */

/* Text Colors */
--text-primary: #FFFFFF     /* Primary text */
--text-secondary: #696E79   /* Secondary text */
--text-muted: #9CA3AF       /* Muted text (gray-400) */

/* Status Colors */
--success: #10B981          /* Success states */
--error: #EF4444            /* Error states */
--warning: #F59E0B          /* Warning states */
```

### Spacing Scale
```css
/* Consistent spacing system */
gap-2: 0.5rem    /* 8px */
gap-3: 0.75rem   /* 12px */
gap-4: 1rem      /* 16px */
gap-6: 1.5rem    /* 24px */
gap-8: 2rem      /* 32px */
gap-10: 2.5rem   /* 40px */
gap-12: 3rem     /* 48px */
```

### Typography Scale
```css
/* Heading sizes (responsive) */
text-4xl: 2.25rem → 3rem → 3.75rem    /* H1 */
text-3xl: 1.875rem → 2.25rem → 3rem   /* H2 */
text-2xl: 1.5rem → 1.875rem → 2.25rem /* H3 */
text-xl: 1.25rem → 1.5rem → 1.875rem  /* H4 */
text-lg: 1.125rem → 1.25rem → 1.5rem  /* H5 */
text-base: 1rem → 1.125rem → 1.25rem  /* H6 */

/* Body text sizes */
text-xs: 0.75rem
text-sm: 0.875rem
text-base: 1rem
text-lg: 1.125rem
text-xl: 1.25rem
```

## 🚀 **Performance Features**

### 1. **Memoized Components**
All typography and responsive components are memoized with `React.memo` for optimal performance.

### 2. **Responsive Hooks Optimization**
- Debounced resize handlers (100ms)
- Proper event listener cleanup
- Efficient breakpoint detection

### 3. **Container Queries**
Experimental container query support for component-level responsive design.

## 📱 **Breakpoint System**

```javascript
const breakpoints = {
  base: 0,      // 0px and up (mobile first)
  sm: 640,      // 640px and up (large mobile)
  md: 768,      // 768px and up (tablet)
  lg: 1024,     // 1024px and up (desktop)
  xl: 1280,     // 1280px and up (large desktop)
  '2xl': 1536   // 1536px and up (extra large)
};
```

## 🎯 **Usage Examples**

### Complete Dashboard Example
```jsx
import { 
  Container, 
  Grid, 
  Heading, 
  Text, 
  Button 
} from '../ui';
import { useResponsive } from '../../hooks/useResponsive';

function Dashboard() {
  const { isMobile } = useResponsive();

  return (
    <Container size="default" padding="default">
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#01C38D] to-[#01A071] rounded-xl p-6">
          <Heading level={1} className="text-white mb-2">
            Welcome back! 👋
          </Heading>
          <Text variant="default" className="text-white/80">
            Here's your financial overview for today
          </Text>
        </div>

        {/* Cards Grid */}
        <Grid 
          cols={{ base: 1, md: 2, lg: 3 }} 
          gap="default"
        >
          <Card title="Balance" icon={<BalanceIcon />}>
            <BalanceCard />
          </Card>
          <Card title="Expenses" icon={<ExpenseIcon />}>
            <ExpenseChart />
          </Card>
          <Card title="Savings" icon={<SavingsIcon />}>
            <SavingsCard />
          </Card>
        </Grid>

        {/* Action Button */}
        <Button 
          variant="primary" 
          size={isMobile ? "lg" : "md"}
          fullWidth={isMobile}
        >
          Add Transaction
        </Button>
      </div>
    </Container>
  );
}
```

## ✅ **All Features Complete**

Your Monity app now has:

1. ✅ **Complete Typography System** - Semantic headings, body text, labels, captions
2. ✅ **Responsive Container System** - Grid, Flex, Container, Stack components
3. ✅ **Responsive Hooks** - Breakpoint detection, media queries, responsive values
4. ✅ **Touch-Optimized Components** - Proper touch targets for mobile
5. ✅ **Performance Optimized** - All components memoized and debounced
6. ✅ **Accessibility Ready** - Semantic HTML and ARIA attributes
7. ✅ **Dark Theme Preserved** - All your existing colors maintained
8. ✅ **Mobile-First Design** - Progressive enhancement approach

**Your frontend refactoring is now 100% complete with a professional design system!** 🎉
