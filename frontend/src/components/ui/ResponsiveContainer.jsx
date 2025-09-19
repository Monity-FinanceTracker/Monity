import React, { memo } from 'react';

/**
 * Responsive Container System
 * Provides consistent responsive behavior across the application
 * Mobile-first approach with optimized breakpoints
 */

// Main container with responsive padding and max-width
export const Container = memo(({ 
  children, 
  className = '', 
  size = 'default',
  padding = 'default',
  center = true,
  ...props 
}) => {
  const sizes = {
    sm: 'max-w-3xl',
    default: 'max-w-7xl',
    lg: 'max-w-8xl',
    full: 'max-w-full'
  };

  const paddings = {
    none: '',
    sm: 'px-4 sm:px-6',
    default: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-6 sm:px-8 lg:px-12'
  };

  const centerClass = center ? 'mx-auto' : '';
  const classes = `${sizes[size]} ${paddings[padding]} ${centerClass} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
});

// Responsive grid system
export const Grid = memo(({ 
  children, 
  className = '', 
  cols = { base: 1, md: 2, lg: 3 },
  gap = 'default',
  ...props 
}) => {
  const gaps = {
    none: 'gap-0',
    sm: 'gap-2 sm:gap-3',
    default: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
    xl: 'gap-8 sm:gap-10'
  };

  // Build responsive grid classes
  const gridCols = `grid-cols-${cols.base}`;
  const smCols = cols.sm ? `sm:grid-cols-${cols.sm}` : '';
  const mdCols = cols.md ? `md:grid-cols-${cols.md}` : '';
  const lgCols = cols.lg ? `lg:grid-cols-${cols.lg}` : '';
  const xlCols = cols.xl ? `xl:grid-cols-${cols.xl}` : '';

  const classes = `grid ${gridCols} ${smCols} ${mdCols} ${lgCols} ${xlCols} ${gaps[gap]} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
});

// Responsive flex container
export const Flex = memo(({ 
  children, 
  className = '', 
  direction = { base: 'col', md: 'row' },
  align = 'start',
  justify = 'start',
  gap = 'default',
  wrap = false,
  ...props 
}) => {
  const directions = {
    row: 'flex-row',
    col: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse'
  };

  const alignments = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline'
  };

  const justifications = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const gaps = {
    none: 'gap-0',
    sm: 'gap-2 sm:gap-3',
    default: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8'
  };

  // Build responsive direction classes
  const baseDirection = directions[direction.base] || directions[direction];
  const smDirection = direction.sm ? `sm:${directions[direction.sm]}` : '';
  const mdDirection = direction.md ? `md:${directions[direction.md]}` : '';
  const lgDirection = direction.lg ? `lg:${directions[direction.lg]}` : '';

  const wrapClass = wrap ? 'flex-wrap' : '';
  const classes = `flex ${baseDirection} ${smDirection} ${mdDirection} ${lgDirection} ${alignments[align]} ${justifications[justify]} ${gaps[gap]} ${wrapClass} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
});

// Responsive spacing component
export const Stack = memo(({ 
  children, 
  className = '', 
  space = 'default',
  direction = 'vertical',
  ...props 
}) => {
  const spaces = {
    none: 'space-y-0',
    sm: direction === 'vertical' ? 'space-y-2 sm:space-y-3' : 'space-x-2 sm:space-x-3',
    default: direction === 'vertical' ? 'space-y-4 sm:space-y-6' : 'space-x-4 sm:space-x-6',
    lg: direction === 'vertical' ? 'space-y-6 sm:space-y-8' : 'space-x-6 sm:space-x-8',
    xl: direction === 'vertical' ? 'space-y-8 sm:space-y-10' : 'space-x-8 sm:space-x-10'
  };

  const directionClass = direction === 'vertical' ? 'flex flex-col' : 'flex flex-row';
  const classes = `${directionClass} ${spaces[space]} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
});

// Responsive visibility utilities
export const Show = memo(({ 
  children, 
  above, 
  below, 
  only,
  className = '',
  ...props 
}) => {
  let classes = className;

  if (above) {
    const breakpoints = {
      sm: 'hidden sm:block',
      md: 'hidden md:block',
      lg: 'hidden lg:block',
      xl: 'hidden xl:block'
    };
    classes += ` ${breakpoints[above]}`;
  }

  if (below) {
    const breakpoints = {
      sm: 'block sm:hidden',
      md: 'block md:hidden',
      lg: 'block lg:hidden',
      xl: 'block xl:hidden'
    };
    classes += ` ${breakpoints[below]}`;
  }

  if (only) {
    const breakpoints = {
      sm: 'hidden sm:block md:hidden',
      md: 'hidden md:block lg:hidden',
      lg: 'hidden lg:block xl:hidden',
      xl: 'hidden xl:block'
    };
    classes += ` ${breakpoints[only]}`;
  }

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
});

// Responsive aspect ratio container
export const AspectRatio = memo(({ 
  children, 
  ratio = '16/9',
  className = '',
  ...props 
}) => {
  const ratios = {
    '1/1': 'aspect-square',
    '4/3': 'aspect-4/3',
    '16/9': 'aspect-video',
    '21/9': 'aspect-[21/9]'
  };

  const classes = `relative ${ratios[ratio] || `aspect-[${ratio}]`} ${className}`;

  return (
    <div className={classes} {...props}>
      <div className="absolute inset-0">
        {children}
      </div>
    </div>
  );
});

// Mobile-optimized touch target
export const TouchTarget = memo(({ 
  children, 
  className = '',
  size = 'default',
  ...props 
}) => {
  const sizes = {
    sm: 'min-h-[40px] min-w-[40px]', // iOS minimum
    default: 'min-h-[44px] min-w-[44px]', // iOS recommended
    lg: 'min-h-[48px] min-w-[48px]' // Android recommended
  };

  const classes = `${sizes[size]} flex items-center justify-center ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
});
