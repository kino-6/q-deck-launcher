import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemePreset, THEME_PRESETS, getAllCategories, getThemesByCategory } from '../lib/themes';
import { ButtonStyle } from '../lib/platform-api';
import './ThemeSelector.css';

interface ThemeSelectorProps {
  currentStyle?: ButtonStyle;
  onThemeSelect: (style: ButtonStyle) => void;
  onClose: () => void;
  isVisible: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentStyle,
  onThemeSelect,
  onClose,
  isVisible
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('modern');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewTheme, setPreviewTheme] = useState<ThemePreset | null>(null);

  const categories = useMemo(() => getAllCategories(), []);
  
  const filteredThemes = useMemo(() => {
    let themes = getThemesByCategory(selectedCategory);
    
    if (searchTerm) {
      themes = themes.filter(theme => 
        theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        theme.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return themes;
  }, [selectedCategory, searchTerm]);

  const handleThemeSelect = (theme: ThemePreset) => {
    onThemeSelect(theme.style);
    onClose();
  };

  const handlePreview = (theme: ThemePreset) => {
    setPreviewTheme(theme);
  };

  const clearPreview = () => {
    setPreviewTheme(null);
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'modern': return '🎨';
      case 'classic': return '🏛️';
      case 'neon': return '⚡';
      case 'minimal': return '⚪';
      case 'gaming': return '🎮';
      case 'professional': return '💼';
      default: return '🎯';
    }
  };

  const getCategoryDisplayName = (category: string): string => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const renderThemePreview = (theme: ThemePreset) => {
    const style = theme.style;
    const previewStyle: React.CSSProperties = {
      backgroundColor: style.background_color,
      color: style.text_color,
      borderColor: style.border_color,
      borderWidth: style.border_width || 1,
      borderRadius: style.border_radius || 8,
      borderStyle: 'solid',
    };

    // Apply gradient if enabled
    if (style.gradient?.enabled && style.gradient.colors.length > 0) {
      const gradientStops = style.gradient.colors
        .map(stop => `${stop.color} ${stop.position}%`)
        .join(', ');
      previewStyle.background = `linear-gradient(${style.gradient.direction || 135}deg, ${gradientStops})`;
    }

    // Apply shadow if enabled
    if (style.shadow?.enabled) {
      const shadow = style.shadow;
      previewStyle.boxShadow = `${shadow.offset_x || 0}px ${shadow.offset_y || 0}px ${shadow.blur || 0}px ${shadow.spread || 0}px ${shadow.color}`;
    }

    return (
      <motion.div
        className="theme-preview-button"
        style={previewStyle}
        whileHover={{ 
          scale: style.animation?.hover_scale || 1.05,
          rotate: style.animation?.hover_rotation || 0
        }}
        whileTap={{ 
          scale: style.animation?.click_scale || 0.95 
        }}
        transition={{ 
          duration: (style.animation?.transition_duration || 200) / 1000 
        }}
      >
        <div className="preview-icon">🚀</div>
        <div className="preview-label">Sample</div>
        <div className="preview-type">LaunchApp</div>
      </motion.div>
    );
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="theme-selector-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <motion.div
          className="theme-selector-modal"
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <div className="theme-selector-header">
            <h3>Choose Button Theme</h3>
            <button className="close-button" onClick={onClose}>×</button>
          </div>

          <div className="theme-selector-content">
            {/* Search Bar */}
            <div className="search-section">
              <input
                type="text"
                placeholder="Search themes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="theme-search-input"
              />
            </div>

            {/* Category Tabs */}
            <div className="category-tabs">
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <span className="category-icon">{getCategoryIcon(category)}</span>
                  <span className="category-name">{getCategoryDisplayName(category)}</span>
                </button>
              ))}
            </div>

            {/* Theme Grid */}
            <div className="themes-grid">
              {filteredThemes.map(theme => (
                <motion.div
                  key={theme.id}
                  className="theme-card"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onHoverStart={() => handlePreview(theme)}
                  onHoverEnd={clearPreview}
                >
                  <div className="theme-preview">
                    {renderThemePreview(theme)}
                  </div>
                  <div className="theme-info">
                    <h4 className="theme-name">{theme.name}</h4>
                    <p className="theme-description">{theme.description}</p>
                  </div>
                  <button
                    className="apply-theme-button"
                    onClick={() => handleThemeSelect(theme)}
                  >
                    Apply Theme
                  </button>
                </motion.div>
              ))}
            </div>

            {filteredThemes.length === 0 && (
              <div className="no-themes-message">
                <p>No themes found matching your search.</p>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          {previewTheme && (
            <motion.div
              className="preview-panel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h4>Preview: {previewTheme.name}</h4>
              <div className="large-preview">
                {renderThemePreview(previewTheme)}
              </div>
              <div className="preview-details">
                <p><strong>Category:</strong> {getCategoryDisplayName(previewTheme.category)}</p>
                <p><strong>Description:</strong> {previewTheme.description}</p>
                
                {/* Style Details */}
                <div className="style-details">
                  <h5>Style Properties:</h5>
                  <ul>
                    <li>Background: {previewTheme.style.background_color}</li>
                    <li>Text Color: {previewTheme.style.text_color}</li>
                    {previewTheme.style.border_color && (
                      <li>Border: {previewTheme.style.border_color}</li>
                    )}
                    {previewTheme.style.gradient?.enabled && (
                      <li>Gradient: {previewTheme.style.gradient.colors.length} colors</li>
                    )}
                    {previewTheme.style.shadow?.enabled && (
                      <li>Shadow: {previewTheme.style.shadow.color}</li>
                    )}
                  </ul>
                </div>
              </div>
              <button
                className="apply-preview-button"
                onClick={() => handleThemeSelect(previewTheme)}
              >
                Apply This Theme
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ThemeSelector;