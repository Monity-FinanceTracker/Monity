import React, { memo } from 'react';

/**
 * Modern Typography System Component
 * Provides consistent text styling across the application
 * Performance optimized with memoization
 */

// Heading component with semantic hierarchy
export const Heading = memo(({ 
  level = 1, 
  children, 
  className = '', 
  variant = 'default',
  weight = 'normal',
  ...props 
}) => {
  const baseClasses = 'text-foreground leading-tight';
  
  const variants = {
    default: '',
    gradient: 'bg-gradient-to-r from-monity-accent to-monity-accentHover bg-clip-text text-transparent',
    accent: 'text-monity-accent',
    muted: 'text-muted-foreground',
    error: 'text-monity-error',
    success: 'text-monity-success',
    warning: 'text-monity-warning'
  };

  const weights = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold'
  };

  const levelStyles = {
    1: 'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight',
    2: 'text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight',
    3: 'text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight',
    4: 'text-xl md:text-2xl lg:text-3xl font-semibold',
    5: 'text-lg md:text-xl lg:text-2xl font-medium',
    6: 'text-base md:text-lg lg:text-xl font-medium'
  };

  const Tag = `h${level}`;
  const classes = `${baseClasses} ${levelStyles[level]} ${variants[variant]} ${weights[weight]} ${className}`;

  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  );
});

// Text component for body text
export const Text = memo(({ 
  size = 'base', 
  children, 
  className = '', 
  variant = 'default',
  weight = 'normal',
  leading = 'normal',
  as = 'p',
  ...props 
}) => {
  const baseClasses = 'text-foreground';
  
  const variants = {
    default: 'text-foreground',
    muted: 'text-muted-foreground',
    accent: 'text-monity-accent',
    error: 'text-monity-error',
    success: 'text-monity-success',
    warning: 'text-monity-warning'
  };

  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  };

  const weights = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  const leadings = {
    tight: 'leading-tight',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose'
  };

  const Tag = as;
  const classes = `${baseClasses} ${sizes[size]} ${variants[variant]} ${weights[weight]} ${leadings[leading]} ${className}`;

  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  );
});

// Label component for form labels and small text
export const Label = memo(({ 
  children, 
  className = '', 
  variant = 'default',
  size = 'sm',
  htmlFor,
  ...props 
}) => {
  const variants = {
    default: 'text-foreground',
    muted: 'text-muted-foreground',
    accent: 'text-monity-accent',
    error: 'text-monity-error',
    required: 'text-foreground after:content-["*"] after:text-monity-error after:ml-1'
  };

  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base'
  };

  const classes = `font-medium ${sizes[size]} ${variants[variant]} ${className}`;

  return (
    <label className={classes} htmlFor={htmlFor} {...props}>
      {children}
    </label>
  );
});

// Caption component for small descriptive text
export const Caption = memo(({ 
  children, 
  className = '', 
  variant = 'muted',
  ...props 
}) => {
  const variants = {
    default: 'text-foreground',
    muted: 'text-muted-foreground',
    accent: 'text-monity-accent',
    error: 'text-monity-error'
  };

  const classes = `text-xs ${variants[variant]} ${className}`;

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
});

// Link component for consistent link styling
export const TextLink = memo(({ 
  children, 
  className = '', 
  variant = 'default',
  underline = 'hover',
  ...props 
}) => {
  const variants = {
    default: 'text-monity-accent hover:text-monity-accentHover',
    muted: 'text-muted-foreground hover:text-foreground',
    accent: 'text-monity-accent hover:text-monity-accentHover'
  };

  const underlines = {
    none: '',
    always: 'underline',
    hover: 'hover:underline'
  };

  const classes = `font-medium transition-colors duration-200 ${variants[variant]} ${underlines[underline]} ${className}`;

  return (
    <a className={classes} {...props}>
      {children}
    </a>
  );
});

// Code component for inline code
export const Code = memo(({ 
  children, 
  className = '', 
  variant = 'default',
  ...props 
}) => {
  const variants = {
    default: 'bg-muted text-monity-accent',
    muted: 'bg-muted text-muted-foreground'
  };

  const classes = `px-1.5 py-0.5 rounded text-sm font-mono ${variants[variant]} ${className}`;

  return (
    <code className={classes} {...props}>
      {children}
    </code>
  );
});

// Display component for large promotional text
export const Display = memo(({ 
  children, 
  className = '', 
  size = 'lg',
  variant = 'default',
  ...props 
}) => {
  const variants = {
    default: 'text-foreground',
    gradient: 'bg-gradient-to-r from-monity-accent to-monity-accentHover bg-clip-text text-transparent'
  };

  const sizes = {
    sm: 'text-5xl md:text-6xl lg:text-7xl',
    lg: 'text-6xl md:text-7xl lg:text-8xl',
    xl: 'text-7xl md:text-8xl lg:text-9xl'
  };

  const classes = `font-extrabold tracking-tight leading-none ${sizes[size]} ${variants[variant]} ${className}`;

  return (
    <h1 className={classes} {...props}>
      {children}
    </h1>
  );
});
