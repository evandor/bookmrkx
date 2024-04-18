import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {Suggestion, SuggestionState, SuggestionType} from "src/models/Suggestion";
import {useBookmarksStore} from "src/bookmarks/stores/bookmarksStore";
import {useSuggestionsStore} from "stores/suggestionsStore";
import {useUtils} from "src/services/Utils";
import NavigationService from "src/services/NavigationService";
import {useTabsStore} from "stores/tabsStore";
import {useTabsetService} from "src/services/TabsetService2";

const {sendMsg} = useUtils()

export class ApplySuggestionCommand implements Command<any> {

  constructor(public suggestion: Suggestion) {
  }

  async execute(): Promise<ExecutionResult<any>> {
    switch (this.suggestion.type) {
      case SuggestionType.REDIRECT_HAPPENED_FOR_BOOKMARK: //'REDIRECT_HAPPENED_FOR_BOOKMARK':
        useBookmarksStore().updateUrl(
          this.suggestion.data['url' as keyof object],
          this.suggestion.data['location' as keyof object])
        return useSuggestionsStore().applySuggestion(this.suggestion.id)
          .then((res: Suggestion) => {
            sendMsg("reload-suggestions", {})
            return Promise.resolve(new ExecutionResult("", "The suggestion has been applied"))
          })
          .catch((err) => Promise.reject("Problem applying suggestion: " + err))
      case SuggestionType.REDIRECT_HAPPENED_FOR_TAB: //'REDIRECT_HAPPENED_FOR_BOOKMARK':
        const tabsWithUrl = useTabsStore().tabsForUrl(this.suggestion.data['url' as keyof object])
        tabsWithUrl.forEach(tab => {
          tab.url = this.suggestion.data['location' as keyof object]
          const d = useTabsStore().getTabAndTabsetId(tab.id)
          console.log("updating tab's url to", tab.url, d)
          if (d && d.tabsetId) {
            const tabset = useTabsetService().getTabset(d.tabsetId)
            if (tabset) {
              useTabsetService().saveTabset(tabset)
            }
          }
        })
        return useSuggestionsStore().applySuggestion(this.suggestion.id)
          .then((res: Suggestion) => {
            sendMsg("reload-suggestions", {})
            sendMsg("reload-tabset", {})
            return Promise.resolve(new ExecutionResult("", "The suggestion has been applied"))
          })
          .catch((err) => Promise.reject("Problem applying suggestion: " + err))
      case SuggestionType.FEATURE:
        if (this.suggestion.url) {
          NavigationService.openOrCreateTab([this.suggestion.url])
          // a feature suggestion should not appear again
          useSuggestionsStore().updateSuggestionState(this.suggestion.id, SuggestionState.CHECKED)
        }
      case SuggestionType.URL:
        if (this.suggestion.url) {
          NavigationService.openOrCreateTab([this.suggestion.url])
          // an url suggestion should not appear again
          useSuggestionsStore().updateSuggestionState(this.suggestion.id, SuggestionState.CHECKED)
        }
      default:
        return Promise.reject("unknown suggestion type: " + this.suggestion.type)
    }
  }


}

ApplySuggestionCommand.prototype.toString = function cmdToString() {
  return `ApplySuggestionCommand: {suggestion=${this.suggestion.toString()}}`;
};
