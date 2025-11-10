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

  // Simplified screen info detection
  const updateScreenInfo = useCallback(() => {
    const newScreenInfo: ScreenInfo = {
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      pixelRatio: window.devicePixelRatio,
      colorDepth: window.screen.colorDepth,
      orientation: window.screen.orientation?.type || 'landscape-primary',
      dpiCategory: getDPICategory(window.devicePixelRatio),
      physicalWidth: Math.round(window.screen.width / window.devicePixelRatio),
      physicalHeight: Math.round(window.screen.height / window.devicePixelRatio),
    };
    
    setScreenInfo(newScreenInfo);
    setDpiScale(Math.min(window.devicePixelRatio, 2.0));
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
