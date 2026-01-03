# Komodo Stack Monitor - Stream Deck Plugin

A Stream Deck plugin to monitor your [Komodo](https://komo.do/) stacks directly from your Stream Deck.

## Features

- **Real-time monitoring**: View stack status (running/stopped) with color indicators
- **Service count**: See how many services are running in each stack
- **Multiple instances**: Configure different Komodo instances per button
- **Quick actions**:
  - **Short press**: Refresh stack status
  - **Long press (1.5s)**: Open Komodo dashboard in browser
- **Auto-refresh**: Configurable refresh interval (15s to 5min)

## Screenshots

| Running | Stopped |
|---------|---------|
| Green indicator | Red indicator |

## Installation

### From Release

1. Download the latest `.streamDeckPlugin` file from [Releases](../../releases)
2. Double-click to install

### From Source

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/streamdeck-komodo.git
cd streamdeck-komodo

# Install dependencies
npm install

# Build and deploy
npm run dev
```

## Configuration

1. Add a "Stack Status" action to your Stream Deck
2. Configure in the Property Inspector:
   - **Komodo URL**: Your Komodo instance URL (e.g., `https://komodo.example.com`)
   - **API Key**: Your Komodo API key
   - **API Secret**: Your Komodo API secret
   - **Stack**: Select the stack to monitor
   - **Refresh Interval**: How often to refresh (default: 30s)

### Getting API Credentials

1. Log into your Komodo dashboard
2. Go to Settings > API Keys
3. Create a new API key with read permissions

## Development

```bash
# Watch mode (auto-rebuild on changes)
npm run watch

# Build only
npm run build

# Build with icons
npm run build:full

# Deploy to Stream Deck
npm run deploy

# Build and deploy
npm run dev
```

## Project Structure

```
streamdeck-komodo/
├── src/
│   ├── plugin.ts                 # Entry point
│   ├── actions/
│   │   └── stack-status.ts       # Main action logic
│   ├── services/
│   │   ├── komodo-api.ts         # Komodo API client
│   │   └── icon-generator.ts     # Dynamic SVG icons
│   ├── types/
│   │   └── settings.ts           # TypeScript interfaces
│   └── utils/
│       └── browser.ts            # Browser opener utility
├── com.komodo.stack-monitor.sdPlugin/
│   ├── manifest.json             # Stream Deck manifest
│   ├── imgs/                     # Plugin icons
│   └── ui/
│       └── stack-status.html     # Property Inspector
├── scripts/
│   ├── convert-icons.mjs         # SVG to PNG converter
│   └── deploy.mjs                # Deployment script
└── package.json
```

## Requirements

- Stream Deck 6.5+
- Node.js 20+
- Komodo instance with API access

## License

MIT
