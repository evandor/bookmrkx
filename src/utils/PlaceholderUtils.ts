import {Tab} from "src/models/Tab";
import {Placeholders, PlaceholdersType} from "src/models/Placeholders";

class PH {

    constructor(public replacement: string, public values: Map<string, string>) {
    }

}

class PlaceholderUtils {

    defaultPlaceholders: Map<RegExp, PH> = new Map(
        [
            [/^(.*)(github\.com)\/([^\/]*)\/([^\/]*)\/($)/gm, new PH("$1$2/$3/$4/${path}", new Map([['path', 'actions,issues']]))],
            [/^(.*)(sueddeutsche\.de)\/($)/gm, new PH("$1$2/$3${path}", new Map([['path', 'muenchen,sport,bayern']]))]
        ]
    )


    applyForDefaultDomains(tab: Tab): Tab {
        const url = tab.url
        if (url) {
            for (const regex of this.defaultPlaceholders.keys()) {
                if (url.match(regex)) {
                    console.log("got match", url, regex)
                    const val = this.defaultPlaceholders.get(regex)
                    if (val) {
                        console.log("found val", val)
                        const substitutions = [...val.values.keys()]
                        console.log("found substitutions", substitutions)
                        const replacement = url.replace(regex, val['replacement' as keyof object])
                        console.log("replacement", replacement)
                        tab.url = replacement
                        tab = this.apply(tab, substitutions, val.values)
                    }
                }
            }
        }
        return tab
    }

    apply(tab: Tab, placeholders: string[], placeholderValues: Map<string, string>) {
        var config: { [k: string]: any } = {};
        for (const p of placeholders) {
            config[p] = placeholderValues.get(p)
        }
        console.log("got config", config, Object.keys(config))
        Object.keys(config).length > 0 ?
            tab.placeholders = new Placeholders(PlaceholdersType.URL_SUBSTITUTION, tab.id, config) :
            tab.placeholders = undefined
        return tab
    }


}

export default new PlaceholderUtils();
