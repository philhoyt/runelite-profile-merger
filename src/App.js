import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Button, 
  Typography,
  Stack,
  Snackbar,
  Alert,
  Grid
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import MergeIcon from '@mui/icons-material/MergeType';
import SettingsDisplay from './components/SettingsDisplay';

function App() {
  const [profile1, setProfile1] = useState(null);
  const [profile2, setProfile2] = useState(null);
  const [selectedSettings1, setSelectedSettings1] = useState([]);
  const [selectedSettings2, setSelectedSettings2] = useState([]);
  const [searchTerm1, setSearchTerm1] = useState('');
  const [searchTerm2, setSearchTerm2] = useState('');
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  const handleFileSelect = (profileSetter, settingsSelector) => (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const settings = {};
          
          text.split('\n').forEach(line => {
            if (line && !line.startsWith('#')) {
              const [key, value] = line.split('=');
              if (key && value) {
                settings[key.trim()] = value.trim();
              }
            }
          });
          
          profileSetter(settings);
          settingsSelector([]); // Start with no settings selected
          setAlert({
            open: true,
            message: 'Profile loaded successfully',
            severity: 'success'
          });
        } catch (error) {
          setAlert({
            open: true,
            message: 'Error loading profile',
            severity: 'error'
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const handleMerge = () => {
    if (!profile1 || !profile2) {
      setAlert({
        open: true,
        message: 'Please load both profiles first',
        severity: 'error'
      });
      return;
    }

    const mergedSettings = {};
    
    // Add selected settings from profile 1
    selectedSettings1.forEach(key => {
      if (profile1[key]) {
        mergedSettings[key] = profile1[key];
      }
    });

    // Add selected settings from profile 2 (will override profile 1 if same key)
    selectedSettings2.forEach(key => {
      if (profile2[key]) {
        mergedSettings[key] = profile2[key];
      }
    });

    // Create the merged file content
    let fileContent = '#RuneLite configuration\n#' + new Date().toISOString() + '\n';
    Object.entries(mergedSettings).forEach(([key, value]) => {
      fileContent += `${key}=${value}\n`;
    });

    // Create and download the file
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'merged-runelite.properties';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setAlert({
      open: true,
      message: 'Profiles merged and downloaded successfully',
      severity: 'success'
    });
  };

  const handleSettingsToggle = (profile, setSelectedSettings) => (newSelected) => {
    setSelectedSettings(newSelected);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        RuneLite Profile Merger
      </Typography>

      <Stack spacing={2} direction="row" justifyContent="center" sx={{ mb: 4 }}>
        <Box>
          <input
            accept=".properties"
            style={{ display: 'none' }}
            id="profile1-button"
            type="file"
            onChange={handleFileSelect(setProfile1, setSelectedSettings1)}
          />
          <label htmlFor="profile1-button">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadFileIcon />}
            >
              Load Profile 1
            </Button>
          </label>
        </Box>

        <Box>
          <input
            accept=".properties"
            style={{ display: 'none' }}
            id="profile2-button"
            type="file"
            onChange={handleFileSelect(setProfile2, setSelectedSettings2)}
          />
          <label htmlFor="profile2-button">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadFileIcon />}
            >
              Load Profile 2
            </Button>
          </label>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<MergeIcon />}
          onClick={handleMerge}
          disabled={!profile1 || !profile2}
        >
          Merge & Download
        </Button>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <SettingsDisplay
            title="Profile 1"
            settings={profile1}
            otherSettings={profile2}
            selectedSettings={selectedSettings1}
            onSettingToggle={handleSettingsToggle(profile1, setSelectedSettings1)}
            searchTerm={searchTerm1}
            onSearchChange={setSearchTerm1}
            onSelectAll={() => setSelectedSettings1(Object.keys(profile1 || {}))}
            onDeselectAll={() => setSelectedSettings1([])}
          />
        </Grid>
        <Grid item xs={6}>
          <SettingsDisplay
            title="Profile 2"
            settings={profile2}
            otherSettings={profile1}
            selectedSettings={selectedSettings2}
            onSettingToggle={handleSettingsToggle(profile2, setSelectedSettings2)}
            searchTerm={searchTerm2}
            onSearchChange={setSearchTerm2}
            onSelectAll={() => setSelectedSettings2(Object.keys(profile2 || {}))}
            onDeselectAll={() => setSelectedSettings2([])}
          />
        </Grid>
      </Grid>

      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
