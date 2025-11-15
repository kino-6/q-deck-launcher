import { Page, ActionButton as ActionButtonType } from '../lib/platform-api';

export interface GridCell {
  index: number;
  row: number;
  col: number;
  button: ActionButtonType | undefined;
}

/**
 * Creates a grid array with buttons positioned correctly
 */
export const createGridCells = (page: Page): GridCell[] => {
  return Array.from({ length: page.rows * page.cols }, (_, index) => {
    const row = Math.floor(index / page.cols) + 1;
    const col = (index % page.cols) + 1;
    
    const button = page.buttons.find(
      btn => btn.position.row === row && btn.position.col === col
    );

    return {
      index,
      row,
      col,
      button,
    };
  });
};

/**
 * Helper function to categorize DPI
 */
export const getDPICategory = (pixelRatio: number): string => {
  if (pixelRatio <= 1.25) return 'standard';
  if (pixelRatio <= 1.75) return 'high';
  if (pixelRatio <= 2.5) return 'very-high';
  return 'ultra-high';
};
