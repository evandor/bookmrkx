import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import TabsetService from "src/services/TabsetService";
import {TabsetColumn} from "src/models/TabsetColumn";
import {uid} from "quasar";
import {Tabset} from "src/models/Tabset";
import {SPECIAL_ID_FOR_NO_GROUP_ASSIGNED, STRIP_CHARS_IN_USER_INPUT} from "boot/constants";
import {useTabsStore} from "src/stores/tabsStore";
import {useTabsetService} from "src/services/TabsetService2";

// class UndoCommand implements Command<any> {
//
//   constructor(public tabId: string, public oldTabsetId: string, public copy: boolean) {
//   }
//
//   execute(): Promise<ExecutionResult<any>> {
//     return TabsetService.moveToTabset(this.tabId, this.oldTabsetId)
//       .then(() => {
//         return Promise.resolve(new ExecutionResult("done", "Tab was moved back"))
//       })
//   }
//
// }

export class RenameGroupCommand implements Command<any> {

  constructor(
    public tabset: Tabset,
    public groupId: string,
    public title: string
  ) {
  }

  async execute(): Promise<ExecutionResult<any>> {
    const trustedTitle = this.title.replace(STRIP_CHARS_IN_USER_INPUT, '')
    const existingGroups = this.tabset.columns || []
    const foundGroup = existingGroups.find(existingGroup => existingGroup.id === this.groupId)
    if (foundGroup) {
      if (existingGroups.find(existingGroup => existingGroup.title === this.title)) {
        return Promise.reject("group with this name already exists")
      }
      foundGroup.title = trustedTitle
      return useTabsetService().saveTabset(this.tabset)
        .then((res) =>
          Promise.resolve(new ExecutionResult("done", "Group was renamed")))
        .catch(err => Promise.reject("could not rename group"))
    } else if (this.groupId === SPECIAL_ID_FOR_NO_GROUP_ASSIGNED) {
      const defaultGroup = new TabsetColumn(SPECIAL_ID_FOR_NO_GROUP_ASSIGNED, trustedTitle)
      if (!this.tabset.columns) {
        this.tabset.columns = []
      }
      this.tabset.columns.push(defaultGroup)
      return useTabsetService().saveTabset(this.tabset)
        .then((res) =>
          Promise.resolve(new ExecutionResult("done", "Group was renamed")))
        .catch(err => Promise.reject("could not rename group"))
    } else {
      return Promise.reject(`Could not find group ${this.groupId} to rename to ${trustedTitle}`)
    }
  }

}

RenameGroupCommand.prototype.toString = function cmdToString() {
  return `RenameGroupCommand: {title=${this.title},{groupId=${this.groupId}, {tabsetId=${this.tabset.id}}`;
};
