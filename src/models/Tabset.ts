import {Tab} from "src/models/Tab";
import {TabsetColumn} from "src/models/TabsetColumn";
import {DynamicTabSource} from "src/models/DynamicTabSource";
import {STRIP_CHARS_IN_USER_INPUT} from "boot/constants";
import {ListDetailLevel} from "stores/uiStore";

export enum TabsetStatus {
  DEFAULT = "DEFAULT",
  FAVORITE = "FAVORITE",
  ARCHIVED = "ARCHIVED",
  DELETED = "DELETED",
  HIDDEN = "HIDDEN"
}

export enum TabsetType {
  DEFAULT = "DEFAULT",
  SESSION = "SESSION",

  SPECIAL = "SPECIAL",
  DYNAMIC = "DYNAMIC"
}

export enum TabsetSharing {
  UNSHARED = "UNSHARED",
  PUBLIC_LINK = "PUBLIC_LINK",
  PUBLIC_LINK_OUTDATED = "PUBLIC_LINK_OUTDATED",
  USER = "USER",
  ROLE = "ROLE"
}


export const TABSET_NAME_MAX_LENGTH = 32;

export class Tabset {
  id: string

  name: string
  created: number
  updated: number
  tabs: Tab[]
  dynamicTabs: DynamicTabSource | undefined

  folders: Tabset[] = []
  folderActive: string | undefined = undefined
  folderParent: string | undefined = undefined

  // additional initialization in "loadTabsets()" for older tabsets.
  // in the application, we can assume that columns is always set, at least with an empty array
  // tabs have a columnId field which references a group or which is undefined.
  // a tabset's group _can_ contain a group with identifier "SPECIAL_ID_FOR_NO_GROUP_ASSIGNED"
  // was: groups: Group[]
  columns: TabsetColumn[] = []

  spaces: string[] // got json problems with set<string>
  view: string = 'list'
  details: ListDetailLevel | undefined = undefined
  sorting: string = 'custom'
  status: TabsetStatus = TabsetStatus.DEFAULT
  type: TabsetType = TabsetType.DEFAULT

  // sharing
  sharing: TabsetSharing = TabsetSharing.UNSHARED
  sharedBy: string | undefined = undefined
  sharedById: string | undefined = undefined
  sharedId: string | undefined = undefined
  sharedAt: number | undefined = undefined
  sharedPath: string | undefined = undefined // e.g. /pwa/imp/AlCYSrGGmOnsOnf0htA9?n=c2hvcHBpbmc=

  // messaging
  mqttUrl: string | undefined = undefined

  importedAt: number | undefined = undefined

  canvas: object | undefined = undefined

  // = description
  page: string | undefined = undefined

  headerDescription: string | undefined = undefined

  window: string = 'current'
  color: string | undefined = undefined

  // can be set (to the installtion.id) when saving the tabset in order to omit triggering an update
  origin: string = ''

  constructor(id: string, name: string, tabs: Tab[], columns: TabsetColumn[] = [], spaces: string[] = []) {

    // some guards
    if (!Tabset.newTabsetNameIsValid) {
      throw new Error(`Tabset name '${name}' is not valid`)
    }
    if (!Tabset.newTabsetNameIsShortEnough) {
      throw new Error(`Tabset name '${name}' is too long`)
    }

    // assignments
    this.id = id
    this.name = name
    this.created = new Date().getTime()
    this.updated = new Date().getTime()
    this.tabs = tabs
    this.columns = columns
    this.spaces = spaces
  }

  static newTabsetNameIsValid = (val: string) => {
    return !STRIP_CHARS_IN_USER_INPUT.test(val)
  }

  static newTabsetNameIsShortEnough = (val: string) => val ? val.length <= TABSET_NAME_MAX_LENGTH : true

}
