import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {useTabsetService} from "src/services/TabsetService2";

export class DeleteTabsetCommand implements Command<string> {

  constructor(public tabsetId: string) {
  }

  async execute(): Promise<ExecutionResult<string>> {
    return useTabsetService().deleteTabset(this.tabsetId)
      .then(res => {
        //sendMsg('tabset-deleted', {tabsetId: this.tabsetId})
        return res
      })
      .then(res => Promise.resolve(new ExecutionResult(res, "Tabset deleted")))
      .catch(err => Promise.reject(err))
  }
}

DeleteTabsetCommand.prototype.toString = function cmdToString() {
  return `DeleteTabsetCommand: {tabsetId=${this.tabsetId}}`;
};
