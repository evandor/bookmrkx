import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import TabsetService from "src/services/TabsetService";
import {TabsetColumn} from "src/models/TabsetColumn";
import {uid} from "quasar";
import {Tabset} from "src/models/Tabset";
import {STRIP_CHARS_IN_USER_INPUT} from "boot/constants";
import {useTabsetService} from "src/services/TabsetService2";
import _ from "lodash"

class UndoCommand implements Command<any> {

  constructor(public tabset: Tabset, public groupId: string) {
  }

  execute(): Promise<ExecutionResult<any>> {
    this.tabset.columns = _.filter(this.tabset.columns, (g: TabsetColumn) => g.id !== this.groupId)
    return useTabsetService().saveTabset(this.tabset)
      .then((res) =>
        Promise.resolve(new ExecutionResult("done", `Group was deleted again`)))
  }

}

export class CreateGroupCommand implements Command<any> {

  constructor(
    public tabset: Tabset,
    public title: string
  ) {
  }

  async execute(): Promise<ExecutionResult<any>> {
    const trustedTitle = this.title.replace(STRIP_CHARS_IN_USER_INPUT, '')
    const group = new TabsetColumn(uid(), trustedTitle)
    const existingGroups = this.tabset.columns
    if (existingGroups.find(existingGroup => existingGroup.title === this.title)) {
      return Promise.reject(`Group ${trustedTitle} already exists`)
    }
    this.tabset.columns.push(group)
    return useTabsetService().saveTabset(this.tabset)
      .then((res) =>
        Promise.resolve(new ExecutionResult("done", `Group ${trustedTitle} was created`, new UndoCommand(this.tabset, group.id))))
      .catch(err => Promise.reject("could not create group"))
  }

}

CreateGroupCommand.prototype.toString = function cmdToString() {
  return `CreateGroupCommand: {title=${this.title}, {tabsetId=${this.tabset.id}}`;
};
