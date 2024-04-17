// @ts-ignore
import {convert} from "html-to-text"

class ContentUtils {

    html2tokens(html: string): Set<any> {
        //console.log("got html", html)
        const text = convert(html, {
            wordwrap: 130
        });
        //console.log("got text", text)
        const text2 = text.replace(/\[[^\]].*/g, '').replaceAll('*', '')
        //console.log("got text2", text2)
        const tokens = text2
            .replaceAll("\\n", " ")
            .replaceAll("[0-9a-fA-F]{8}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{12}", " ")
            .replaceAll("[\u00AD\u002D\u2011]", ' ')
            .replaceAll("\n", " ")
            .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>»«{}\[\]\\\/]/gi, ' ')
            .split(" ")
        // console.log("got token", tokens)
        let res = ""
        const tokenSet = new Set()
        tokens.forEach((t: string) => {
            if (t.length >= 4 && t.length <= 24) {
                res += t + " "
                tokenSet.add(t.toLowerCase())
            }
        })
        // console.log("got token2", tokenSet)
        return tokenSet
    }

    setBaseHref(tabUrl: string, html: string) {
        try {
            let url = new URL(tabUrl)
            // TODO puppeteer seems to have issues with this approach
            const headWithBase = "<head><base href=\"" + url.protocol + "//" + url.hostname + "/\" />"
            //const headWithBase = "<head>"
            console.log("replacing head with ", headWithBase)
            return html.replace("<head>", headWithBase)
        } catch (err) {
            console.log("err", err)
            return ""
        }
    }
}

export default new ContentUtils();
