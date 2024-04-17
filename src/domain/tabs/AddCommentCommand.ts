import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {Tab, TabComment} from "src/models/Tab";
import {useTabsStore} from "src/stores/tabsStore";
import {useTabsetService} from "src/services/TabsetService2";
import {Tabset, TabsetSharing} from "src/models/Tabset";
import {useUiStore} from "stores/uiStore";

export class AddCommentCommand implements Command<any> {

  constructor(public tabId: string, public comment: string) {
  }

  async execute(): Promise<ExecutionResult<any>> {

    const tabData = useTabsStore().getTabAndTabsetId(this.tabId)
    if (tabData && tabData.tab) {
      console.log("retrieved tabData", tabData)
      const tab = tabData.tab
      const comment = new TabComment(useUiStore().sharingAuthor || '<me>', useUiStore().sharingAvatar, this.comment)
      if (!tab.comments) {
        tab.comments = []
      }
      console.log("pushing comment", comment)
      tab.comments.push(comment)
      const tabset = useTabsetService().getTabset(tabData.tabsetId)
      if (tabset && tabset.sharedId) {
        tabset.sharing = TabsetSharing.PUBLIC_LINK_OUTDATED
        //MqttService.publishTabComment(tabset.sharedId, tabData.tab, comment)
      }
      if (tabset) {
        return useTabsetService().saveTabset(tabset)
          .then(() => new ExecutionResult("done", "Comment Published"))
      } else {
        return Promise.reject("could not find tabset")
      }
    } else {
      return Promise.reject("There was a problem adding your comment - could not find data for tabId " + this.tabId)
    }
    return Promise.reject("Could not find Tab")
  }

}

AddCommentCommand.prototype.toString = function cmdToString() {
  return `AddCommentCommand: {tabId=${this.tabId}}`;
};
