import {useUiStore} from "stores/uiStore";

class JsUtils {

    runCssHighlight() {
        const term = useUiStore().highlightTerm
        if (!term || term.trim().length === 0) {
            return
        }

        const main = document.body;

        const treeWalker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
        const allTextNodes: any[] = [];
        let currentNode = treeWalker.nextNode();
        while (currentNode) {
            // console.log("walking tree", currentNode)
            allTextNodes.push(currentNode);
            currentNode = treeWalker.nextNode();
        }
        // @ts-ignore
        CSS.highlights.clear();


        const ranges = allTextNodes
            .map((el) => {
                return {el, text: el.textContent.toLowerCase()};
            })
            .filter(({text}) => text.includes(term))
            .map(({text, el}) => {
                // Find all instances of str in el.textContent
                const indices = [];
                let startPos = 0;
                while (startPos < text.length) {
                    const index = text.indexOf(term, startPos);
                    if (index === -1) break;
                    indices.push(index);
                    startPos = index + term.length;
                }

                return indices.map((index) => {
                    const range = new Range();
                    range.setStart(el, index);
                    range.setEnd(el, index + term.length);
                    return range;
                });
            });

        // @ts-ignore
        const highlight = new Highlight(...ranges.flat());
        // @ts-ignore
        CSS.highlights.set("search-result-highlight", highlight);
    }

    match(patternStr: string , path:string): boolean {
        const split = patternStr.split("|")
        if (split.length !== 2) {
            return false
        }
        const type = split[0]
        const pattern = split[1]
        if (pattern === path) {
            return true
        }
        switch (type) {
            case "sw":
                return path.startsWith(pattern)
            default:
                return false
        }
    }

    // async getOrCreateClientId() {
    //     if (!chrome) {
    //         return Promise.resolve("")
    //     }
    //     const result = await browser.storage.local.get('clientId');
    //     let clientId = result.clientId;
    //     if (!clientId) {
    //         clientId = self.crypto.randomUUID();
    //         await browser.storage.local.set({clientId});
    //     }
    //     return clientId;
    // }

    // gaEvent(name: string, params: object) {
    //     const GA_ENDPOINT = 'https://www.google-analytics.com/mp/collect';
    //     const MEASUREMENT_ID = "G-XBYXVZ86J1";
    //     const API_SECRET = "1N_ivSMnT2GHqZMcoXJDTw";
    //     this.getOrCreateClientId()
    //         .then(clientId => {
    //             fetch(`${GA_ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`,
    //                 {
    //                     method: 'POST',
    //                     body: JSON.stringify({
    //                         client_id: clientId,
    //                         events: [{name: name, params: params,}],
    //                     }),
    //                 }
    //             );
    //         })
    // }

}

export default new JsUtils();
