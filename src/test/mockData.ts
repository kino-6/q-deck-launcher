import { QDeckConfig, ActionButton, ProfileInfo, PageInfo } from '../lib/platform-api';

export const mockConfig: QDeckConfig = {
  version: '1.0',
  ui: {
    summon: {
      hotkeys: ['F11'],
      edge_trigger: {
        enabled: false,
        edges: ['top'],
        dwell_ms: 300,
        margin_px: 5,
      },
    },
    window: {
      placement: 'dropdown-top',
      width_px: 1000,
      height_px: 600,
      cell_size_px: 96,
      gap_px: 8,
      opacity: 0.92,
      theme: 'dark',
      animation: {
        enabled: true,
        duration_ms: 150,
      },
      // Add new optional properties with defaults
      monitor_preference: {
        strategy: 'cursor',
        fallback_to_primary: true,
      },
      dpi_awareness: {
        enabled: true,
        max_scale_factor: 2.0,
        min_scale_factor: 1.0,
        scale_strategy: 'adaptive',
      },
      responsive_scaling: {
        enabled: true,
        breakpoints: [
          {
            name: 'mobile',
            max_width: 768,
            scale_modifier: 0.8,
          },
          {
            name: 'desktop',
            min_width: 1024,
            scale_modifier: 1.0,
          },
        ],
        adaptive_cell_size: true,
        adaptive_gap_size: true,
      },
    },
  },
  profiles: [
    {
      name: 'Default',
      hotkey: undefined,
      pages: [
        {
          name: 'Main',
          rows: 3,
          cols: 6,
          buttons: [
            {
              position: { row: 1, col: 1 },
              action_type: 'LaunchApp',
              label: 'Test App',
              icon: '🚀',
              config: {},
              style: {
                background_color: '#007ACC',
                text_color: '#FFFFFF',
                font_size: 12,
                font_family: 'Arial',
                responsive_font_scaling: true,
              },
              action: {
                action_type: 'app',
                app_config: {
                  path: 'notepad.exe',
                },
              },
            },
            {
              position: { row: 1, col: 2 },
              action_type: 'Open',
              label: 'Test Folder',
              icon: '📁',
              config: {},
              style: {
                background_color: '#34D399',
                text_color: '#FFFFFF',
              },
              action: {
                action_type: 'command',
                command_config: {
                  command: 'explorer',
                  args: '.',
                },
              },
            },
          ],
        },
      ],
    },
  ],
};

export const mockButton: ActionButton = {
  position: { row: 1, col: 1 },
  action_type: 'LaunchApp',
  label: 'Test Button',
  icon: '🚀',
  config: {},
  style: {
    background_color: '#007ACC',
    text_color: '#FFFFFF',
    font_size: 12,
    font_family: 'Arial',
    border_color: '#0066AA',
    border_width: 1,
    border_radius: 8,
    responsive_font_scaling: true,
    gradient: {
      enabled: true,
      direction: 135,
      colors: [
        { color: '#007ACC', position: 0 },
        { color: '#005599', position: 100 },
      ],
    },
    shadow: {
      enabled: true,
      color: 'rgba(0, 0, 0, 0.2)',
      blur: 4,
      offset_x: 0,
      offset_y: 2,
    },
    animation: {
      hover_scale: 1.05,
      hover_rotation: 1,
      click_scale: 0.95,
      transition_duration: 200,
    },
  },
  action: {
    action_type: 'system',
    system_action: 'config',
  },
};

export const mockProfile: ProfileInfo = {
  name: 'Default',
  index: 0,
  page_count: 1,
  current_page_index: 0,
  hotkey: 'Ctrl+1',
};

export const mockPage: PageInfo = {
  name: 'Main',
  index: 0,
  rows: 3,
  cols: 6,
  button_count: 2,
};