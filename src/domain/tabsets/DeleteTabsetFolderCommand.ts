import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {useTabsetService} from "src/services/TabsetService2";
import {Tabset, TabsetStatus} from "src/models/Tabset";

export class DeleteTabsetFolderCommand implements Command<string> {

  constructor(public tabset: Tabset, public folder: Tabset) {
  }

  async execute(): Promise<ExecutionResult<string>> {
    return useTabsetService().deleteTabsetFolder(this.tabset, this.folder)
      // .then(res => {
      //   //sendMsg('...', {tabsetId: this.tabsetId})
      //   return res
      // })
      .then(res => Promise.resolve(new ExecutionResult(res, "Folder deleted")))
      .catch(err => Promise.reject(err))
  }
}

DeleteTabsetFolderCommand.prototype.toString = function cmdToString() {
  return `DeleteTabsetFolderCommand: {tabsetId=${this.tabset.id}, {folderId=${this.folder.id}}`;
};
