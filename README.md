# New Tab Extension

A simple and customizable new tab extension for Chrome. Provides quick access to search engines and favorite websites.

## Features

- Multiple search engines support (Google, Bing, DuckDuckGo, etc.)
- Customizable favorite websites list
- Configurable via YAML file
- Offline support with local storage cache
- Clean and minimalist interface

## Configuration

The extension uses a YAML configuration file to manage search engines and favorite sites. You can modify config url to customize:

- Search engines
- Favorite websites

Example configuration:

```yaml
searchEngines:
  - name: "Google"
    url: "https://www.google.com/search?q="
  - name: "Bing"
    url: "https://www.bing.com/search?q="

favoriteSites:
  - name: "YouTube"
    url: "https://www.youtube.com"
  - name: "GitHub"
    url: "https://github.com"
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Build browser extension
npm run extension
```
