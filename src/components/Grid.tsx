import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ActionButton from './ActionButton';
import { QDeckConfig } from '../lib/tauri';
import './Grid.css';

interface GridProps {
  config?: QDeckConfig;
}

export const Grid: React.FC<GridProps> = ({ config }) => {
  const [currentProfile, setCurrentProfile] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  if (!config || !config.profiles || config.profiles.length === 0) {
    return (
      <div className="grid-container">
        <div className="grid-placeholder">
          <h3>No profiles configured</h3>
          <p>Configure profiles in the main window to see buttons here.</p>
        </div>
      </div>
    );
  }

  const profile = config.profiles[currentProfile];
  const page = profile.pages[currentPage];

  if (!page) {
    return (
      <div className="grid-container">
        <div className="grid-placeholder">
          <h3>No pages configured</h3>
          <p>Configure pages for this profile to see buttons here.</p>
        </div>
      </div>
    );
  }

  const gridStyle = {
    '--grid-rows': page.rows,
    '--grid-cols': page.cols,
    '--cell-size': `${config.ui.window.cell_size_px}px`,
    '--gap-size': `${config.ui.window.gap_px}px`,
  } as React.CSSProperties;



  // Create a grid array with buttons positioned correctly
  const gridCells = Array.from({ length: page.rows * page.cols }, (_, index) => {
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

  return (
    <motion.div 
      className="grid"
      style={gridStyle}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        transition: {
          staggerChildren: 0.02,
          delayChildren: 0.1,
        }
      }}
    >
      {gridCells.map(({ index, row, col, button }) => (
        <motion.div
          key={index}
          className={`grid-cell ${button ? 'has-button' : 'empty'}`}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            transition: { duration: 0.15 }
          }}
          data-row={row}
          data-col={col}
        >
          {button ? (
            <ActionButton 
              button={button}
            />
          ) : (
            <div className="empty-cell"></div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default Grid;