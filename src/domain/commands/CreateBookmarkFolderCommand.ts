import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import BookmarksService from "src/services/BookmarksService";

// class UndoCreateTabsetCommand implements Command<object> {
//
//   constructor(public tabsetId: string) {
//   }
//
//   execute(): Promise<ExecutionResult<object>> {
//     LoggingService.logger.info("execution of undo command", this.tabsetId)
//     return new DeleteTabsetCommand(this.tabsetId).execute()
//       .then(res => Promise.resolve(new ExecutionResult(res, "Tabset was deleted again")))
//   }
//
// }

export class CreateBookmarkFolderCommand implements Command<object> {

  public merge: boolean = true

  constructor(
    public folderName: string,
    public parentFolderId: string) {
  }

  async execute(): Promise<ExecutionResult<object>> {
    try {
      const result = BookmarksService.createBookmarkFolder(this.folderName, this.parentFolderId)
      let doneMsg = 'Folder ' + this.folderName + ' created successfully'
      const executionResult = new ExecutionResult(result, doneMsg)
      return Promise.resolve(executionResult)
    } catch (err) {
      return Promise.reject("err")
    }
  }
}

CreateBookmarkFolderCommand.prototype.toString = function cmdToString() {
  return `CreateBookmarkFolderCommand: {folderName=${this.folderName}, parentId=${this.parentFolderId}}`;
};
