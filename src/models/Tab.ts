import {Placeholders} from "src/models/Placeholders";
import {Monitor} from "src/models/Monitor";
import {uid} from "quasar";
import {STRIP_CHARS_IN_USER_INPUT} from "boot/constants";
import _ from "lodash"

export enum TabSorting {
  URL = "URL",
  TITLE = "TITLE",
  AGE = "AGE",
  CUSTOM = "CUSTOM"
}

export enum UrlExtension {
  HTML = "HTML",
  RSS = "RSS",
  PDF = "PDF",
  IMAGE = "IMAGE",
  NOTE = "NOTE",
  UNKNOWN = "UNKNOWN"
}

export class HTMLSelectionComment {

  date: number = 0

  constructor(
    public author: string = '',
    public comment: string = '') {
    this.date = new Date().getTime()
  }
}

export class HTMLSelection {
  private created: number;
  private id: string;
  constructor(
    public text: string = '',
    public range: string = '',
    public comments: HTMLSelectionComment[] = []) {
    this.id = uid()
    this.created = new Date().getTime()
  }
}

export class TabComment {
  date: number = 0
  public id: string;

  constructor(
    public author: string = '<me>',
    public avatar: string | undefined = undefined,
    public comment: string = '') {
    this.date = new Date().getTime()
    this.id = uid()

    this.comment = this.comment.replace(STRIP_CHARS_IN_USER_INPUT, '')
    if (!TabComment.commentIsShortEnough) {
      throw new Error(`Comment is too long (max. 1024 chars)`)
    }
  }

  static commentIsShortEnough = (val: string) => val ? val.length <= 1024 : true
}

export enum TabPreview {
  FAVICON= "FAVICON",
  THUMBNAIL = "THUMBNAIL"
}

export class Tab {
  created: number
  updated: number
  lastActive: number
  activatedCount: number
  loadedCount: number

  // from chrome tab
  chromeTabId: number | undefined
  favIconUrl: string | undefined
  url: string | undefined
  title: string | undefined
  pinned: boolean
  groupId: number

  // from tabsets' columns
  columnId: string | undefined

  history: string[] = []
  selected: boolean = false
  name: string | undefined
  bookmarkUrl: string | undefined
  bookmarkId: string | undefined
  description: string
  longDescription: string | undefined
  keywords: string
  tags: string[] // Set<string> got issues in indexeddb
  image: string
  date: string
  lastModified: string
  author: string
  // deprecated, will be phased out in 0.5.1
  // use comments instead
  note: string
  scheduledFor: number | undefined
  extension: UrlExtension

  contentHash: string

  httpStatus: number = 200
  httpContentType: string = 'undefined'
  httpLastModified: string = 'undefined'
  httpCheckedAt: number = 0
  httpError: string = ''
  httpInfo: string = 'undefined'

  placeholders: Placeholders | undefined
  monitor: Monitor | undefined

  color: string | undefined = undefined
  matcher: string | undefined = undefined

  groupName: string | undefined = undefined

  canvasLeft: number | undefined
  canvasTop: number | undefined
  canvasWidth: number | undefined
  canvasHeight: number | undefined

  annotations: HTMLSelection[] = []

  comments: TabComment[] = []

  preview: TabPreview = TabPreview.FAVICON

  constructor(public id: string, chromeTab: chrome.tabs.Tab) {
    this.created = new Date().getTime()
    this.updated = new Date().getTime()
    this.lastActive = new Date().getTime()
    this.activatedCount = 1
    this.loadedCount = 0

    this.chromeTabId = chromeTab.id
    this.favIconUrl = chromeTab.favIconUrl
    this.url = chromeTab.url
    this.title = chromeTab.title
    this.pinned = chromeTab.pinned
    this.groupId = chromeTab.groupId
    this.groupName = undefined // to be set from 'outside'

    //this.chromeTab = chromeTab
    this.history = []
    this.name = undefined
    this.description = ''
    this.keywords = ''
    this.tags = []
    this.image = ''
    this.date = ''
    this.lastModified = ''
    this.author = ''
    this.note = ''
    this.scheduledFor = undefined
    this.extension = this.determineUrlExtension(chromeTab)
    this.contentHash = ''

    this.preview = TabPreview.FAVICON

    this.tags = _.uniq(_.filter(
      _.map(this.tags, (t:string) => t.replace(STRIP_CHARS_IN_USER_INPUT, '')),
      (e:string) => e.trim() !== ''))

    if (!Tab.titleIsValid) {
      throw new Error(`Tab's title '${this.title}' is not valid`)
    }

    if (!Tab.titleIsShortEnough) {
      throw new Error(`Tab's title '${this.title}' is too long`)
    }

    if (!Tab.descIsValid) {
      throw new Error(`Tab's description '${this.description}' is not valid`)
    }

    if (!Tab.descIsShortEnough) {
      throw new Error(`Tab's description is too long`)
    }

  }

  static titleIsValid = (val: string) => !STRIP_CHARS_IN_USER_INPUT.test(val)
  static descIsValid = (val: string) => !STRIP_CHARS_IN_USER_INPUT.test(val)

  static titleIsShortEnough = (val: string) => val ? val.length <= 512 : true
  static descIsShortEnough = (val: string) => val ? val.length <= 1024 : true

  setHistoryFrom(existingTab: Tab) {
    if (existingTab.history) {
      this.history = existingTab.history
    } else {
      this.history = []
    }
  }

  addToHistory(url: string) {
    if (!this.history) {
      this.history = [] as unknown as string[]
    }
    this.history.push(url)
  }

  determineUrlExtension(chromeTab: chrome.tabs.Tab): UrlExtension {
    let ext = UrlExtension.UNKNOWN
    if (chromeTab?.url) {
      try {
        const url = new URL(chromeTab.url)
        ext = UrlExtension.HTML
        const urlToCheck = url.href.toLowerCase().split("?")[0]
        //console.log("urlToCheck", urlToCheck)
        if (urlToCheck.endsWith(".rss")) {
          ext = UrlExtension.RSS
        } else if (urlToCheck.endsWith(".rdf")) {
          ext = UrlExtension.RSS
        } else if (urlToCheck.endsWith(".xml")) {
          ext = UrlExtension.RSS
        } else if (urlToCheck.endsWith(".png") || urlToCheck.endsWith(".jpg") || urlToCheck.endsWith(".jpeg")) {
          ext = UrlExtension.IMAGE
        }
      } catch (err) {
        console.error("checking extension url: ", chromeTab.url, err)
      }
    }
    return ext
  }

}

Tab.prototype.toString = function tabToString() {
  return `Tab: {id=${this.id}, url=${this.url}, #history=${this.history.length}}`;
};
