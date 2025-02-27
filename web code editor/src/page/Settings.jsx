import { useState } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    theme: 'dark',
    fontSize: 14,
    tabSize: 2,
    autoSave: true,
    language: 'en',
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      <div className="settings-group">
        <div className="setting-item">
          <label>Theme</label>
          <select
            value={settings.theme}
            onChange={(e) => handleSettingChange('theme', e.target.value)}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>
        <div className="setting-item">
          <label>Font Size</label>
          <input
            type="number"
            value={settings.fontSize}
            onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
          />
        </div>
        <div className="setting-item">
          <label>Tab Size</label>
          <input
            type="number"
            value={settings.tabSize}
            onChange={(e) => handleSettingChange('tabSize', parseInt(e.target.value))}
          />
        </div>
        <div className="setting-item">
          <label>Auto Save</label>
          <input
            type="checkbox"
            checked={settings.autoSave}
            onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
          />
        </div>
        <div className="setting-item">
          <label>Language</label>
          <select
            value={settings.language}
            onChange={(e) => handleSettingChange('language', e.target.value)}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Settings; 