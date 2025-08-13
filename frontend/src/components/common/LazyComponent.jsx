import React, { useState, useRef, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';

const LazyComponent = ({ 
  children, 
  fallback, 
  threshold = 0.1, 
  rootMargin = '50px',
  minHeight = 200,
  className,
  style 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Small delay to ensure smooth loading
          setTimeout(() => setIsLoaded(true), 100);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const defaultFallback = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: minHeight,
        bgcolor: 'grey.50',
        borderRadius: 1
      }}
    >
      <CircularProgress size={24} />
    </Box>
  );

  return (
    <Box
      ref={ref}
      className={className}
      sx={{
        minHeight: isVisible ? 'auto' : minHeight,
        // Performance optimizations
        transform: 'translate3d(0, 0, 0)',
        contain: 'layout style paint',
        ...style
      }}
    >
      {isLoaded ? children : (fallback || defaultFallback)}
    </Box>
  );
};

export default LazyComponent;
