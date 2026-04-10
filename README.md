# New Tab Extension

A customizable new-tab page extension for Chromium and Firefox.

## Features

- Multiple search engines support (Google, Bing, DuckDuckGo, etc.)
- Customizable favorite websites and folder groups
- Configurable via YAML file
- Cross-browser internal URL compatibility (keep `chrome://` format in config)
  - Chromium: open `chrome://...` directly
  - Firefox: map selected `chrome://...` entries to extension pages and read data via extension APIs
- Refreshed design language with responsive layout and modal settings
- 3 locales: `zh-CN`, `zh-TW`, `en-US`

## Configuration

The extension uses a YAML configuration file to manage search engines and favorite sites.

Example:

```yaml
searchEngines:
  - name: "Google"
    url: "https://www.google.com/search?q=%s"

favoriteSites:
  - name: "browser history"
    url: "chrome://history/"
  - name: "browser bookmarks"
    url: "chrome://bookmarks/"
  - name: "YouTube"
    url: "https://www.youtube.com"
```

## Firefox Compatibility Notes

- Keep `public/config.yaml` in Chrome URL style (`chrome://history/`, `chrome://bookmarks/`).
- Firefox blocks direct opening of many privileged `about:*` pages from extension scripts.
- To provide equivalent behavior, this project maps:
  - `chrome://history/` -> `firefox/history.html` (uses `history` API)
  - `chrome://bookmarks/` -> `firefox/bookmarks.html` (uses `bookmarks` API)
- Required Firefox permissions: `tabs`, `history`, `bookmarks`.

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build web app
npm run build

# Build Chromium extension package
npm run extension

# Build Firefox extension package
npm run extension:firefox
```

## Load Extension (Temporary)

Chromium:
1. Run `npm run extension`
2. Open extensions page and load unpacked `dist/`

Firefox:
1. Run `npm run extension:firefox`
2. Open `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on..." and choose `dist/manifest.json`

## Notes

- This repo currently uses build output (`dist/`) directly for local testing.
- If you build for both browsers, the latest command overwrites `dist/`.
