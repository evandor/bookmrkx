
export enum ExtractorType {
  REGEX = "REGEX",
  HTML_SELECTOR = "HTML_SELECTOR"
}

export enum ExtractorTarget {
  LONG_DESCRIPTION = "tabsets:longDescription"
}

export class Extractor {
  constructor(
    public hostnameMatch: string,
    public type: ExtractorType,
    public target: ExtractorTarget,
    public regex: RegExp | undefined = undefined,
    public selector: string | undefined = undefined
  ) {

  }
}

export class Extractors {
  extractors: Extractor[] = [
    new Extractor(".youtube.com", ExtractorType.REGEX, ExtractorTarget.LONG_DESCRIPTION, /"shortDescription":"([^"]*)/mg),
    new Extractor(".wikipedia.org", ExtractorType.HTML_SELECTOR, ExtractorTarget.LONG_DESCRIPTION, undefined, "#mw-content-text > div.mw-parser-output > p:nth-child(10)"),
    new Extractor("stackoverflow.com", ExtractorType.HTML_SELECTOR, ExtractorTarget.LONG_DESCRIPTION, undefined, "#question > div > div.postcell.post-layout--right > div.s-prose.js-post-body"),
  ]

  // getFeature(f: FeatureIdent): AppFeature | undefined {
  //   const found = _.filter(this.features, (feature: AppFeature) => feature.ident === f)
  //   if (found && found.length > 0) {
  //     return found[0]
  //   }
  //   return undefined
  // }
  //
  getExtractors(): Extractor[] {
    return this.extractors
  }
}
