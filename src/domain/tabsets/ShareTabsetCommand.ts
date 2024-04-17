import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import TabsetService from "src/services/TabsetService";
import {TabsetSharing} from "src/models/Tabset";
import {UnShareTabsetCommand} from "src/domain/tabsets/UnShareTabsetCommand"


export class ShareTabsetCommand implements Command<any> {

  constructor(
    public tabsetId: string,
    public sharedId: string | undefined,
    public sharing: TabsetSharing,
    public author: string,
    public republish: boolean = false) {
  }

  async execute(): Promise<ExecutionResult<any>> {
    const sharedBy = this.author
    return TabsetService.share(this.tabsetId, this.sharing, this.sharedId, sharedBy || "unknown")
      .then(oldSharing => Promise.resolve(
        new ExecutionResult(
          oldSharing,
          this.republish ? "The tabset has been republished" : "The tabset is shared now.",
          new UnShareTabsetCommand(this.tabsetId)))
      )
      .catch(err => Promise.reject(err))
  }
}

ShareTabsetCommand.prototype.toString = function cmdToString() {
  return `ShareTabsetCommand: {tabsetId=${this.tabsetId}}, {sharing=${this.sharing}, {author=${this.author}}`;
};
