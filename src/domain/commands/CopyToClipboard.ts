import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";

export class CopyToClipboardCommand implements Command<string> {

  public merge: boolean = true

  constructor(
    public text: string) {
  }

  async execute(): Promise<ExecutionResult<string>> {
    return navigator.clipboard.writeText(this.text).then(function () {
      const executionResult = new ExecutionResult("copied", "Content was copied to Clipboard")
      return Promise.resolve(executionResult)
    }, function (err) {
      return Promise.reject('Async: Could not copy text: ' + err);
    });
  }
}

CopyToClipboardCommand.prototype.toString = function cmdToString() {
  return `CopyToClipboardCommand`;
};
