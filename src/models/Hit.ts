export class Hit {
  lastActive: number
  activatedCount: number
  loadedCount: number
  history: string[] = []
  selected: boolean = false
  name: string | undefined
  bookmarkUrl: string | undefined
  bookmarkId: string | undefined

  constructor(
    public id: string,
    //public chromeTab: chrome.tabs.Tab,
    public title: string,
    public url: string,
    public favIconUrl: string,
    public created: number,
    public updated: number,
    public score: number,
    public tabsets: string[],
    public spaces: string[],
    public matches: object[],
    public description: string,
    public keywords: string
  ) {

    this.updated = new Date().getTime()
    this.lastActive = 0
    this.activatedCount = 0
    this.loadedCount = 0
    this.name = undefined
  }

}
