import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import TabsetService from "src/services/TabsetService";

class UndoCommand implements Command<any> {

  constructor(public tabId: string, public oldTabsetId: string, public copy: boolean) {
  }

  execute(): Promise<ExecutionResult<any>> {
    return TabsetService.moveToTabset(this.tabId, this.oldTabsetId)
      .then(() => {
        return Promise.resolve(new ExecutionResult("done", "Tab was moved back"))
      })
  }

}

export class MoveToTabsetCommand implements Command<any> {

  constructor(
    public tabId: string,
    public tabsetId: string,
    public oldTabsetId: string,
    public copy: boolean = false) {
  }

  async execute(): Promise<ExecutionResult<any>> {
    return TabsetService.moveToTabset(this.tabId, this.tabsetId, this.copy)
      .then(() => {
        if (this.copy) {
          return Promise.resolve(new ExecutionResult("done", "Tab was copied"))
        } else {
          return Promise.resolve(new ExecutionResult("done", "Tab was moved - press 'Shift' if you want to copy instead", new UndoCommand(this.tabId, this.oldTabsetId, this.copy)))
        }
      })
      .catch((err) => Promise.reject(err))
  }

}

MoveToTabsetCommand.prototype.toString = function cmdToString() {
  return `MoveToTabsetCommand: {tabId=${this.tabId}, {tabsetId=${this.tabsetId}, {oldTabsetId=${this.oldTabsetId}, {copy=${this.copy}}`;
};
