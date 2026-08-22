import React from 'react';

export const SkeletonLoader = ({ className = '', variant = 'text', count = 1 }) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'card':
        return 'h-24 w-full rounded-xl';
      case 'table-row':
        return 'h-10 w-full rounded-md';
      case 'circle':
        return 'w-8 h-8 rounded-full';
      case 'title':
        return 'h-6 w-1/3 rounded';
      default:
        return 'h-4 w-full rounded';
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-skeleton ${getVariantStyle()} ${className}`}
        />
      ))}
    </>
  );
};

export default SkeletonLoader;
