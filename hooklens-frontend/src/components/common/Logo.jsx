import React from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import lightLogo from '../../assets/logo-light.png';
import darkLogo from '../../assets/logo-dark.png';

export const Logo = ({
  className = "w-[150px] sm:w-[175px] lg:w-[210px] h-auto object-contain shrink-0",
  alt = "HookLens Logo"
}) => {
  let isDark = false;
  try {
    const { resolvedTheme } = useTheme();
    isDark = resolvedTheme === 'dark';
  } catch (e) {
    isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  }

  const logoSrc = isDark ? darkLogo : lightLogo;

  return (
    <img
      src={logoSrc}
      alt={alt}
      className={className}
    />
  );
};

export default Logo;
