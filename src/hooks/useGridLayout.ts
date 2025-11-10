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
  // Simplified and reliable cell size calculation
  const calculateOptimalCellSize = useCallback(() => {
    if (!config) return 96;
    
    const profile = config.profiles[currentProfileIndex];
    const currentPageData = profile?.pages[currentPageIndex];
    
    if (!currentPageData) return config.ui.window.cell_size_px;
    
    const { rows, cols } = currentPageData;
    const baseGapSize = config.ui.window.gap_px;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const availableWidth = viewportWidth * 0.9;
    const availableHeight = viewportHeight * 0.85;
    
    const maxCellWidth = (availableWidth - (cols - 1) * baseGapSize) / cols;
    const maxCellHeight = (availableHeight - (rows - 1) * baseGapSize) / rows;
    
    const calculatedSize = Math.min(maxCellWidth, maxCellHeight);
    
    const minSize = 64;
    const maxSize = 128;
    
    return Math.max(minSize, Math.min(maxSize, Math.floor(calculatedSize)));
  }, [config, currentProfileIndex, currentPageIndex]);

  const calculateOptimalGapSize = useCallback(() => {
    if (!config) return 8;
    
    const cellSize = calculateOptimalCellSize();
    const baseGap = config.ui.window.gap_px;
    
    const scaledGap = (cellSize / 96) * baseGap;
    
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
