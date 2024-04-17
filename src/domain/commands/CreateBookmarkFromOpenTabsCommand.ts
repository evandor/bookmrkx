import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {Tab} from "src/models/Tab";





export class CreateBookmarkFromOpenTabsCommand implements Command<any> {

  constructor(public tab: Tab, public newIndex: number, public parentBookmark: string) {
  }

  async execute(): Promise<ExecutionResult<any>> {
    //TabLogger.info(this.tab, 'adding tab by d&d, group ' + )
    console.log("adding", this.tab, this.newIndex, this.parentBookmark)
    let useIndex = this.newIndex

    const newBookmark = {
      parentId: this.parentBookmark,
      index: useIndex,
      title: this.tab.title,
      url: this.tab.url
    }
    console.log("newBookmark", newBookmark)
    // @ts-ignore
    const res:chrome.bookmarks.BookmarkTreeNode = await chrome.bookmarks.create(newBookmark)

    return new ExecutionResult(
        res,
        "Bookmark was added")
  }


}

CreateBookmarkFromOpenTabsCommand.prototype.toString = function cmdToString() {
  return `CreateBookmarkFromOpenTabsCommand: {tab=${this.tab.toString()}, parent=${this.parentBookmark}}`;
};
