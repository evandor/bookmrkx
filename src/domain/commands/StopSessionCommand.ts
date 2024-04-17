import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {Tabset, TabsetType} from "src/models/Tabset";
import {useTabsetService} from "src/services/TabsetService2";

class UndoCommand implements Command<any> {

  constructor(public tabset: Tabset | undefined) {
  }

  execute(): Promise<ExecutionResult<any>> {
    if (this.tabset) {
      console.log("execution undo command", this.tabset.id)
      this.tabset.type = TabsetType.SESSION
      return useTabsetService().saveTabset(this.tabset)
        .then((res) =>
          new ExecutionResult(null, "Tabset is used for auto-tracking again"))
    }
    return Promise.reject("could not find tabset")
  }

}

export class StopSessionCommand implements Command<any> {

  constructor(
    public tabset: Tabset | undefined) {
  }

  async execute(): Promise<ExecutionResult<any>> {
    if (this.tabset) {
      this.tabset.type = TabsetType.DEFAULT
      return useTabsetService().saveTabset(this.tabset)
        .then((res) =>
          new ExecutionResult(
            null,
            "The session has been stopped. New Tabs are not added automatically.",
            new UndoCommand(this.tabset)))
        .catch((err) => Promise.reject("issue saving tabset"))
    }
    return Promise.reject("could not find tabset")
  }
}

StopSessionCommand.prototype.toString = function cmdToString() {
  return `StopSessionCommand: {tabset=${this.tabset?.id}}`
};
