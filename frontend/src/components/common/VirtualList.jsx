import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Box } from '@mui/material';

const VirtualList = ({
  items,
  itemHeight = 60,
  containerHeight = 400,
  renderItem,
  overscan = 5,
  className,
  style,
  onScroll
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef();

  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const visible = [];
    for (let i = startIndex; i <= endIndex; i++) {
      visible.push({
        index: i,
        item: items[i],
        top: i * itemHeight
      });
    }

    return visible;
  }, [items, itemHeight, scrollTop, containerHeight, overscan]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = (e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
    if (onScroll) onScroll(e);
  };

  return (
    <Box
      ref={containerRef}
      className={className}
      sx={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
        // Performance optimizations
        transform: 'translate3d(0, 0, 0)',
        willChange: 'scroll-position',
        contain: 'layout style paint',
        ...style
      }}
      onScroll={handleScroll}
    >
      {/* Total height container */}
      <Box
        sx={{
          height: totalHeight,
          position: 'relative'
        }}
      >
        {/* Visible items */}
        {visibleItems.map(({ index, item, top }) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              top: top,
              left: 0,
              right: 0,
              height: itemHeight,
              // Performance optimizations
              transform: 'translate3d(0, 0, 0)',
              contain: 'layout style paint'
            }}
          >
            {renderItem(item, index)}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default VirtualList;
