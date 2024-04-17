import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import TabsetService from "src/services/TabsetService";

export class ImportTabsetsCommand implements Command<string> {

  constructor(
    public json: string) {
  }

  async execute(): Promise<ExecutionResult<string>> {
    TabsetService.importData(this.json)
    return Promise.resolve(
      new ExecutionResult(
        "done",
        "Tabsets were imported"))
  }

}

ImportTabsetsCommand.prototype.toString = function cmdToString() {
  return `ImportTabsetsCommand`;
};
