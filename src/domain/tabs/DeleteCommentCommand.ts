import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {useTabsStore} from "src/stores/tabsStore";
import {useTabsetService} from "src/services/TabsetService2";
import {TabsetSharing} from "src/models/Tabset";
import _ from "lodash"

export class DeleteCommentCommand implements Command<any> {

  constructor(public tabId: string, public commentId: string) {
  }

  async execute(): Promise<ExecutionResult<any>> {

    const tabData = useTabsStore().getTabAndTabsetId(this.tabId)
    if (tabData && tabData.tab) {
      console.log("retrieved tabData", tabData)
      const tab = tabData.tab

      tab.comments = _.filter(tab.comments, c => c.id !== this.commentId)

      const tabset = useTabsetService().getTabset(tabData.tabsetId)
      if (tabset && tabset.sharedId) {
        tabset.sharing = TabsetSharing.PUBLIC_LINK_OUTDATED
      }
      if (tabset) {
        return useTabsetService().saveTabset(tabset)
          .then(() => new ExecutionResult("done", "Comment Deleted"))
      } else {
        return Promise.reject("could not find tabset")
      }
    } else {
      return Promise.reject("There was a problem deleting your comment")
    }
    return Promise.reject("Could not find Tab")
  }

}

DeleteCommentCommand.prototype.toString = function cmdToString() {
  return `DeleteCommentCommand: {tabId=${this.tabId}, commentId=${this.commentId}`;
};
