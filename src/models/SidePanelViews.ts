import {useFeaturesStore} from "src/features/stores/featuresStore";
import {FeatureIdent} from "src/app/models/FeatureIdent";

export class SidePanelViews {

  static readonly MAIN = new SidePanelViews('main', '/sidepanel/bookmarks');

  static readonly TAG = new SidePanelViews('tag', '/sidepanel/tags');

  static readonly SHARED_TABSETS_LIST = new SidePanelViews('sharedTsList', '/sidepanel/sharedTsList',
    () => useFeaturesStore().hasFeature(FeatureIdent.TABSETS_SHARING));

  static readonly NEWEST_TABS_LIST = new SidePanelViews('newestList', '/sidepanel/newestList');

  static readonly BOOKMARKS = new SidePanelViews('bookmarks', '/sidepanel/bookmarks',
    () => true) //&& useRoute()?.path !== "/sidepanel/welcome");

  static readonly PUBLIC_TABSETS = new SidePanelViews('categorized_tabsets', '/sidepanel/byCategory',
    () => true);

  static readonly MESSAGES = new SidePanelViews('messages', '/sidepanel/messages')

  static readonly TABS_AS_TREE = new SidePanelViews('tabsAsTree', '/sidepanel/tabsAsTree')



  private constructor(
    public readonly ident: string,
    public readonly path: any,
    public readonly showButtonFunction: Function = () => true) {
  }

  toString() {
    return this.ident;
  }

  showButton() {
    return this.showButtonFunction()
  }

}
