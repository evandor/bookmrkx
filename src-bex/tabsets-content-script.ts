// Hooks added here have a bridge allowing communication between the BEX Content Script and the Quasar Application.
// More info: https://quasar.dev/quasar-cli/developing-browser-extensions/content-hooks
// @ts-ignore
import {bexContent} from 'quasar/wrappers'
import {CURRENT_USER_EMAIL} from "boot/constants";


export default bexContent((bridge: any) => {

  // @ts-ignore
  if (window.contentScriptAnalysisAlredyCalled) {
    // https://stackoverflow.com/questions/23208134/avoid-dynamically-injecting-the-same-script-multiple-times-when-using-chrome-tab
    //console.debug("stopping execution of tabsets-content-script as it is already setup")
    return
  }

  console.log("tabsets: initializing content script for tab analysis")
  // @ts-ignore
  window.contentScriptAnalysisAlredyCalled  = true


  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("got request!!!", request)
    if (request === 'getContent') {
      console.log("tabsets: received message for content", document.documentElement.outerHTML)
      sendResponse({content: document.documentElement.outerHTML});
    } else if (request.action === "highlight-annotation") {
      sendResponse()
    }
    else if (request.type === "SET_EMAIL_FOR_SIGN_IN") {
      chrome.storage.local.set({ CURRENT_USER_EMAIL: request.email });
      chrome.storage.local.set({ tabext: sender.tab });
      console.log("SET_EMAIL_FOR_SIGN_IN", request.email);
    }
    sendResponse({content: "unknown request in tabsets-content-scripts: " + request});
    return true
  })

  function getMetas(document: Document) {
    const result: { [k: string]: string } = {}
    //const res: string[] = []
    const metaNodes: NodeList = document.querySelectorAll('meta')
    metaNodes.forEach((node: Node) => {
      const element = <Element>node
      //console.log("node", <Element>node)
      const nameAttr = element.attributes.getNamedItem('name')
      const propAttr = element.attributes.getNamedItem('property')
      const contAttr = element.attributes.getNamedItem('content')
      const key: string = nameAttr ? (nameAttr.value.trim().toLowerCase() || 'undefName') : (propAttr?.value || 'undefProp')
      //console.log("key", key, contAttr?.value || 'x')
      if (key) {
        result[key] = contAttr?.value || ''
      }
      // res.push((element.attributes.getNamedItem('name')?.textContent) || 'undef')
    })
    return result
  }

  function getAnchors(document: Document) {
    const result: { [k: string]: number } = {}
    const linkNodes: NodeList = document.querySelectorAll('a')
    linkNodes.forEach((node: Node) => {
      const element = <Element>node
      const hrefAttr = element.attributes.getNamedItem('href')
      if (hrefAttr && hrefAttr.value.trim() !== "") {
        const key: string = hrefAttr.value
        if (result[key]) {
          result[key] = result[key] + 1
        } else {
          result[key] = 1
        }
      }
    })
    return result
  }

  function getLinks(document: Document) {
    const result: object[] = []
    const linkNodes: NodeList = document.querySelectorAll('link')
    linkNodes.forEach((node: Node) => {
      const element = <Element>node
      const titleAttr = element.attributes.getNamedItem('title')
      const hrefAttr = element.attributes.getNamedItem('href')
      const typeAttr = element.attributes.getNamedItem('type')
      const relAttr = element.attributes.getNamedItem('rel')
      if (hrefAttr && hrefAttr.value.trim() !== "") {
        result.push({
          title: titleAttr?.value || '',
          href: hrefAttr?.value || '',
          type: typeAttr?.value || '',
          rel: relAttr?.value || ''
        })
      }
    })
    return result
  }

  chrome.runtime.sendMessage({
    msg: "html2text",
    html: document.documentElement.outerHTML,
    metas: getMetas(document)
  }, function (response) {
    console.log("tabsets: created text excerpt for tabsets")
    if (chrome.runtime.lastError) {
      console.warn("got runtime error", chrome.runtime.lastError)
    }
  });

  chrome.runtime.sendMessage({
    msg: "html2links",
    anchors: getAnchors(document),
    links: getLinks(document)
  }, function (response) {
    console.log("tabsets: created links excerpt for tabsets")
    if (chrome.runtime.lastError) {
      console.warn("got runtime error", chrome.runtime.lastError)
    }
  });


})
