import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Chip, Collapse, IconButton } from '@mui/material';
import { Speed, ExpandMore, ExpandLess } from '@mui/icons-material';

const PerformanceMonitor = ({ enabled = false, position = 'bottom-right' }) => {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 0,
    scrollPerf: 'Good',
    renderTime: 0,
    bundleSize: 0
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationFrame = useRef();

  useEffect(() => {
    if (!enabled) return;

    // FPS monitoring
    const measureFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime.current >= 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round((frameCount.current * 1000) / (currentTime - lastTime.current))
        }));
        frameCount.current = 0;
        lastTime.current = currentTime;
      }
      
      animationFrame.current = requestAnimationFrame(measureFPS);
    };

    measureFPS();

    // Memory monitoring (if available)
    const measureMemory = () => {
      if (performance.memory) {
        setMetrics(prev => ({
          ...prev,
          memory: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
        }));
      }
    };

    const memoryInterval = setInterval(measureMemory, 2000);

    // Scroll performance monitoring
    let scrollFrameTimes = [];
    let lastScrollTime = 0;

    const measureScrollPerf = () => {
      const currentTime = performance.now();
      if (lastScrollTime > 0) {
        const frameTime = currentTime - lastScrollTime;
        scrollFrameTimes.push(frameTime);
        
        // Keep only last 10 measurements
        if (scrollFrameTimes.length > 10) {
          scrollFrameTimes.shift();
        }
        
        const avgFrameTime = scrollFrameTimes.reduce((a, b) => a + b, 0) / scrollFrameTimes.length;
        
        let perfRating = 'Good';
        if (avgFrameTime > 20) perfRating = 'Poor';
        else if (avgFrameTime > 16.67) perfRating = 'Fair';
        
        setMetrics(prev => ({
          ...prev,
          scrollPerf: perfRating
        }));
      }
      lastScrollTime = currentTime;
    };

    window.addEventListener('scroll', measureScrollPerf, { passive: true });

    // Bundle size estimation
    const estimateBundleSize = () => {
      const scripts = document.querySelectorAll('script[src]');
      let totalSize = 0;
      
      scripts.forEach(script => {
        // This is an estimation - in real apps you'd get this from build tools
        totalSize += 100; // Rough estimate per script
      });
      
      setMetrics(prev => ({
        ...prev,
        bundleSize: totalSize
      }));
    };

    estimateBundleSize();

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      clearInterval(memoryInterval);
      window.removeEventListener('scroll', measureScrollPerf);
    };
  }, [enabled]);

  if (!enabled) return null;

  const getPositionStyles = () => {
    const base = {
      position: 'fixed',
      zIndex: 9999,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '8px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace'
    };

    switch (position) {
      case 'top-left':
        return { ...base, top: 16, left: 16 };
      case 'top-right':
        return { ...base, top: 16, right: 16 };
      case 'bottom-left':
        return { ...base, bottom: 16, left: 16 };
      case 'bottom-right':
      default:
        return { ...base, bottom: 16, right: 16 };
    }
  };

  const getFPSColor = (fps) => {
    if (fps >= 55) return 'success';
    if (fps >= 30) return 'warning';
    return 'error';
  };

  const getScrollPerfColor = (perf) => {
    switch (perf) {
      case 'Good': return 'success';
      case 'Fair': return 'warning';
      case 'Poor': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={getPositionStyles()}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: isExpanded ? 1 : 0 }}>
        <Speed sx={{ fontSize: 16 }} />
        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
          Performance
        </Typography>
        <IconButton
          size="small"
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{ color: 'white', p: 0 }}
        >
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Collapse in={isExpanded}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption">FPS:</Typography>
            <Chip
              label={metrics.fps}
              size="small"
              color={getFPSColor(metrics.fps)}
              sx={{ height: 16, fontSize: '10px' }}
            />
          </Box>

          {metrics.memory > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption">Memory:</Typography>
              <Typography variant="caption" sx={{ color: 'lightblue' }}>
                {metrics.memory}MB
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption">Scroll:</Typography>
            <Chip
              label={metrics.scrollPerf}
              size="small"
              color={getScrollPerfColor(metrics.scrollPerf)}
              sx={{ height: 16, fontSize: '10px' }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption">Bundle:</Typography>
            <Typography variant="caption" sx={{ color: 'lightgreen' }}>
              ~{metrics.bundleSize}KB
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

// Performance optimization hook
export const usePerformanceOptimization = () => {
  useEffect(() => {
    // Optimize images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.loading) {
        img.loading = 'lazy';
      }
    });

    // Add will-change to animated elements
    const animatedElements = document.querySelectorAll('[data-animate="true"]');
    animatedElements.forEach(el => {
      el.style.willChange = 'transform';
    });

    // Optimize scroll performance
    let ticking = false;
    const optimizeScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Scroll optimizations here
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', optimizeScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', optimizeScroll);
      // Clean up will-change
      animatedElements.forEach(el => {
        el.style.willChange = 'auto';
      });
    };
  }, []);
};

// Performance measurement hook
export const usePerformanceMeasurement = (componentName) => {
  const startTime = useRef();

  useEffect(() => {
    startTime.current = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime.current;
      
      if (renderTime > 16) { // More than one frame
        console.warn(`Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    };
  });

  const measureOperation = (operationName, operation) => {
    const start = performance.now();
    const result = operation();
    const end = performance.now();
    
    console.log(`${operationName} took ${(end - start).toFixed(2)}ms`);
    return result;
  };

  return { measureOperation };
};

export default PerformanceMonitor;
