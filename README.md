[<img align="center" width="192px" alt="RuneLite Profile Merger Logo" src="public/logo192.png"/>](https://philhoyt.github.io/runelite-profile-merger)

# RuneLite Profile Merger

A web application that helps you merge settings from multiple RuneLite profiles. This tool makes it easy to combine specific settings from different profiles while maintaining a clear overview of what's being merged.

## Features

- Upload and compare two RuneLite profile configuration files
- Visual comparison of settings differences between profiles
- Color-coded interface to highlight:
  - Settings unique to each profile
  - Settings with different values
  - Plugin enable/disable state differences
- Selective merging of settings
- Bulk selection tools for plugins
- Search functionality to find specific settings
- Expandable/collapsible plugin sections
- Download merged profile as a new configuration file

## Usage

1. Visit [https://philhoyt.github.io/runelite-profile-merger](https://philhoyt.github.io/runelite-profile-merger)
2. Upload two RuneLite profile configuration files (.properties files)
3. Review the differences between the profiles:
   - Blue background: Settings unique to this profile
   - Orange background: Settings with different values in the other profile
   - Purple background: Plugin enabled/disabled differently
4. Select the settings you want to keep from each profile
5. Click "Merge Selected Settings" to create a new profile
6. Download and save your merged profile

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm

### Setup

1. Clone the repository:
```bash
git clone https://github.com/philhoyt/runelite-profile-merger.git
cd runelite-profile-merger
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Build for production:
```bash
npm run build
```

5. Deploy to GitHub Pages:
```bash
npm run deploy
```

## Contributing

Feel free to submit issues and enhancement requests!
