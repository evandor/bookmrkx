import Command from "src/core/domain/Command";
import {ExecutionResult} from "src/core/domain/ExecutionResult";
import {usePermissionsStore} from "src/stores/permissionsStore";
import {RevokePermissionCommand} from "src/domain/commands/RevokePermissionCommand";
import {useBookmarksStore} from "src/bookmarks/stores/bookmarksStore";
import ChromeBookmarkListeners from "src/services/ChromeBookmarkListeners";
import {useSuggestionsStore} from "src/suggestions/stores/suggestionsStore";
import {StaticSuggestionIdent} from "src/suggestions/models/Suggestion";

class UndoCommand implements Command<boolean> {

  constructor(public permission: string) {
  }

  execute(): Promise<ExecutionResult<boolean>> {
    console.log("execution undo command", this.permission)
    return new RevokePermissionCommand(this.permission).execute()
      .then(res => new ExecutionResult(true, "Permission was revoked again"))
  }

}

export class GrantPermissionCommand implements Command<boolean> {

  constructor(public permission: string) {
  }

  async execute(): Promise<ExecutionResult<boolean>> {
    return usePermissionsStore().grantPermission(this.permission)
      .then((granted: boolean) => {
        if (granted) {
          console.log("granted permission", this.permission)
          if ("bookmarks" === this.permission) {
            usePermissionsStore().activateFeature('bookmarks')
            useBookmarksStore().loadBookmarks()
              .then(() => {
                // TabsetService.init()
                ChromeBookmarkListeners.initListeners()
              })
            useSuggestionsStore().removeSuggestion(StaticSuggestionIdent.TRY_BOOKMARKS_FEATURE)
          } else if ("notifications" === this.permission) {
            usePermissionsStore().activateFeature('notifications')
          }
          return new ExecutionResult(
            granted,
            "Permission was added",
            new UndoCommand(this.permission))
        } else {
          console.log("permission was not granted", this.permission)
          usePermissionsStore().deactivateFeature(this.permission)
          return new ExecutionResult(granted, "Permission was not added")
        }
      })
  }

}

GrantPermissionCommand.prototype.toString = function cmdToString() {
  return `GrantPermissionCommand: {permission=${this.permission}}`;
};
