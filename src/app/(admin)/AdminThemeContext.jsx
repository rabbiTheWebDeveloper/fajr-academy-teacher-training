'use client';

/**
 * The admin and instructor panels share one theme (src/components/panel/PanelThemeContext.jsx).
 * These aliases keep the many `useAdminTheme()` imports in the admin screens working.
 */
export { PanelThemeProvider as AdminThemeProvider, usePanelTheme as useAdminTheme } from '@/components/panel/PanelThemeContext';
