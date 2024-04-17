// Hooks added here have a bridge allowing communication between the BEX Content Script and the Quasar Application.
// More info: https://quasar.dev/quasar-cli/developing-browser-extensions/content-hooks
// @ts-ignore
import {bexContent} from 'quasar/wrappers'

function createIframe() {
  const iframe = document.createElement("iframe");
  iframe.id = "ts-contentscript-iframe"
  iframe.width = "40px";
  iframe.height = "30px";

  Object.assign(iframe.style, {
    position: "fixed",
    right: "0px",
    top: "80px",
    border: "none",
    zIndex: "2147483647",
  });

  // load that specific page
  iframe.src = chrome.runtime.getURL("/www/index.html#/contentscript");
  //console.log("iframe.src", iframe.src)

  return iframe;
}

export default bexContent((bridge: any) => {

  // @ts-ignore
  if (window.contentScriptAlredyCalled) {
    // https://stackoverflow.com/questions/23208134/avoid-dynamically-injecting-the-same-script-multiple-times-when-using-chrome-tab
    //console.debug("stopping execution of content-script as it is already setup")
    return
  }

  const csIframe = createIframe()
  document.body.append(csIframe);

  const script = document.createElement("script");
  script.setAttribute("type", 'text/javascript');
  script.src = chrome.runtime.getURL('www/js/content-script-support.js');
  document.body.append(script);

  console.log("tabsets: initializing content script for tab helper")
  // @ts-ignore
  window.contentScriptAlredyCalled = true

})
