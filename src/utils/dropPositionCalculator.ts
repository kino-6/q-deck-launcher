import { logger } from './logger';

/**
 * Calculate drop position from mouse coordinates
 * Determines which grid cell the mouse is over
 * 
 * @param mouseX - X coordinate of the mouse
 * @param mouseY - Y coordinate of the mouse
 * @returns Grid position {row, col} or null if outside grid
 */
export const calculateDropPosition = (
  mouseX: number,
  mouseY: number
): { row: number; col: number } | null => {
  const gridElement = document.querySelector('.grid') as HTMLElement;
  if (!gridElement) {
    logger.warn('Grid element not found');
    return null;
  }

  // Check if mouse is within grid bounds
  const gridRect = gridElement.getBoundingClientRect();

  // Check if drop is outside grid
  if (
    mouseX < gridRect.left ||
    mouseX > gridRect.right ||
    mouseY < gridRect.top ||
    mouseY > gridRect.bottom
  ) {
    logger.warn('Drop position is outside grid bounds');
    return null;
  }

  // Find the cell at the drop position
  const gridCells = gridElement.querySelectorAll('.grid-cell');
  
  for (const cell of Array.from(gridCells)) {
    const rect = cell.getBoundingClientRect();
    if (
      mouseX >= rect.left &&
      mouseX <= rect.right &&
      mouseY >= rect.top &&
      mouseY <= rect.bottom
    ) {
      const row = parseInt((cell as HTMLElement).dataset.row || '0');
      const col = parseInt((cell as HTMLElement).dataset.col || '0');
      logger.log('Drop position found:', { row, col });
      return { row, col };
    }
  }
  
  logger.warn('No cell found at drop position (between cells or in gap)');
  return null;
};

/**
 * Validate if a drop position is within grid bounds
 * 
 * @param position - The position to validate
 * @param rows - Number of rows in the grid
 * @param cols - Number of columns in the grid
 * @returns true if position is valid, false otherwise
 */
export const isValidDropPosition = (
  position: { row: number; col: number } | null,
  rows: number,
  cols: number
): boolean => {
  if (!position) {
    return false;
  }
  
  return (
    position.row >= 1 &&
    position.row <= rows &&
    position.col >= 1 &&
    position.col <= cols
  );
};
