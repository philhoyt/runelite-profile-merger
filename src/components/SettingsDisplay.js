import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Stack,
  Button,
  ButtonGroup,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import debounce from 'lodash.debounce';
import { groupSettingsByPlugin } from '../utils/settingsUtils';
import debug from '../utils/debug';
import PluginSection from './PluginSection';

const COLORS = {
  unique: {
    bg: '#e3f2fd',
    label: 'Unique to this profile'
  },
  different: {
    bg: '#fff3e0',
    label: 'Different value in other profile'
  },
  pluginStateChange: {
    bg: '#f3e5f5',
    label: 'Plugin enabled/disabled differently'
  }
};

function SettingsDisplay({ 
  title, 
  settings, 
  otherSettings,
  selectedSettings, 
  onSettingToggle, 
  searchTerm, 
  onSearchChange,
  onSelectAll,
  onDeselectAll
}) {
  debug('SettingsDisplay Render', {
    title,
    hasSettings: !!settings,
    settingsCount: settings ? Object.keys(settings).length : 0,
    selectedCount: selectedSettings.length,
    searchTerm
  });

  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [expandedPlugins, setExpandedPlugins] = useState(new Set());

  const handleExpandAll = useCallback(() => {
    const pluginNames = Object.keys(groupSettingsByPlugin(settings));
    setExpandedPlugins(new Set(pluginNames));
  }, [settings]);

  const handleCollapseAll = useCallback(() => {
    setExpandedPlugins(new Set());
  }, []);

  const handlePluginExpand = useCallback((pluginName, isExpanded) => {
    setExpandedPlugins(prev => {
      const newSet = new Set(prev);
      if (isExpanded) {
        newSet.add(pluginName);
      } else {
        newSet.delete(pluginName);
      }
      return newSet;
    });
  }, []);

  // Debounced search handler
  const debouncedSearch = useMemo(
    () => debounce((value) => {
      setDebouncedSearchTerm(value);
      setIsLoading(false);
    }, 300),
    [setDebouncedSearchTerm, setIsLoading]
  );

  const handleSearchChange = (e) => {
    setIsLoading(true);
    onSearchChange(e.target.value);
    debouncedSearch(e.target.value);
  };

  const getDiffStatus = useCallback((key, value) => {
    if (!otherSettings) return 'normal';
    
    // Special handling for plugin enable/disable settings
    if (key.startsWith('runelite.') && key.endsWith('plugin')) {
      if (!(key in otherSettings)) {
        return 'unique';
      }
      if (otherSettings[key] !== value) {
        return 'pluginStateChange';
      }
      return 'same';
    }
    
    if (!(key in otherSettings)) {
      return 'unique';
    }
    
    if (otherSettings[key] !== value) {
      return 'different';
    }
    
    return 'same';
  }, [otherSettings]);

  const getStatusColor = (status) => {
    return COLORS[status]?.bg || 'transparent';
  };

  const getStatusText = useCallback((key, status) => {
    if (status === 'unique') {
      return 'Only in this profile';
    }
    if (status === 'different') {
      return `Other profile value: ${otherSettings[key]}`;
    }
    if (status === 'pluginStateChange') {
      const thisEnabled = settings[key] === 'true';
      const otherEnabled = otherSettings[key] === 'true';
      return `${thisEnabled ? 'Enabled' : 'Disabled'} here, ${otherEnabled ? 'enabled' : 'disabled'} in other profile`;
    }
    return '';
  }, [otherSettings, settings]);

  // Group settings by plugin
  const pluginGroups = useMemo(() => {
    debug('Creating plugin groups', {
      hasSettings: !!settings,
      settingsCount: settings ? Object.keys(settings).length : 0
    });

    if (!settings) return {};
    
    const grouped = groupSettingsByPlugin(settings);
    debug('Grouped settings', {
      pluginCount: Object.keys(grouped).length,
      firstPlugin: Object.keys(grouped)[0]
    });
    
    // Filter groups based on search term
    if (debouncedSearchTerm) {
      const filteredGroups = {};
      Object.entries(grouped).forEach(([plugin, pluginSettings]) => {
        const filteredSettings = {};
        Object.entries(pluginSettings).forEach(([key, value]) => {
          if (
            key.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            value.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
          ) {
            filteredSettings[key] = value;
          }
        });
        if (Object.keys(filteredSettings).length > 0) {
          filteredGroups[plugin] = filteredSettings;
        }
      });
      return filteredGroups;
    }
    
    return grouped;
  }, [settings, debouncedSearchTerm]);

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h6">
          {title} ({Object.keys(settings || {}).length} settings)
        </Typography>
        <ButtonGroup variant="outlined" size="small">
          <Button onClick={onSelectAll}>Select All</Button>
          <Button onClick={onDeselectAll}>Deselect All</Button>
        </ButtonGroup>
        <ButtonGroup variant="outlined" size="small">
          <Button onClick={handleExpandAll}>Expand All</Button>
          <Button onClick={handleCollapseAll}>Collapse All</Button>
        </ButtonGroup>
      </Stack>

      <Stack 
        direction="row" 
        spacing={2} 
        sx={{ mb: 2 }}
      >
        {Object.entries(COLORS).map(([key, { bg, label }]) => (
          <Box 
            key={key}
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Box 
              sx={{ 
                width: 16, 
                height: 16, 
                bgcolor: bg,
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 0.5
              }} 
            />
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
          </Box>
        ))}
      </Stack>
      
      <Box sx={{ position: 'relative', mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search settings..."
          value={searchTerm}
          onChange={handleSearchChange}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: isLoading && (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            )
          }}
        />
      </Box>

      <Paper 
        variant="outlined" 
        sx={{ 
          height: '60vh',
          overflow: 'auto',
          bgcolor: 'background.paper'
        }}
      >
        <Stack spacing={1} sx={{ p: 1 }}>
          {Object.entries(pluginGroups).map(([pluginName, pluginSettings]) => (
            <PluginSection
              key={pluginName}
              pluginName={pluginName}
              settings={pluginSettings}
              otherSettings={otherSettings}
              selectedSettings={selectedSettings}
              onSettingToggle={(key, selected) => {
                if (selected) {
                  const newSelected = [...selectedSettings, key];
                  onSettingToggle(newSelected);
                } else {
                  const newSelected = selectedSettings.filter(k => k !== key);
                  onSettingToggle(newSelected);
                }
              }}
              onBulkToggle={(keys, selected) => {
                if (selected) {
                  const newSelected = [...new Set([...selectedSettings, ...keys])];
                  onSettingToggle(newSelected);
                } else {
                  const newSelected = selectedSettings.filter(k => !keys.includes(k));
                  onSettingToggle(newSelected);
                }
              }}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              getDiffStatus={getDiffStatus}
              expanded={expandedPlugins.has(pluginName)}
              onExpand={handlePluginExpand}
            />
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}

export default React.memo(SettingsDisplay);
