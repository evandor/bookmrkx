import {bexBackground} from 'quasar/wrappers';
import OnInstalledReason = chrome.runtime.OnInstalledReason;

// https://stackoverflow.com/questions/49739438/when-and-how-does-a-pwa-update-itself
const updateTrigger = 10

// https://developer.chrome.com/docs/extensions/mv3/tut_analytics/
//console.log("ga: installing google analytics")

addEventListener('unhandledrejection', async (event) => {
  console.log("[service-worker] ga: fire error event", event)
  // getting error: Service worker registration failed. Status code: 15
  //Analytics.fireErrorEvent(event.reason);
});

chrome.runtime.onInstalled.addListener((callback) => {
  console.log("[service-worker] ga: fire event install", callback.reason, callback.previousVersion)
  // getting error: "Service worker registration failed. Status code: 15"
  // Analytics.fireEvent('install-' + callback.reason);
  if (callback.reason !== OnInstalledReason.CHROME_UPDATE) {
    chrome.tabs.create({
      active: true,
      url: callback.previousVersion ?
        "https://docs.tabsets.net/release-notes" :
        "https://tabsets.web.app/#/installed/"
    })
  }
  if (chrome.runtime.lastError) {
    console.warn("got runtime error", chrome.runtime.lastError)
  }
});

chrome.omnibox.onInputEntered.addListener((text) => {
  const newURL = chrome.runtime.getURL("/www/index.html#/searchresult?t=" + encodeURIComponent(text))
  chrome.tabs.create({url: newURL})
    .catch((err) => console.log("[service-worker] background.js error", err))
});

// @ts-ignore
if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
  // @ts-ignore
  chrome.sidePanel
    .setPanelBehavior({openPanelOnActionClick: true})
    .catch((error: any) => console.error(error));
}

chrome.runtime.onInstalled.addListener((details) => {
  console.debug("adding onInstalled listener in background.ts", details)
  if (chrome.runtime.lastError) {
    console.warn("got runtime error", chrome.runtime.lastError)
  }
  // @ts-ignore
  if (chrome.action) {
    // @ts-ignore
    chrome.action.onClicked.addListener((tab) => {
      chrome.tabs.create(
        {
          url: chrome.runtime.getURL('www/index.html'),
        },
        (newTab) => {
          console.log("[service-worker] newTab", newTab)
        }
      );
    });
  } else {
    // @ts-ignore
    //browser.browserAction.onClicked.addListener(openMyPage);
  }
});

chrome.runtime.onStartup.addListener(() => {
  console.log("[service-worker] adding onStartup listener in background.ts")
  // @ts-ignore
  if (chrome.action) {
    // @ts-ignore
    chrome.action.onClicked.addListener((tab) => {
      // Opens our extension in a new browser window.
      // Only if a popup isn't defined in the manifest.

      chrome.tabs.create(
        {
          url: chrome.runtime.getURL('www/index.html'),
        },
        (newTab) => {
          console.log("[service-worker] newTab", newTab)
        }
      );
    });
  }
})

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === 'tabsetsSidepanel') {
    //console.log("[service-worker] port3", port)
    port.onDisconnect.addListener(async () => {
      //alert('Sidepanel closed.');
    });
  }
});


export default bexBackground((bridge, cons/* , allActiveConnections */) => {


});
