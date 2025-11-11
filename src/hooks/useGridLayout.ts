import { useCallback } from 'react';
import { QDeckConfig, PageInfo } from '../lib/platform-api';

export interface UseGridLayoutProps {
  config: QDeckConfig | undefined;
  currentProfileIndex: number;
  currentPageIndex: number;
}

export interface UseGridLayoutReturn {
  calculateOptimalCellSize: () => number;
  calculateOptimalGapSize: () => number;
  optimalCellSize: number;
  optimalGapSize: number;
  gridStyle: React.CSSProperties;
}

export const useGridLayout = ({ 
  config, 
  currentProfileIndex, 
  currentPageIndex 
}: UseGridLayoutProps) => {
  // Enhanced cell size calculation with DPI awareness
  const calculateOptimalCellSize = useCallback(() => {
    if (!config) return 96;
    
    const profile = config.profiles[currentProfileIndex];
    const currentPageData = profile?.pages[currentPageIndex];
    
    if (!currentPageData) return config.ui.window.cell_size_px;
    
    const { rows, cols } = currentPageData;
    const baseGapSize = config.ui.window.gap_px;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const pixelRatio = window.devicePixelRatio;
    
    // Adjust available space based on DPI
    // High DPI displays need slightly more conservative spacing
    const dpiAdjustment = pixelRatio > 1.5 ? 0.88 : 0.9;
    const availableWidth = viewportWidth * dpiAdjustment;
    const availableHeight = viewportHeight * (dpiAdjustment - 0.03);
    
    const maxCellWidth = (availableWidth - (cols - 1) * baseGapSize) / cols;
    const maxCellHeight = (availableHeight - (rows - 1) * baseGapSize) / rows;
    
    const calculatedSize = Math.min(maxCellWidth, maxCellHeight);
    
    // Adjust min/max sizes based on DPI for better scaling
    const minSize = pixelRatio > 1.5 ? 72 : 64;
    const maxSize = pixelRatio > 1.5 ? 140 : 128;
    
    return Math.max(minSize, Math.min(maxSize, Math.floor(calculatedSize)));
  }, [config, currentProfileIndex, currentPageIndex]);

  const calculateOptimalGapSize = useCallback(() => {
    if (!config) return 8;
    
    const cellSize = calculateOptimalCellSize();
    const baseGap = config.ui.window.gap_px;
    const pixelRatio = window.devicePixelRatio;
    
    // Scale gap based on cell size
    let scaledGap = (cellSize / 96) * baseGap;
    
    // Apply DPI-aware adjustments
    if (pixelRatio > 1.5) {
      // High DPI: slightly increase gap for better visual separation
      scaledGap *= 1.1;
    }
    
    return Math.max(4, Math.min(16, Math.round(scaledGap)));
  }, [config, calculateOptimalCellSize]);

  const optimalCellSize = calculateOptimalCellSize();
  const optimalGapSize = calculateOptimalGapSize();

  const page = config?.profiles[currentProfileIndex]?.pages[currentPageIndex];
  const dpiScale = Math.min(window.devicePixelRatio, 2.0);

  // Simplified grid style
  const gridStyle = page ? {
    '--grid-rows': page.rows,
    '--grid-cols': page.cols,
    '--cell-size': `${optimalCellSize}px`,
    '--gap-size': `${optimalGapSize}px`,
    '--dpi-scale': dpiScale,
  } as React.CSSProperties : {} as React.CSSProperties;

  return {
    calculateOptimalCellSize,
    calculateOptimalGapSize,
    optimalCellSize,
    optimalGapSize,
    gridStyle,
  };
};
