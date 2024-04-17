import _ from "lodash"
import {RELEASE_NOTES_URL} from "boot/constants";

export enum SuggestionState {
  NEW = "NEW",
  IGNORED = "IGNORED",
  APPLIED = "APPLIED",
  CHECKED = "CHECKED", // we do not know if the suggestion was applied or ignored
  DECISION_DELAYED = "DECISION_DELAYED",
  INACTIVE = "INACTIVE",
  NOTIFICATION = "NOTIFICATION" // this has been sent as chrome notification
}


export enum SuggestionType {
  RSS = "RSS",
  REDIRECT_HAPPENED_FOR_TAB = "REDIRECT_HAPPENED_FOR_TAB",
  REDIRECT_HAPPENED_FOR_BOOKMARK = "REDIRECT_HAPPENED_FOR_BOOKMARK",
  CONTENT_CHANGE = "CONTENT_CHANGE",
  FEATURE = "FEATURE",
  URL = "URL",
  RESTART = "RESTART"
}

export enum StaticSuggestionIdent {
  TRY_TAB_DETAILS_FEATURE = "TRY_TAB_DETAILS_FEATURE",
  TRY_BOOKMARKS_FEATURE = "TRY_BOOKMARKS_FEATURE",
  TRY_SPACES_FEATURE = "TRY_SPACES_FEATURE",
  TRY_NEWEST_TABS_FEATURE = "TRY_NEWEST_TABS_FEATURE",
  RELEASE_NOTES_AVAILABLE = "RELEASE_NOTES_AVAILABLE",
  RESTART_SUGGESTED = "RESTART_SUGGESTED"
}

export class Suggestion {

  public state: SuggestionState;
  public img: string | undefined = undefined;
  public data: object = {}
  public created: number | undefined = undefined

  static staticSuggestions: Suggestion[] = [
    new Suggestion(StaticSuggestionIdent.TRY_TAB_DETAILS_FEATURE.toString(),
      "Want to try a new feature?",
      "Maybe you want to try the optional 'Display Tab Details' feature?",
      "/features/details",
      SuggestionType.FEATURE)
      .setImage('o_info'),
    new Suggestion(StaticSuggestionIdent.TRY_BOOKMARKS_FEATURE,
      "Want to try a new feature?",
      "Maybe you want to try the optional 'Bookmarks' feature?",
      "/features/bookmarks",
      SuggestionType.FEATURE)
      .setImage('o_bookmarks'),
    new Suggestion(StaticSuggestionIdent.TRY_SPACES_FEATURE,
      "Want to try a new feature?",
      "Check out the optional 'Spaces' feature and get another level of organization",
      "/features/spaces",
      SuggestionType.FEATURE)
      .setImage('o_space_dashboard'),
    new Suggestion(StaticSuggestionIdent.TRY_NEWEST_TABS_FEATURE,
      "Want to try a new feature?",
      "Activate a view with your newest tabs",
      "/features/newest_tabs",
      SuggestionType.FEATURE)
      .setImage('o_schedule'),
    // new Suggestion(StaticSuggestionIdent.RELEASE_NOTES_AVAILABLE,
    //   "Version was updated",
    //   "Do you want to read the release notes?",
    //   RELEASE_NOTES_URL,
    //   SuggestionType.URL)
    //   .setImage('o_schedule'),
    new Suggestion(StaticSuggestionIdent.RESTART_SUGGESTED,
      "Restart Required",
      "Please restart tabsets by clicking the button",
      "",
      SuggestionType.RESTART)
      .setImage('o_schedule')
  ]

  constructor(
    public id: string, // could be random, could be an encoded URL or a predefined string ("TRY Feature X")
    public title: string,
    public msg: string,
    public url: string,
    public type: SuggestionType = SuggestionType.RSS) {
    this.state = SuggestionState.NEW
    this.created = new Date().getTime()
  }

  setImage(img: string): Suggestion {
    this.img = img
    return this
  }

  setData(data: object): Suggestion {
    this.data = data
    return this
  }

  static getStaticSuggestion(ident: StaticSuggestionIdent): Suggestion | undefined {
    //console.log("hier", this.staticSuggestions, ident)
    return _.find(this.staticSuggestions, s => s.id === ident)
  }
}
