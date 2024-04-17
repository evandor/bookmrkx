import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import TabsetService from "src/services/TabsetService";


export class ToggleSortingCommand implements Command<string> {

  constructor(
    public tabsetId: string) {
  }

  async execute(): Promise<ExecutionResult<string>> {
    const newSorting = TabsetService.toggleSorting(this.tabsetId)
    let msg = "undefined"
    if (newSorting) {
      switch (newSorting) {
        case 'custom':
          msg = "Sorting set to custom"
          break;
        case 'alphabeticalUrl':
          msg = "Sorting by URL"
          break;
        case 'alphabeticalTitle':
          msg = "Sorting by Title"
          break;
        default:
          msg = "Undefined sorting"
      }
      return Promise.resolve(new ExecutionResult(newSorting, msg))
    }
    return Promise.reject("sorting was undefined")
  }
}

ToggleSortingCommand.prototype.toString = function cmdToString() {
  return `SelectTabsetCommand: {tabsetId=${this.tabsetId}}`;
};
