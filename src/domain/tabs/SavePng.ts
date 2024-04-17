import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {Tab} from "src/models/Tab";
import {usePermissionsStore} from "stores/permissionsStore";
import {useNotificationHandler} from "src/services/ErrorHandler";
import PdfService from "src/services/PdfService";
import TabsetService from "src/services/TabsetService";
import ContentUtils from "src/utils/ContentUtils";
import {BlobType} from "src/models/SavedBlob";

const {handleSuccess, handleError} = useNotificationHandler()

export class SavePngCommand implements Command<any> {

    public readonly chromeTabId: number | undefined;

    constructor(
        public tab: Tab,
        public remark: string | undefined = undefined) {
        this.chromeTabId = this.tab.url ? TabsetService.chromeTabIdFor(this.tab.url) : undefined
    }

    async execute(): Promise<ExecutionResult<any>> {
        if (!usePermissionsStore().hasPermission('pageCapture')) {
            handleError("missing permission pageCapture")
            return Promise.reject("xxx")
        }
        if (!this.chromeTabId) {
            return Promise.reject("could not find chromeTabId for tab")
        }
        console.log("capturing tab id", this.chromeTabId)

        chrome.tabs.sendMessage(
            this.chromeTabId || 0,
            "getContent",
            {},
            (res) => {
                console.log("getContent returned result with length", res?.content?.length, this.chromeTabId)
                let html = ContentUtils.setBaseHref(this.tab.url || '', res.content)
                return PdfService.screenshotFrom(html)
                    .then((res:any) => {
                        console.log("res", res, typeof res)
                        console.log("res2", typeof res.data)

                        PdfService.saveBlob(this.tab, res.data, BlobType.PNG, this.remark)


                        handleSuccess(
                            new ExecutionResult(
                                "done",
                                "Snapshot created"))
                    }).catch((err:any) => {
                        return handleError(err)
                    })


            })


        return Promise.resolve(
            new ExecutionResult("dummy", "this should not be called from UI"))

    }

}


SavePngCommand.prototype.toString = function cmdToString() {
    return `SavePngCommand: {tabId=${this.tab.id}, chromeTabId=${this.chromeTabId}}`;
};
