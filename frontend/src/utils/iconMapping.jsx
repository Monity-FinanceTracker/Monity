import React from 'react';
import { getIcon } from './iconMappingData';

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  xxl: 'w-12 h-12',
};

export const Icon = ({ name, size = 'md', className = '', ...props }) => {
  const IconComponent = getIcon(name);
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return <IconComponent className={`${sizeClass} ${className}`} {...props} />;
};

export default Icon;
