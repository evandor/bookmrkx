import {formatDistance} from "date-fns";
import sanitizeHtml from "sanitize-html";
import {Tab} from "src/models/Tab";
import {useWindowsStore} from "stores/windowsStore";
import _ from "lodash";

export function useUtils() {

  const formatDate = (timestamp: number | undefined) =>
    timestamp ? formatDistance(timestamp, new Date(), {addSuffix: true}) : ""

  const createDataTestIdentifier = (prefix: string, url: string) =>
    prefix + "_" + url.replace("https://", "").replaceAll('.', '').replaceAll("/", "")

  const inBexMode = () => process.env.MODE === 'bex'
  const modeIs = (ident: string) => process.env.MODE === ident

  const normalize = (url: string): string => {
    try {
      new URL(url)
      return url
    } catch (err) {
      return "https://" + url
    }
  }

  const sanitize = (input: string): string => {
    return sanitizeHtml(input, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      allowedAttributes: sanitizeHtml.defaults.allowedAttributes = {
        a: ['href', 'name', 'target'],
        img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading']
      },
      allowedSchemesByTag: {
        img: ['data']
      }
    })
  }

  const sanitizeAsText = (input: string): string => {
    return sanitizeHtml(input, {
      allowedTags: sanitizeHtml.defaults.allowedTags,//.concat(['img']),
      allowedAttributes: sanitizeHtml.defaults.allowedAttributes = {
        a: ['href', 'name', 'target']
      }
    })
  }

  const sendMsg = (msgName: string, data: object = {}) => {
    if (inBexMode() && chrome) {
      console.debug(" >>> sending message", {name: msgName, data})
      chrome.runtime.sendMessage({
        name: msgName, data: data
      }, (callback: any) => {
        if (callback) {
          console.log("got callback", callback)
        }
        if (chrome.runtime.lastError) { /* ignore */
          console.debug("Logging error after sendMsg", msgName, chrome.runtime.lastError)
        }
      });
    }
  }
  const isCurrentTab = (tab: Tab) => {
    return false
  }

  function urlToHost(url: string): string {
    try {
      const theURL = new URL(url)
      return theURL.host
    } catch (err) {
      return null as unknown as string
    }
  }

  const calcHostList = (tabs: chrome.tabs.Tab[]): string[] => {
    const stringArray = Array.from(new Set(_.map(tabs, bwTabs => urlToHost(bwTabs.url || ''))))
    return _.filter(stringArray, (e: string | undefined) => e !== null)
  }

  const favIconFromUrl = (url: string): string => {
    let theRealUrl
    try {
      theRealUrl = new URL(url)
    } catch (err) {
      if (!url.startsWith('http')) {
        url = 'https://' + url
        try {
          theRealUrl = new URL(url)
        } catch (err) {
        }
      }
    }
    return theRealUrl ? "https://icons.duckduckgo.com/ip3/" + theRealUrl.hostname + ".ico" : ''
  }

  return {
    formatDate,
    createDataTestIdentifier,
    inBexMode,
    normalize,
    modeIs,
    sanitize,
    sanitizeAsText,
    sendMsg,
    isCurrentTab,
    calcHostList,
    favIconFromUrl
  }
}
