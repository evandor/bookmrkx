import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import _ from "lodash"
import {Tab} from "src/models/Tab";
import {useUiStore} from "src/stores/uiStore";
import {useUtils} from "src/services/Utils";
import {Tabset} from "src/models/Tabset";

const {inBexMode, sendMsg} = useUtils()

export class SelectTabsetCommand implements Command<Tabset | undefined> {

  public merge: boolean = true

  constructor(
    public tabsetId: string,
    public spaceId: string | undefined = undefined) {
  }

  // TODO this return the old currentTabset - why? needed?
  async execute(): Promise<ExecutionResult<Tabset | undefined>> {

    return Promise.reject("")
  }
}

SelectTabsetCommand.prototype.toString = function cmdToString() {
  return `SelectTabsetCommand: {tabsetId=${this.tabsetId}}, {spaceId=${this.spaceId}}`;
};
