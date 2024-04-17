import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import ChromeApi from "src/services/ChromeApi";

export class RestoreTabsetCommand implements Command<string> {

  public merge: boolean = true

  constructor(
    public tabsetId: string,
    public windowName: string | undefined = undefined,
    public inNewWindow: boolean = true) {
  }

  async execute(): Promise<ExecutionResult<string>> {
    console.log("restoring from tabset", this.tabsetId)
    return Promise.reject("")
  }
}

RestoreTabsetCommand.prototype.toString = function cmdToString() {
  return `RestoreTabsetCommand: {tabsetName=${this.tabsetId}, inNewWindow=${this.inNewWindow}}`;
};
