import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import TabsetService from "src/services/TabsetService";
import {Tab, UrlExtension} from "src/models/Tab";
import {useSearchStore} from "src/stores/searchStore";

class UndoCommand implements Command<any> {

  constructor(public tab: Tab, public oldUrl: string) {
  }

  execute(): Promise<ExecutionResult<any>> {
    console.info(this.tab, `reverting changed tab url to ${this.oldUrl}`)
    return TabsetService.setUrl(this.tab, this.oldUrl)
      .then(res => {
        if (this.tab.url) {
          useSearchStore().update(this.tab.url, 'url', this.oldUrl)
        }
        return res
      })
      .then(res => new ExecutionResult(res, "Tab's URL change was undone"))
  }

}

export class UpdateTabUrlCommand implements Command<any> {

  constructor(
    public tab: Tab,
    public newUrl: string,
    public newName: string,
    public newDesc: string,
    public placeholders: string[] = [],
    public placeholderValues: Map<string,string> = new Map(),
    public extension: UrlExtension = UrlExtension.HTML
    ) {
  }

  async execute(): Promise<ExecutionResult<string>> {
    const oldUrl = this.tab.url || '';
    await TabsetService.setCustomTitle(this.tab, this.newName, this.newDesc)
    return TabsetService.setUrl(this.tab, this.newUrl, this.placeholders, this.placeholderValues, this.extension)
      .then(ignored => {
        if (this.tab.url) {
          useSearchStore().update(this.tab.url, 'url', this.newUrl)
        }
      })
      .then(ignored => Promise.resolve(
        new ExecutionResult(
          this.newUrl,
          "Tab updated",
          new UndoCommand(this.tab, oldUrl)))
      )
      .catch(err => Promise.reject(err))
  }

}

UpdateTabUrlCommand.prototype.toString = function cmdToString() {
  return `UpdateTabNameCommand: {tabId=${this.tab.id}, newUrl=${this.newUrl}, placeholders=${this.placeholders}, placeholderValues=${this.placeholderValues}}`;
};
