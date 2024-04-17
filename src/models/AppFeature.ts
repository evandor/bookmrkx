import Command from "src/domain/Command";
import {ActivateFeatureCommand} from "src/domain/features/ActivateFeature";
import {DeactivateFeatureCommand} from "src/domain/features/DeactivateFeature";

export enum FeatureIdent {
  //BOOKMARKS = "BOOKMARKS", -- active by default now
  //PAGE_MARKER = "PAGE_MARKER",
  // SAVE_TAB = "SAVE_TAB", // As MHTML
  SAVE_TAB_AS_PDF = "SAVE_TAB_AS_PDF", // not active yet
  SAVE_TAB_AS_PNG = "SAVE_TAB_AS_PNG",
  GROUP_BY_DOMAIN = "GROUP_BY_DOMAIN",
  OPENTABS_THRESHOLD = "OPENTABS_THRESHOLD",
  EXPERIMENTAL_VIEWS = "EXPERIMENTAL_VIEWS",
  RSS = "RSS",
  SESSIONS = "SESSIONS",
  SPACES = "SPACES",
  HELP = "HELP",
  TOP10 = "TOP10",
  OPEN_TABS = "OPEN_TABS",
  //NEWEST_TABS = "NEWEST_TABS",
  // THUMBNAILS = "THUMBNAILS", // active by default
  DYNAMIC = "DYNAMIC",
  WINDOWS = "WINDOWS",
  SCHEDULED = "SCHEDULED",
  OLD_TABS = "OLD_TABS",
  BACKUP = "BACKUP",
  IGNORE = "IGNORE",
  //TABSET_PAGE = "TABSET_PAGE", -- default now
  NOTES = "NOTES",
  TAGS = "TAGS",
  SIDE_PANEL = "SIDE_PANEL",
  WEBSITE_CLIP = "WEBSITE_CLIP",
  STANDALONE_APP = "STANDALONE_APP",
  //AI_MODULE = "AI_MODULE",
  //CATEGORIZATION = "CATEGORIZATION",
  NOTIFICATIONS = "NOTIFICATIONS",
  ANNOTATIONS = "ANNOTATIONS",
  //CONTEXT_MENUS = "CONTEXT_MENUS",
  ARCHIVE_TABSET = "ARCHIVE_TABSET",
  //WINDOW_MANAGEMENT = "WINDOW_MANAGEMENT",
  COLOR_TAGS = "COLOR_TAGS",
  ADVANCED_TAB_MANAGEMENT = "ADVANCED_TAB_MANAGEMENT",
  ANALYSE_TABS = "ANALYSE_TABS",
  TAB_GROUPS = "TAB_GROUPS",
  MONITORING = "MONITORING",
  TAB_HELPER = "TAB_HELPER",
  AUTO_TAB_SWITCHER = "AUTO_TAB_SWITCHER",
  TABS_AS_TREE = "TABS_AS_TREE",
  TABSET_SUBFOLDER = "TABSET_SUBFOLDER",
  TABSETS_SHARING = "TABSETS_SHARING",
  ENTITY_MANAGER = "ENTITY_MANAGER",
  API_MANAGER = "API_MANAGER"
}

export enum FeatureType {
  RECOMMENDED = "RECOMMENDED",
  OPTIONAL = "OPTIONAL",
  EXPERIMENTAL = "EXPERIMENTAL",
  PLANNED = "PLANNED",
  DISABLED = "DISABLED"
}

export class AppFeature {

  public activateCommands: Array<Command<any>> = []
  public deactivateCommands: Array<Command<any>> = []

  constructor(
    public ident: FeatureIdent,
    public type: FeatureType,
    public name: string,
    public icon: string,
    public useIn: string[],
    public requires: FeatureIdent[] = []
  ) {
    this.activateCommands = [new ActivateFeatureCommand(this)]
    this.deactivateCommands = [new DeactivateFeatureCommand(this)]
  }

  setActivateCommands(cmds: Array<Command<any>>): AppFeature {
    this.activateCommands = cmds.concat(this.activateCommands)
    return this
  }

  setDeactivateCommands(cmds: Array<Command<any>>): AppFeature {
    this.deactivateCommands = cmds.concat(this.deactivateCommands)
    return this
  }
}
