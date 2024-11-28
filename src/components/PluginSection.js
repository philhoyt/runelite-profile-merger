import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FixedSizeList as List } from 'react-window';

const ITEM_SIZE = 60;

function PluginSection({
  pluginName,
  settings,
  otherSettings,
  selectedSettings,
  onSettingToggle,
  onBulkToggle,
  getStatusColor,
  getStatusText,
  getDiffStatus,
  expanded,
  onExpand
}) {
  console.log('PluginSection Props:', {
    pluginName,
    settingsCount: Object.keys(settings).length,
    selectedCount: selectedSettings.length,
    selectedSettings
  });

  const [localExpanded, setLocalExpanded] = useState(expanded);

  useEffect(() => {
    setLocalExpanded(expanded);
  }, [expanded]);

  const settingsArray = Object.entries(settings);

  // Check if this plugin has an enabled/disabled setting
  const pluginEnabledKey = `runelite.${pluginName.toLowerCase()}plugin`;
  const isPluginEnabled = settings[pluginEnabledKey] === 'true';
  const hasPluginToggle = pluginEnabledKey in settings;

  // Get status color for plugin state
  const getPluginStateColor = () => {
    if (!hasPluginToggle) return 'text.disabled';
    const diffStatus = getDiffStatus(pluginEnabledKey, settings[pluginEnabledKey]);
    if (diffStatus === 'pluginStateChange') {
      return 'secondary.main';
    }
    return isPluginEnabled ? 'success.main' : 'text.disabled';
  };

  const getPluginStateText = () => {
    if (!hasPluginToggle) return '';
    const diffStatus = getDiffStatus(pluginEnabledKey, settings[pluginEnabledKey]);
    if (diffStatus === 'pluginStateChange') {
      return getStatusText(pluginEnabledKey, diffStatus);
    }
    return isPluginEnabled ? 'Enabled' : 'Disabled';
  };

  const handleSelectAll = (event) => {
    event.stopPropagation();
    const keys = Object.keys(settings);
    const allSelected = keys.every(key => selectedSettings.includes(key));
    console.log('handleSelectAll:', {
      pluginName,
      keys,
      allSelected,
      action: allSelected ? 'deselecting' : 'selecting'
    });
    onBulkToggle(keys, !allSelected);
  };

  const Row = useCallback(({ index, style }) => {
    const [key, value] = settingsArray[index];
    const diffStatus = getDiffStatus(key, value);
    const isSelected = selectedSettings.includes(key);

    const handleToggle = () => {
      console.log('Row Toggle:', {
        key,
        currentlySelected: isSelected,
        action: isSelected ? 'deselecting' : 'selecting'
      });
      onSettingToggle(key, !isSelected);
    };

    return (
      <div style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        padding: '8px 16px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        backgroundColor: getStatusColor(diffStatus)
      }}>
        <Checkbox
          edge="start"
          checked={isSelected}
          onChange={handleToggle}
          size="small"
        />
        <Box sx={{ ml: 2, overflow: 'hidden' }}>
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.9rem',
              wordBreak: 'break-all'
            }}
          >
            {key.split('.').slice(1).join('.')}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              fontSize: '0.8rem',
              wordBreak: 'break-all'
            }}
          >
            {value}
          </Typography>
          {diffStatus !== 'same' && (
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block',
                color: 'text.secondary',
                fontStyle: 'italic',
                mt: 0.5
              }}
            >
              {getStatusText(key, diffStatus)}
            </Typography>
          )}
        </Box>
      </div>
    );
  }, [settingsArray, selectedSettings, onSettingToggle, getDiffStatus, getStatusColor, getStatusText]);

  const handleAccordionChange = (event, isExpanded) => {
    setLocalExpanded(isExpanded);
    onExpand(pluginName, isExpanded);
  };

  const allSelected = Object.keys(settings).every(key => selectedSettings.includes(key));
  const someSelected = Object.keys(settings).some(key => selectedSettings.includes(key));

  return (
    <Accordion 
      expanded={localExpanded}
      onChange={handleAccordionChange}
      TransitionProps={{ unmountOnExit: true }}
      sx={{ width: '100%' }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack 
          direction="row" 
          spacing={2} 
          alignItems="center" 
          sx={{ width: '100%' }}
        >
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected && !allSelected}
            onChange={handleSelectAll}
            onClick={(e) => e.stopPropagation()}
            size="small"
          />
          <Typography>
            {pluginName} ({Object.keys(settings).length} settings)
            {hasPluginToggle && (
              <Typography 
                component="span" 
                sx={{ 
                  ml: 1,
                  color: getPluginStateColor(),
                  fontSize: '0.8em',
                  fontStyle: getDiffStatus(pluginEnabledKey, settings[pluginEnabledKey]) === 'pluginStateChange' ? 'italic' : 'normal'
                }}
              >
                ({getPluginStateText()})
              </Typography>
            )}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <List
          height={Math.min(settingsArray.length * ITEM_SIZE, 400)}
          itemCount={settingsArray.length}
          itemSize={ITEM_SIZE}
          width="100%"
        >
          {Row}
        </List>
      </AccordionDetails>
    </Accordion>
  );
}

export default React.memo(PluginSection);
