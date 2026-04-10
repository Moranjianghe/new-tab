# New Tab Extension

A customizable new-tab page extension for Chromium and Firefox.

## Features

- Multiple search engines support (Google, Bing, DuckDuckGo, etc.)
- Customizable favorite websites and folder groups
- Configurable via YAML file
- Browser internal page mapping for Firefox (`chrome://` => `about:`)
- Refreshed design language with responsive layout and modal settings

## Configuration

The extension uses a YAML configuration file to manage search engines and favorite sites.

Example:

```yaml
searchEngines:
  - name: "Google"
    url: "https://www.google.com/search?q=%s"

favoriteSites:
  - name: "YouTube"
    url: "https://www.youtube.com"
```

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
