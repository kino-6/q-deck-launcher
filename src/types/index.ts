// Central export for all type definitions

// Grid types
export type {
  GridLayout,
  GridMetrics,
  Rectangle,
  Position,
  GridCell,
  DragState,
  ScreenBreakpoint,
  ResponsiveScaling,
  DPIAwareness,
  MonitorPreference,
  MonitorInfo,
  ScreenInfo,
} from './grid';

// Button types
export type {
  ActionButton,
  ActionType,
  ActionConfig,
  SystemAction,
  ButtonStyle,
  ButtonGradient,
  GradientStop,
  ButtonShadow,
  ButtonAnimation,
  IconInfo,
  IconType,
  IconSize,
  CacheStats,
  ActionResult,
  ActionLog,
  DroppedFile,
  DroppedFileType,
  ButtonGenerationRequest,
  ButtonGenerationResult,
  UndoOperation,
  UndoOperationType,
} from './button';

// Config types
export type {
  QDeckConfig,
  UIConfig,
  SummonConfig,
  EdgeTriggerConfig,
  WindowConfig,
  WindowPlacement,
  ThemeName,
  AnimationConfig,
  Profile,
  Page,
  ProfileInfo,
  PageInfo,
  NavigationContext,
  HotkeyConfig,
  ParsedHotkey,
  TauriWindowConfig,
} from './config';

// Electron types
export type {
  ElectronAPI,
  IconExtractionResult,
} from './electron';
