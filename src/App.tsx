import { useEffect, useState, lazy, Suspense } from 'react';
import { tauriAPI, QDeckConfig, ParsedHotkey } from './lib/platform-api';
import "./App.css";

// Lazy load components for faster initial load
const Grid = lazy(() => import('./components/Grid'));
const Overlay = lazy(() => import('./pages/Overlay'));

function App() {
  const [config, setConfig] = useState<QDeckConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hotkeys, setHotkeys] = useState<ParsedHotkey[]>([]);
  const [newHotkey, setNewHotkey] = useState('');
  const [hotkeyAction, setHotkeyAction] = useState('show_overlay');
  const [isOverlayMode, setIsOverlayMode] = useState(false);

  useEffect(() => {
    // Check if we're in overlay mode based on URL
    // Support both /overlay and #/overlay (hash routing)
    const isOverlay = window.location.pathname === '/overlay' || 
                      window.location.hash === '#/overlay' ||
                      window.location.pathname.endsWith('/overlay');
    setIsOverlayMode(isOverlay);
    
    console.log('App mode detection:', {
      pathname: window.location.pathname,
      hash: window.location.hash,
      isOverlay
    });
    
    loadConfig();
    if (!isOverlay) {
      loadHotkeys();
    }
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const loadedConfig = await tauriAPI.getConfig();
      setConfig(loadedConfig as QDeckConfig);
      setError(null);
    } catch (err) {
      setError(`Failed to load config: ${err}`);
      console.error('Failed to load config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHotkeys = async () => {
    try {
      const registeredHotkeys = await tauriAPI.getRegisteredHotkeys();
      setHotkeys(registeredHotkeys);
    } catch (err) {
      console.error('Failed to load hotkeys:', err);
    }
  };

  const handleShowOverlay = async () => {
    try {
      await tauriAPI.showOverlay();
    } catch (err) {
      console.error('Failed to show overlay:', err);
    }
  };

  const handleHideOverlay = async () => {
    try {
      await tauriAPI.hideOverlay();
    } catch (err) {
      console.error('Failed to hide overlay:', err);
    }
  };

  const handleRegisterHotkey = async () => {
    if (!newHotkey.trim()) return;
    
    try {
      const id = await tauriAPI.registerHotkey(newHotkey, hotkeyAction);
      console.log(`Registered hotkey: ${newHotkey} with ID: ${id}`);
      setNewHotkey('');
      await loadHotkeys();
    } catch (err) {
      console.error('Failed to register hotkey:', err);
      alert(`Failed to register hotkey: ${err}`);
    }
  };

  const handleUnregisterHotkey = async (id: number) => {
    try {
      await tauriAPI.unregisterHotkey(id);
      console.log(`Unregistered hotkey with ID: ${id}`);
      await loadHotkeys();
    } catch (err) {
      console.error('Failed to unregister hotkey:', err);
      alert(`Failed to unregister hotkey: ${err}`);
    }
  };

  const handleCheckHotkeyAvailability = async () => {
    if (!newHotkey.trim()) return;
    
    try {
      const available = await tauriAPI.isHotkeyAvailable(newHotkey);
      alert(`Hotkey "${newHotkey}" is ${available ? 'available' : 'not available'}`);
    } catch (err) {
      console.error('Failed to check hotkey availability:', err);
    }
  };

  const getHotkeyDisplayName = (hotkey: ParsedHotkey) => {
    // Convert virtual key codes back to readable names
    const modifiers = [];
    if (hotkey.modifiers & 0x0002) modifiers.push('Ctrl'); // MOD_CONTROL
    if (hotkey.modifiers & 0x0001) modifiers.push('Alt');  // MOD_ALT
    if (hotkey.modifiers & 0x0004) modifiers.push('Shift'); // MOD_SHIFT
    if (hotkey.modifiers & 0x0008) modifiers.push('Win');  // MOD_WIN

    // Convert VK codes to key names
    let keyName = '';
    if (hotkey.vk_code >= 0x70 && hotkey.vk_code <= 0x7B) {
      // Function keys F1-F12
      keyName = `F${hotkey.vk_code - 0x70 + 1}`;
    } else if (hotkey.vk_code >= 0x41 && hotkey.vk_code <= 0x5A) {
      // Letter keys A-Z
      keyName = String.fromCharCode(hotkey.vk_code);
    } else if (hotkey.vk_code >= 0x30 && hotkey.vk_code <= 0x39) {
      // Number keys 0-9
      keyName = String.fromCharCode(hotkey.vk_code);
    } else {
      // Special keys
      switch (hotkey.vk_code) {
        case 0x1B: keyName = 'Escape'; break;
        case 0x20: keyName = 'Space'; break;
        case 0x0D: keyName = 'Enter'; break;
        case 0x09: keyName = 'Tab'; break;
        case 0xC0: keyName = '`'; break; // Backtick
        default: keyName = `VK_${hotkey.vk_code.toString(16).toUpperCase()}`;
      }
    }

    return modifiers.length > 0 ? `${modifiers.join('+')}+${keyName}` : keyName;
  };

  const getActionDisplayName = (action: string) => {
    if (action === 'show_overlay') return '🚀 Show Overlay';
    if (action === 'hide_overlay') return '❌ Hide Overlay';
    if (action === 'toggle_overlay') return '🔄 Toggle Overlay';
    if (action.startsWith('switch_profile:')) {
      const profileName = action.substring(15);
      return `👤 Switch to ${profileName}`;
    }
    return action;
  };

  const handleToggleOverlay = async () => {
    try {
      await tauriAPI.toggleOverlay();
    } catch (err) {
      console.error('Failed to toggle overlay:', err);
    }
  };

  // If we're in overlay mode, render the overlay component
  if (isOverlayMode) {
    return (
      <Suspense fallback={<div style={{ padding: '20px' }}>Loading overlay...</div>}>
        <Overlay />
      </Suspense>
    );
  }

  if (isLoading) {
    return (
      <main className="container">
        <div>Loading Q-Deck...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={loadConfig}>Retry</button>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <h1>Q-Deck Settings</h1>
      <p className="subtitle">Configure your overlay launcher</p>
        
        <div className="controls">
          <button onClick={handleShowOverlay}>Show Overlay</button>
          <button onClick={handleHideOverlay}>Hide Overlay</button>
          <button onClick={handleToggleOverlay}>Toggle Overlay</button>
        </div>

      {config && (
        <div className="config-info">
          <h3>Configuration</h3>
          <div className="config-grid">
            <div className="config-item">
              <span className="config-label">Version:</span>
              <span className="config-value">{config.version}</span>
            </div>
            <div className="config-item">
              <span className="config-label">Profiles:</span>
              <span className="config-value">{config.profiles.length}</span>
            </div>
            <div className="config-item">
              <span className="config-label">Theme:</span>
              <span className="config-value">{config.ui.window.theme}</span>
            </div>
            <div className="config-item">
              <span className="config-label">Default Hotkeys:</span>
              <span className="config-value hotkey-list">
                {config.ui.summon.hotkeys.map((hotkey, index) => (
                  <span key={index} className="hotkey-badge">
                    {hotkey}
                  </span>
                ))}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="hotkey-section">
        <h3>Hotkey Management</h3>
        
        <div className="hotkey-controls">
          <input
            type="text"
            value={newHotkey}
            onChange={(e) => setNewHotkey(e.target.value)}
            placeholder="e.g., Ctrl+Alt+F1"
            className="hotkey-input"
          />
          <select
            value={hotkeyAction}
            onChange={(e) => setHotkeyAction(e.target.value)}
            className="action-select"
          >
            <option value="show_overlay">Show Overlay</option>
            <option value="hide_overlay">Hide Overlay</option>
            <option value="toggle_overlay">Toggle Overlay</option>
          </select>
          <button onClick={handleRegisterHotkey}>Register</button>
          <button onClick={handleCheckHotkeyAvailability}>Check Available</button>
        </div>

        <div className="registered-hotkeys">
          <h4>Active Hotkeys ({hotkeys.length})</h4>
          {hotkeys.length === 0 ? (
            <p>No hotkeys registered</p>
          ) : (
            <ul>
              {hotkeys.map((hotkey) => (
                <li key={hotkey.id} className="hotkey-item">
                  <div className="hotkey-info">
                    <span className="hotkey-display">
                      {getHotkeyDisplayName(hotkey)}
                    </span>
                    <span className="hotkey-action">
                      {getActionDisplayName(hotkey.action)}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleUnregisterHotkey(hotkey.id)}
                    className="unregister-btn"
                    title="Remove this hotkey"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Suspense fallback={<div>Loading grid...</div>}>
        <Grid />
      </Suspense>
    </main>
  );
}

export default App;
