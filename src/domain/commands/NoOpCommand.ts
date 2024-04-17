import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {useNotificationHandler} from "src/services/ErrorHandler";

const {handleSuccess} = useNotificationHandler()

export class NoOpCommand implements Command<any> {

  public readonly chromeTabId: number | undefined;

  constructor() {
  }

  async execute(): Promise<ExecutionResult<any>> {
    return handleSuccess(
      new ExecutionResult("", ""))
  }

}


NoOpCommand.prototype.toString = function cmdToString() {
  return `NoOpCommand: {}`;
};
