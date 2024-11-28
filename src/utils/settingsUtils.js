export const groupSettingsByPlugin = (settings) => {
  const plugins = {};
  
  Object.entries(settings || {}).forEach(([key, value]) => {
    // Special handling for plugin enable/disable settings
    if (key.startsWith('runelite.') && key.endsWith('plugin')) {
      const pluginName = key.slice(9, -6); // Remove 'runelite.' prefix and 'plugin' suffix
      if (!plugins[pluginName]) {
        plugins[pluginName] = {};
      }
      plugins[pluginName][key] = value;
      return;
    }
    
    const pluginName = key.split('.')[0] || 'other';
    
    if (!plugins[pluginName]) {
      plugins[pluginName] = {};
    }
    
    plugins[pluginName][key] = value;
  });

  // Sort plugins by enabled state first, then by settings count
  return Object.keys(plugins)
    .sort((a, b) => {
      // Get plugin state keys
      const aStateKey = `runelite.${a.toLowerCase()}plugin`;
      const bStateKey = `runelite.${b.toLowerCase()}plugin`;
      
      // Get enabled states
      const aEnabled = plugins[a][aStateKey] === 'true';
      const bEnabled = plugins[b][bStateKey] === 'true';
      
      // Sort by enabled state first
      if (aEnabled !== bEnabled) {
        return bEnabled ? 1 : -1; // Enabled plugins first
      }
      
      // Then by number of settings
      const countA = Object.keys(plugins[a]).length;
      const countB = Object.keys(plugins[b]).length;
      const countDiff = countB - countA;
      
      // If counts are equal, sort alphabetically
      return countDiff !== 0 ? countDiff : a.localeCompare(b);
    })
    .reduce((acc, key) => {
      acc[key] = plugins[key];
      return acc;
    }, {});
};

export const countPluginSettings = (pluginSettings) => {
  return Object.keys(pluginSettings).length;
};
