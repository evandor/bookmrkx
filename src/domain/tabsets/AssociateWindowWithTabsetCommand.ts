import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {useTabsetService} from "src/services/TabsetService2";
import {useTabsStore} from "stores/tabsStore";
import {STRIP_CHARS_IN_USER_INPUT} from "boot/constants";
import {useWindowsStore} from "src/stores/windowsStore";

export class AssociateWindowWithTabsetCommand implements Command<string> {

    public merge: boolean = true

    constructor(
        public tabsetId: string,
        public windowName: string ) {
    }

    async execute(): Promise<ExecutionResult<string>> {
        try {
            const trustedWindowName = this.windowName.replace(STRIP_CHARS_IN_USER_INPUT, '')
            const tabset = useTabsStore().getTabset(this.tabsetId)
            if (tabset) {
                tabset.window = trustedWindowName
                await useTabsetService().saveTabset(tabset)
                useWindowsStore().addToWindowSet(trustedWindowName)
                return Promise.resolve(new ExecutionResult<any>(tabset.id, "Window set to '"+trustedWindowName+"'"))
            } else {
                return Promise.reject("could not find tabset")
            }
        } catch (err) {
            return Promise.reject(err)
        }
    }
}

AssociateWindowWithTabsetCommand.prototype.toString = function cmdToString() {
    return `AssociateWindowWithTabsetCommand: {tabsetId=${this.tabsetId}, windowName=${this.windowName}}`;
};
