import React, { useEffect, useState } from 'react';
import { tauriAPI, NavigationContext } from '../lib/platform-api';
import { logger } from '../utils/logger';
import './PageIndicator.css';

interface PageIndicatorProps {
  className?: string;
}

/**
 * PageIndicator component displays the current page and total pages
 * Shows page navigation dots and current page information
 */
export const PageIndicator: React.FC<PageIndicatorProps> = ({ className = '' }) => {
  const [navContext, setNavContext] = useState<NavigationContext | null>(null);

  useEffect(() => {
    // Load initial navigation context
    const loadNavigationContext = async () => {
      try {
        const context = await tauriAPI.getNavigationContext();
        setNavContext(context as NavigationContext);
        logger.log('Navigation context loaded:', context);
      } catch (error) {
        logger.error('Failed to load navigation context:', error);
      }
    };

    loadNavigationContext();

    // Listen for profile changes to update the indicator
    const unsubscribe = tauriAPI.onProfileChanged(() => {
      loadNavigationContext();
    });

    return () => {
      // Cleanup subscription if it exists
      unsubscribe?.();
    };
  }, []);

  // Don't render if no context or only one page
  if (!navContext || navContext.total_pages <= 1) {
    return null;
  }

  const { page_index, page_name, total_pages, has_previous_page, has_next_page } = navContext;

  return (
    <div className={`page-indicator ${className}`}>
      <div className="page-indicator-content">
        {/* Page dots */}
        <div className="page-dots">
          {Array.from({ length: total_pages }, (_, i) => (
            <div
              key={i}
              className={`page-dot ${i === page_index ? 'active' : ''}`}
              title={`Page ${i + 1}`}
            />
          ))}
        </div>

        {/* Page info */}
        <div className="page-info">
          <span className="page-name">{page_name}</span>
          <span className="page-count">
            {page_index + 1} / {total_pages}
          </span>
        </div>

        {/* Navigation hints */}
        <div className="page-nav-hints">
          {has_previous_page && (
            <span className="nav-hint prev" title="Previous page">
              ← / PageUp
            </span>
          )}
          {has_next_page && (
            <span className="nav-hint next" title="Next page">
              → / PageDown
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageIndicator;
