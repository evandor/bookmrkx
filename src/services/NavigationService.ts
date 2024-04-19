import {openURL, uid} from "quasar";
import {useNotificationHandler} from "src/services/ErrorHandler";

const {handleSuccess} = useNotificationHandler()

class NavigationService {

    placeholderPattern = /\${[^}]*}/gm

    async openChromeTab(chromeTab: chrome.tabs.Tab) {
        const window = await chrome.tabs.highlight({windowId: chromeTab.windowId, tabs: chromeTab.index})
        if (typeof window.id === "number") {
            await chrome.windows.update(window.id, {focused: true})
        }
    }

    async openOrCreateTab(
        withUrls: string[],
        matcher: string | undefined = undefined,
        groups: string[] = [],
        forceCurrent: boolean = false,
        forceReload: boolean = false
    ) {
        withUrls.map(u => u.replace(this.placeholderPattern, ""));
        const useWindowIdent = this.getUseWindowIdent(forceCurrent, withUrls)
        console.log(` > opening url(s) ${withUrls} in window: '${useWindowIdent}', groups: '${groups}', mode: '${process.env.MODE}'`)


        openURL(withUrls[0])

    }

    private getUseWindowIdent(forceCurrent: boolean, urls: string[]) {
        return 'current'
    }

    async openSingleTab(url: string): Promise<chrome.tabs.Tab> {
        return await chrome.tabs.create({url: url})
    }

}

export default new NavigationService();

