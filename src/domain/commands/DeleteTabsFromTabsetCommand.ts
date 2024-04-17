import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {useTabsetService} from "src/services/TabsetService2";
import {Tab} from "src/models/Tab";
import {TabPredicate} from "src/domain/Types";


export class DeleteTabsFromTabsetCommand implements Command<any> {

  constructor(public tabsetId: string, public updated: number) {
  }

  async execute(): Promise<ExecutionResult<any>> {
    const predicate: TabPredicate = (t: Tab) => t.updated === this.updated && t.bookmarkId !== null
    return useTabsetService()
      .deleteFromTabset(this.tabsetId, predicate)
      .then(res => Promise.resolve(new ExecutionResult(res, res + " Tab(s) were deleted again")))
      .catch(err => Promise.reject(err))
    // Missing? - delete tabset when empty?
  }
}
