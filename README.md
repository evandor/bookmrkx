# Tabsets Extension

Browser Extension to manage tabsets:

# Features

* Turn your open tabs into a tabset
* Re-open your tabsets or tabs whenever you need them
* Edit tabsets
* Search for keywords in your tabsets
* Drag & drop tabs into tabsets
* Export and Import Tabsets Data
* Search in Tabs (experimental)
* Keep pinned and grouped tabsets (experimental)
* Thumbnails Preview (experimental)
* Dark Mode (experimental)
* All data remains on your computer - no backend communication whatsoever
* Open source

There will be a pro tabsets extension with some advanced features as well.

## Install the dependencies
```bash
yarn install
```
or
```bash
npm install
```

### Start the app in development mode
```bash
quasar dev -m bex
```

and add to chrome as local extension:

see https://quasar.dev/quasar-cli-vite/developing-browser-extensions/build-commands#chrome

## Tabsets as Chrome Extension

You can try the current version directly at

https://chrome.google.com/webstore/detail/tabsets-extension/afkknkdbgondbbfjehipnjmojndnjhjg

## Tabsets as Edge Extension

You can try the current version directly at

https://microsoftedge.microsoft.com/addons/detail/tabsets/fpgjmlhdgphgoomhjncpldnhjhklplak

## Tabsets as Firefox Extension

You can try the current version directly at

https://addons.mozilla.org/de/firefox/addon/tabsets/

## Safari

check out branch "safari-extension" (work in progress)

xcrun safari-web-extension-converter --project-location ./dist/Safari --app-name Tabsets /Users/carstengraef/projects/github/tabsets/dist/bex
