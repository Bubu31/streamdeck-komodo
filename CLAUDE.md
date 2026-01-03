# CLAUDE.md - Komodo Stack Monitor

## Project Overview

Stream Deck plugin for monitoring Komodo stacks. Built with TypeScript and the Elgato Stream Deck SDK v2.

## Tech Stack

- **Runtime**: Node.js 20
- **Language**: TypeScript 5
- **SDK**: @elgato/streamdeck v2.0.0
- **Bundler**: Rollup 4
- **Image Processing**: Sharp (for icon conversion)

## Key Files

| File | Purpose |
|------|---------|
| `src/actions/stack-status.ts` | Main action logic, event handling, refresh intervals |
| `src/services/komodo-api.ts` | Komodo REST API client |
| `src/services/icon-generator.ts` | Dynamic SVG icon generation |
| `src/types/settings.ts` | TypeScript interfaces |
| `com.komodo.stack-monitor.sdPlugin/ui/stack-status.html` | Property Inspector UI |
| `com.komodo.stack-monitor.sdPlugin/manifest.json` | Stream Deck plugin manifest |

## Commands

```bash
npm run dev          # Build + deploy (main development command)
npm run build        # TypeScript compilation only
npm run build:full   # Icons + TypeScript
npm run watch        # Auto-rebuild on file changes
npm run deploy       # Deploy to Stream Deck (stops/starts SD)
npm run icons        # Convert SVG to PNG
```

## Architecture Notes

### Settings Structure

Settings are **per-action** (not global), allowing multiple Komodo instances:

```typescript
interface StackStatusSettings {
  komodoUrl: string;      // Komodo instance URL
  apiKey: string;         // API key
  apiSecret: string;      // API secret
  stackId: string;        // Selected stack ID
  stackName: string;      // Stack name for display
  refreshInterval: number; // Refresh in seconds
}
```

### Komodo API

- Uses `ListStacks` endpoint for status info (not `GetStack` which lacks status/services)
- Endpoints: POST to `/read/ListStacks`, `/read/GetStack`
- Auth headers: `X-API-KEY`, `X-API-SECRET`

### Icon States

| State | Border Color | Background |
|-------|--------------|------------|
| Running | Green (#3fb950) | Dark green (#0d2818) |
| Stopped | Red (#f85149) | Dark red (#2d1418) |
| Restarting | Yellow (#d29922) | Dark yellow (#2d2418) |
| Unknown | Gray (#8b949e) | Dark gray (#1a1a1a) |

### Action Behavior

- **Short press**: Force refresh
- **Long press (>1.5s)**: Open Komodo dashboard in browser

### Property Inspector

Uses direct WebSocket communication (not SDPI Components SDK) for reliability.

## Deployment

Plugin is deployed to: `%APPDATA%\Elgato\StreamDeck\Plugins\com.komodo.stack-monitor.sdPlugin`

The `npm run dev` command:
1. Converts SVG icons to PNG
2. Compiles TypeScript with Rollup
3. Stops Stream Deck
4. Copies plugin files
5. Restarts Stream Deck
