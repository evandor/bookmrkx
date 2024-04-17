import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {useUiStore} from "stores/uiStore";

export class HideCurrentTabBoxCommand implements Command<string> {

    constructor(
        public hide: boolean) {
    }

    async execute(): Promise<ExecutionResult<string>> {
        useUiStore().hideCurrentTabBox(this.hide)
        return Promise.resolve(new ExecutionResult("done", ""))
    }
}

HideCurrentTabBoxCommand.prototype.toString = function cmdToString() {
    return `HideCurrentTabBoxCommand`;
};
