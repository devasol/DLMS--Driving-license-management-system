// Performance optimization utilities

// Optimized animation variants for better performance
export const optimizedPageVariants = {
  initial: {
    opacity: 0,
    y: 10,
    // Use transform3d for hardware acceleration
    transform: "translate3d(0, 10px, 0)",
  },
  animate: {
    opacity: 1,
    y: 0,
    transform: "translate3d(0, 0, 0)",
    transition: {
      duration: 0.3, // Reduced from longer durations
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transform: "translate3d(0, -10px, 0)",
    transition: {
      duration: 0.2,
    },
  },
};

// Optimized card hover animations
export const optimizedCardVariants = {
  initial: {
    scale: 1,
    transform: "translate3d(0, 0, 0) scale(1)",
  },
  hover: {
    scale: 1.02,
    transform: "translate3d(0, -2px, 0) scale(1.02)",
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

// Optimized stagger animations
export const optimizedStaggerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.05, // Reduced from 0.1
      delayChildren: 0.1,
    },
  },
};

// Optimized item animations for lists
export const optimizedItemVariants = {
  initial: {
    opacity: 0,
    y: 5,
    transform: "translate3d(0, 5px, 0)",
  },
  animate: {
    opacity: 1,
    y: 0,
    transform: "translate3d(0, 0, 0)",
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

// Debounce function for scroll events
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for high-frequency events
export const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: "50px",
    threshold: 0.1,
  };

  return new IntersectionObserver(callback, { ...defaultOptions, ...options });
};

// Performance monitoring utilities
export const performanceMonitor = {
  // Measure component render time
  measureRender: (componentName, renderFunction) => {
    const start = performance.now();
    const result = renderFunction();
    const end = performance.now();

    if (end - start > 16) {
      // More than one frame (16ms)
      console.warn(
        `Slow render detected in ${componentName}: ${(end - start).toFixed(
          2
        )}ms`
      );
    }

    return result;
  },

  // Measure scroll performance
  measureScrollPerformance: () => {
    let lastScrollTime = 0;
    let frameCount = 0;
    let totalTime = 0;

    const measureFrame = () => {
      const currentTime = performance.now();
      if (lastScrollTime > 0) {
        const frameDuration = currentTime - lastScrollTime;
        totalTime += frameDuration;
        frameCount++;

        if (frameDuration > 16.67) {
          // Slower than 60fps
          console.warn(`Slow scroll frame: ${frameDuration.toFixed(2)}ms`);
        }
      }
      lastScrollTime = currentTime;
    };

    return {
      start: () => {
        window.addEventListener("scroll", measureFrame, { passive: true });
      },
      stop: () => {
        window.removeEventListener("scroll", measureFrame);
        if (frameCount > 0) {
          const avgFrameTime = totalTime / frameCount;
          console.log(
            `Average scroll frame time: ${avgFrameTime.toFixed(2)}ms`
          );
        }
      },
    };
  },
};

// CSS optimization utilities
export const cssOptimizations = {
  // Hardware acceleration styles
  hardwareAcceleration: {
    transform: "translate3d(0, 0, 0)",
    backfaceVisibility: "hidden",
    perspective: 1000,
    willChange: "transform",
  },

  // Optimized box shadow
  optimizedShadow: {
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
  },

  // CSS containment for better performance
  containment: {
    contain: "layout style paint",
  },
};

// React optimization hooks (utility functions only)
export const useOptimizedCallback = (callback, deps) => {
  // This should be used with React.useCallback in components
  return { callback, deps };
};

export const useOptimizedMemo = (factory, deps) => {
  // This should be used with React.useMemo in components
  return { factory, deps };
};

// Optimized animation presets
export const animationPresets = {
  // Minimal fade for better performance
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  },

  // Optimized slide
  slide: {
    initial: { opacity: 0, transform: "translate3d(0, 10px, 0)" },
    animate: {
      opacity: 1,
      transform: "translate3d(0, 0, 0)",
      transition: { duration: 0.25, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      transform: "translate3d(0, -10px, 0)",
      transition: { duration: 0.2 },
    },
  },

  // Minimal scale for cards
  scale: {
    initial: { scale: 0.98, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    exit: {
      scale: 0.98,
      opacity: 0,
      transition: { duration: 0.15 },
    },
  },
};

// Bundle size optimization utilities
export const bundleOptimizations = {
  // Dynamic import wrapper
  dynamicImport: (importFunction) => {
    return React.lazy(importFunction);
  },

  // Preload critical resources
  preloadResource: (href, as = "script") => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  },

  // Remove unused CSS
  removeUnusedStyles: () => {
    // This would be implemented with a build-time tool
    console.log("Unused styles should be removed during build process");
  },
};

export default {
  optimizedPageVariants,
  optimizedCardVariants,
  optimizedStaggerVariants,
  optimizedItemVariants,
  debounce,
  throttle,
  createIntersectionObserver,
  performanceMonitor,
  cssOptimizations,
  animationPresets,
  bundleOptimizations,
};
