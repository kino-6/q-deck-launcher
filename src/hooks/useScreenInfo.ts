import { useState, useEffect, useCallback } from 'react';

export interface ScreenInfo {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  pixelRatio: number;
  colorDepth?: number;
  orientation?: string;
  dpiCategory?: string;
  physicalWidth?: number;
  physicalHeight?: number;
  scaleFactor?: number; // Actual scale factor to apply (capped at 2.0)
  isHighDPI?: boolean; // True if pixelRatio > 1.25
}

export interface UseScreenInfoReturn {
  screenInfo: ScreenInfo;
  dpiScale: number;
  updateScreenInfo: () => void;
}

// Helper function to categorize DPI
const getDPICategory = (pixelRatio: number): string => {
  if (pixelRatio <= 1.25) return 'standard';
  if (pixelRatio <= 1.75) return 'high';
  if (pixelRatio <= 2.5) return 'very-high';
  return 'ultra-high';
};

export const useScreenInfo = (): UseScreenInfoReturn => {
  const [screenInfo, setScreenInfo] = useState<ScreenInfo>({
    width: window.screen.width,
    height: window.screen.height,
    availWidth: window.screen.availWidth,
    availHeight: window.screen.availHeight,
    pixelRatio: window.devicePixelRatio
  });

  const [dpiScale, setDpiScale] = useState(1);

  // Enhanced screen info detection with better DPI handling
  const updateScreenInfo = useCallback(() => {
    const pixelRatio = window.devicePixelRatio;
    const scaleFactor = Math.min(pixelRatio, 2.0); // Cap at 2.0 for stability
    const isHighDPI = pixelRatio > 1.25;
    
    const newScreenInfo: ScreenInfo = {
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      pixelRatio,
      colorDepth: window.screen.colorDepth,
      orientation: window.screen.orientation?.type || 'landscape-primary',
      dpiCategory: getDPICategory(pixelRatio),
      physicalWidth: Math.round(window.screen.width / pixelRatio),
      physicalHeight: Math.round(window.screen.height / pixelRatio),
      scaleFactor,
      isHighDPI,
    };
    
    setScreenInfo(newScreenInfo);
    setDpiScale(scaleFactor);
  }, []);

  useEffect(() => {
    updateScreenInfo();
    
    const handleResize = () => updateScreenInfo();
    const handleOrientationChange = () => setTimeout(updateScreenInfo, 100);
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    const mediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    const handleDPIChange = () => updateScreenInfo();
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleDPIChange);
    } else {
      mediaQuery.addListener(handleDPIChange);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleDPIChange);
      } else {
        mediaQuery.removeListener(handleDPIChange);
      }
    };
  }, [updateScreenInfo]);

  return {
    screenInfo,
    dpiScale,
    updateScreenInfo,
  };
};
