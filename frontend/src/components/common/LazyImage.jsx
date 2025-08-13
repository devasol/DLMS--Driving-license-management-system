import React, { useState, useRef, useEffect } from 'react';
import { Box, Skeleton } from '@mui/material';

const LazyImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  className,
  style,
  placeholder,
  onLoad,
  onError,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    if (onError) onError(e);
  };

  return (
    <Box
      ref={imgRef}
      sx={{
        width: width || '100%',
        height: height || 'auto',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
      className={className}
    >
      {!isInView && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={height || 200}
          sx={{
            bgcolor: 'grey.200',
            borderRadius: 1
          }}
        />
      )}
      
      {isInView && !hasError && (
        <>
          {!isLoaded && (
            <Skeleton
              variant="rectangular"
              width="100%"
              height={height || 200}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bgcolor: 'grey.200',
                borderRadius: 1
              }}
            />
          )}
          <img
            src={src}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
              transform: 'translate3d(0, 0, 0)', // Hardware acceleration
              ...style
            }}
            {...props}
          />
        </>
      )}
      
      {hasError && (
        <Box
          sx={{
            width: '100%',
            height: height || 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.100',
            color: 'grey.500',
            borderRadius: 1
          }}
        >
          {placeholder || 'Failed to load image'}
        </Box>
      )}
    </Box>
  );
};

export default LazyImage;
