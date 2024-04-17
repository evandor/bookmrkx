import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {Suggestion, SuggestionState} from "src/models/Suggestion";
import {useSuggestionsStore} from "stores/suggestionsStore";
import {useUtils} from "src/services/Utils";

const {sendMsg} = useUtils()

export class IgnoreSuggestionCommand implements Command<any> {

    constructor(public suggestion: Suggestion) {
    }

    async execute(): Promise<ExecutionResult<any>> {
        return useSuggestionsStore().updateSuggestionState(this.suggestion.id, SuggestionState.IGNORED)
            .then(() => {
                sendMsg("reload-suggestions", {})
            })
            .then(() => {
                return Promise.resolve(
                    new ExecutionResult("", "The suggestion has been ignored")
                )
            })
            .catch((err) => {
                return Promise.reject("Problem applying suggestion: " + err)
            })
    }


}

IgnoreSuggestionCommand.prototype.toString = function cmdToString() {
    return `IgnoreSuggestionCommand: {suggestion=${this.suggestion.toString()}}`;
};
