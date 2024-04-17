import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {SaveOrReplaceResult} from "src/models/SaveOrReplaceResult";
import {useUtils} from "src/services/Utils";
import {usePermissionsStore} from "stores/permissionsStore";
import {FeatureIdent} from "src/models/AppFeature";
import {useSuggestionsStore} from "stores/suggestionsStore";
import {StaticSuggestionIdent, Suggestion} from "src/models/Suggestion";
import Analytics from "src/utils/google-analytics";
import {useWindowsStore} from "src/stores/windowsStore";
import {STRIP_CHARS_IN_USER_INPUT} from "boot/constants";
import {TabsetType} from "src/models/Tabset";

const {sendMsg} = useUtils()

export class CreateTabsetCommand implements Command<SaveOrReplaceResult> {

    public merge: boolean = true

    constructor(
        public tabsetName: string,
        public tabsToUse: chrome.tabs.Tab[],
        public windowToOpen: string = 'current',
        public color: string | undefined = undefined) {
    }

    async execute(): Promise<ExecutionResult<SaveOrReplaceResult>> {
      return Promise.reject("not implemented")
    }
}

CreateTabsetCommand.prototype.toString = function cmdToString() {
    return `CreateTabsetCommand: {merge=${this.merge}, tabsetName=${this.tabsetName}, tabs#=${this.tabsToUse.length}, windowToOpen#=${this.windowToOpen}}`;
};
