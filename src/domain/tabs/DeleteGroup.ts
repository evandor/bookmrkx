import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {TabsetColumn} from "src/models/TabsetColumn";
import {Tabset} from "src/models/Tabset";
import {useTabsetService} from "src/services/TabsetService2";
import _ from "lodash"
import {Tab} from "src/models/Tab";

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

export class DeleteGroupCommand implements Command<any> {

  constructor(
    public tabset: Tabset,
    public groupId: string
  ) {
  }

  async execute(): Promise<ExecutionResult<any>> {
    const existingGroups = this.tabset.columns
    const foundGroup = existingGroups.find(existingGroup => existingGroup.id === this.groupId)
    if (foundGroup) {
      _.forEach(this.tabset.tabs, (t:Tab) => {
        if (t.columnId === this.groupId) {
          t.columnId = undefined
        }
      })
      this.tabset.columns = _.filter(this.tabset.columns, (g: TabsetColumn) => g.id !== this.groupId)
      return useTabsetService().saveTabset(this.tabset)
        .then((res) =>
          Promise.resolve(new ExecutionResult("done", "Group was deleted and its tabs unassigned")))
        .catch(err => Promise.reject("could not delete group"))
    } else {
      return Promise.reject(`Could not find group to delete`)
    }
  }

}

DeleteGroupCommand.prototype.toString = function cmdToString() {
  return `DeleteGroupCommand: {groupId=${this.groupId}, {tabsetId=${this.tabset.id}}`;
};
